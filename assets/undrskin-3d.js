/**
 * UNDRSKIN 3D SHOPIFY THEME INTEGRATION SCRIPT (assets/undrskin-3d.js)
 * Production-ready Section-Scoped WebGL Engine & Variant Handler
 */

(function () {
  'use strict';

  function initUndrskin3DSection(container) {
    if (!container || container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    var canvas = container.querySelector('.undrskin-3d-canvas');
    var explodedBtn = container.querySelector('.undrskin-exploded-btn');
    var explodedModal = container.querySelector('.undrskin-exploded-modal');
    var explodedCloseBtn = container.querySelector('.undrskin-exploded-close');
    var addToBagBtn = container.querySelector('.undrskin-add-to-bag-btn');
    var form = container.querySelector('.undrskin-variant-form');

    // Parse Shopify variants JSON data
    var variantsData = [];
    var variantsScript = container.querySelector('[data-product-variants-json]');
    if (variantsScript) {
      try {
        variantsData = JSON.parse(variantsScript.textContent);
      } catch (e) {
        console.warn('[UndrSkin 3D] Could not parse variants JSON:', e);
      }
    }

    /* --------------------------------------------------------------------------
       1. THREE.JS 3D WEBGL ENGINE
       -------------------------------------------------------------------------- */
    if (canvas && typeof THREE !== 'undefined') {
      setupThreeJSStage(canvas, container);
    }

    function setupThreeJSStage(canvasEl, sectionEl) {
      var renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(35, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100);
      camera.position.z = 5.5;

      // Lights
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      var dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(5, 10, 7);
      scene.add(dirLight);

      var fillLight = new THREE.DirectionalLight(0xe2bc97, 0.5);
      fillLight.position.set(-5, -2, -4);
      scene.add(fillLight);

      // Create Garment Mesh Plane with Procedural Shaders
      var geo = new THREE.PlaneGeometry(3.6, 2.4, 44, 32);

      // Shader Materials & Uniforms
      var uni = {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uColorA: { value: new THREE.Color(0xb97073) },
        uColorB: { value: new THREE.Color(0x7e1626) },
        uExplode: { value: 0 }
      };

      var vertShader = [
        'uniform float uTime;',
        'uniform float uExplode;',
        'uniform vec2 uPointer;',
        'varying vec2 vUv;',
        'varying float vDisplace;',
        'void main() {',
        '  vUv = uv;',
        '  vec3 pos = position;',
        '  float wave = sin(pos.x * 2.5 + uTime * 1.5) * cos(pos.y * 2.0 + uTime * 1.2) * 0.12;',
        '  pos.z += wave;',
        '  pos.z += sin(length(pos.xy - uPointer) * 3.0) * 0.08;',
        '  vDisplace = wave;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
        '}'
      ].join('\n');

      var fragShader = [
        'uniform vec3 uColorA;',
        'uniform vec3 uColorB;',
        'uniform float uExplode;',
        'varying vec2 vUv;',
        'varying float vDisplace;',
        'void main() {',
        '  vec3 col = mix(uColorA, uColorB, vUv.y + vDisplace * 0.5);',
        '  float rim = 1.0 - max(0.0, dot(vec3(0.0, 0.0, 1.0), vec3(vUv, 1.0)));',
        '  col += vec3(0.15) * pow(rim, 3.0);',
        '  gl_FragColor = vec4(col, 0.96);',
        '}'
      ].join('\n');

      var mat = new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: fragShader,
        uniforms: uni,
        transparent: true,
        side: THREE.DoubleSide
      });

      var mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // Interactive Rotation Dragging & Touch
      var isDragging = false;
      var previousMousePosition = { x: 0, y: 0 };
      var targetRotation = { x: 0, y: 0 };

      function onPointerDown(e) {
        isDragging = true;
        previousMousePosition = {
          x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
          y: e.clientY || (e.touches && e.touches[0].clientY) || 0
        };
      }

      function onPointerMove(e) {
        var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        var clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        // Update Shader Pointer Uniform
        var rect = canvasEl.getBoundingClientRect();
        uni.uPointer.value.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        uni.uPointer.value.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        if (!isDragging) return;

        var deltaX = clientX - previousMousePosition.x;
        var deltaY = clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.008;
        targetRotation.x += deltaY * 0.008;

        previousMousePosition = { x: clientX, y: clientY };
      }

      function onPointerUp() {
        isDragging = false;
      }

      canvasEl.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      canvasEl.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      // Resize Handling
      function onWindowResize() {
        if (!canvasEl) return;
        var width = canvasEl.clientWidth;
        var height = canvasEl.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      window.addEventListener('resize', onWindowResize);

      // Animation Render Loop
      var clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        var elapsedTime = clock.getElapsedTime();
        uni.uTime.value = elapsedTime;

        // Smooth Rotation Dampening
        mesh.rotation.y += (targetRotation.y - mesh.rotation.y) * 0.08;
        mesh.rotation.x += (targetRotation.x - mesh.rotation.x) * 0.08;

        renderer.render(scene, camera);
      }
      animate();

      // Listen for Color Swatch Change
      sectionEl.addEventListener('undrskin:color-change', function (e) {
        if (e.detail && e.detail.hex) {
          var newColor = new THREE.Color(e.detail.hex);
          uni.uColorA.value = newColor;
        }
      });
    }

    /* --------------------------------------------------------------------------
       2. EXPLODED COMPONENT VIEW TRIGGER (👁 Button & Modal)
       -------------------------------------------------------------------------- */
    if (explodedBtn && explodedModal) {
      explodedBtn.addEventListener('click', function () {
        explodedModal.classList.add('is-open');
      });
    }

    if (explodedCloseBtn && explodedModal) {
      explodedCloseBtn.addEventListener('click', function () {
        explodedModal.classList.remove('is-open');
      });
    }

    /* --------------------------------------------------------------------------
       3. SHOPIFY VARIANT SELECTION & ADD TO BAG API
       -------------------------------------------------------------------------- */
    var colorSwatches = container.querySelectorAll('.undrskin-swatch-btn');
    var sizeBtns = container.querySelectorAll('.undrskin-size-btn');
    var selectedVariantInput = container.querySelector('[name="id"]');

    function updateSelectedVariant() {
      var activeColor = container.querySelector('.undrskin-swatch-btn.is-active');
      var activeSize = container.querySelector('.undrskin-size-btn.is-active');

      var colorVal = activeColor ? activeColor.dataset.value : null;
      var sizeVal = activeSize ? activeSize.dataset.value : null;

      if (!colorVal || !sizeVal || !variantsData.length) return;

      var matchedVariant = variantsData.find(function (v) {
        var optionsStr = v.options ? v.options.join(' ').toLowerCase() : '';
        return optionsStr.indexOf(colorVal.toLowerCase()) !== -1 && optionsStr.indexOf(sizeVal.toLowerCase()) !== -1;
      });

      if (matchedVariant) {
        if (selectedVariantInput) selectedVariantInput.value = matchedVariant.id;

        // Update Price Display
        var priceEl = container.querySelector('.undrskin-price');
        if (priceEl && matchedVariant.price) {
          priceEl.textContent = formatMoney(matchedVariant.price);
        }

        // Update Availability & Button State
        if (addToBagBtn) {
          if (matchedVariant.available) {
            addToBagBtn.disabled = false;
            addToBagBtn.textContent = 'ADD TO BAG';
          } else {
            addToBagBtn.disabled = true;
            addToBagBtn.textContent = 'SOLD OUT';
          }
        }
      }
    }

    // Color Swatch Click Event
    colorSwatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        colorSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        swatch.classList.add('is-active');

        // Dispatch color-change event to Three.js
        var hex = swatch.dataset.hex;
        container.dispatchEvent(new CustomEvent('undrskin:color-change', {
          detail: { color: swatch.dataset.value, hex: hex },
          bubbles: true
        }));

        updateSelectedVariant();
      });
    });

    // Size Button Click Event
    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        updateSelectedVariant();
      });
    });

    // Add to Bag AJAX Cart Submission
    if (form && addToBagBtn) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var variantId = selectedVariantInput ? selectedVariantInput.value : null;
        if (!variantId) return;

        addToBagBtn.disabled = true;
        addToBagBtn.innerHTML = '<span>ADDING...</span>';

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            items: [{ id: parseInt(variantId, 10), quantity: 1 }]
          })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            addToBagBtn.innerHTML = '<span>ADDED TO BAG! ✓</span>';
            setTimeout(function () {
              addToBagBtn.disabled = false;
              addToBagBtn.innerHTML = '<span>ADD TO BAG</span>';
            }, 2200);

            // Trigger Shopify Theme Cart Drawer refresh event if available
            document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
          })
          .catch(function (err) {
            console.error('[UndrSkin 3D] Cart Add Error:', err);
            addToBagBtn.disabled = false;
            addToBagBtn.innerHTML = '<span>ADD TO BAG</span>';
          });
      });
    }

    /* --------------------------------------------------------------------------
       4. MOBILE ACCORDION MODULE FOR EDITORIAL CARDS
       -------------------------------------------------------------------------- */
    var accordionHeaders = container.querySelectorAll('.undrskin-accordion-header');
    accordionHeaders.forEach(function (header) {
      header.addEventListener('click', function () {
        var item = header.closest('.undrskin-accordion-item');
        if (!item) return;

        var isActive = item.classList.contains('is-active');

        // Close siblings
        var allItems = container.querySelectorAll('.undrskin-accordion-item');
        allItems.forEach(function (ai) { ai.classList.remove('is-active'); });

        if (!isActive) {
          item.classList.add('is-active');
        }
      });
    });

    function formatMoney(cents) {
      if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
        return Shopify.formatMoney(cents);
      }
      return '₹' + (cents / 100).toFixed(0);
    }
  }

  // Initialize section on DOMReady
  document.addEventListener('DOMContentLoaded', function () {
    var sections = document.querySelectorAll('.undrskin-3d-product');
    sections.forEach(initUndrskin3DSection);
  });

  // Support Shopify Theme Editor Section Load Events
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector('.undrskin-3d-product')) {
      initUndrskin3DSection(e.target.querySelector('.undrskin-3d-product'));
    }
  });

})();
