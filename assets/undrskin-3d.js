/**
 * UNDRSKIN REAL 3D GLTF PRODUCT VIEWER (assets/undrskin-3d.js)
 * Exclusively loads real GLTF/GLB models via THREE.GLTFLoader.
 * Pure GLTF scene hierarchy rendering.
 */

(function () {
  'use strict';

  function initUndrskin3DSection(container) {
    if (!container || container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    var canvas = container.querySelector('.undrskin-3d-canvas');
    var fallbackImg = container.querySelector('.undrskin-fallback-image');
    var explodedBtn = container.querySelector('.undrskin-exploded-btn');
    var explodedModal = container.querySelector('.undrskin-exploded-modal');
    var explodedCloseBtn = container.querySelector('.undrskin-exploded-close');
    var addToBagBtn = container.querySelector('.undrskin-add-to-bag-btn');
    var form = container.querySelector('.undrskin-variant-form');
    var rotateControlBtn = container.querySelector('[data-control="rotate"]');
    var zoomInControlBtn = container.querySelector('[data-control="zoom-in"]');
    var zoomOutControlBtn = container.querySelector('[data-control="zoom-out"]');
    var resetControlBtn = container.querySelector('[data-control="reset"]');

    var modelUrl = container.dataset.modelUrl || '';
    var variantsData = [];
    var variantsScript = container.querySelector('[data-product-variants-json]');
    if (variantsScript) {
      try {
        variantsData = JSON.parse(variantsScript.textContent);
      } catch (e) {
        console.warn('[UndrSkin 3D] Could not parse variants JSON:', e);
      }
    }

    var threeState = null;

    /* --------------------------------------------------------------------------
       1. REAL THREE.JS GLTFLOADER ENGINE
       -------------------------------------------------------------------------- */
    if (canvas && typeof THREE !== 'undefined') {
      threeState = setupGLTFEngine(canvas, container, modelUrl, fallbackImg);
    } else if (fallbackImg) {
      fallbackImg.classList.add('is-visible');
    }

    function setupGLTFEngine(canvasEl, sectionEl, glbUrl, fallbackEl) {
      var renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
      if (THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(35, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 5.5);

      // Lighting Setup
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      var mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(5, 8, 5);
      scene.add(mainLight);

      var fillLight = new THREE.DirectionalLight(0xe2bc97, 0.4);
      fillLight.position.set(-5, -2, -4);
      scene.add(fillLight);

      var productGroup = new THREE.Group();
      scene.add(productGroup);

      var loadedModel = null;
      var meshComponents = [];
      var isExploded = false;

      // STRICT REQUIREMENT: Exclusively use THREE.GLTFLoader for GLB assets
      if (glbUrl && typeof THREE.GLTFLoader !== 'undefined') {
        var loader = new THREE.GLTFLoader();
        loader.load(
          glbUrl,
          function (gltf) {
            loadedModel = gltf.scene;

            // Automatically Calculate Bounding Box, Center, and Scale
            var box = new THREE.Box3().setFromObject(loadedModel);
            var center = box.getCenter(new THREE.Vector3());
            loadedModel.position.sub(center);

            var size = box.getSize(new THREE.Vector3());
            var maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              var scale = 2.4 / maxDim;
              loadedModel.scale.set(scale, scale, scale);
            }

            // Traverse & Index Actual Named GLB Meshes Only
            loadedModel.traverse(function (child) {
              if (child.isMesh) {
                child.userData.origPosition = child.position.clone();
                if (child.material) {
                  child.userData.origMaterial = child.material;
                }
                meshComponents.push(child);
              }
            });

            productGroup.add(loadedModel);
            if (fallbackEl) fallbackEl.classList.remove('is-visible');
          },
          undefined,
          function (err) {
            console.warn('[UndrSkin 3D] GLB model failed to load. Falling back to product image:', err);
            if (fallbackEl) fallbackEl.classList.add('is-visible');
          }
        );
      } else {
        // STRICT REQUIREMENT: If GLB is missing, show fallback image directly. NO FAKE MESHES!
        if (fallbackEl) fallbackEl.classList.add('is-visible');
      }

      // Touch & Mouse Rotation Dragging (Isolated to Canvas)
      var isDragging = false;
      var previousPosition = { x: 0, y: 0 };
      var targetRotation = { x: 0, y: 0 };
      var targetZoom = 5.5;

      function onPointerDown(e) {
        isDragging = true;
        previousPosition = {
          x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
          y: e.clientY || (e.touches && e.touches[0].clientY) || 0
        };
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        var clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        var deltaX = clientX - previousPosition.x;
        var deltaY = clientY - previousPosition.y;

        targetRotation.y += deltaX * 0.008;
        targetRotation.x += deltaY * 0.008;

        previousPosition = { x: clientX, y: clientY };
      }

      function onPointerUp() {
        isDragging = false;
      }

      function onWheel(e) {
        e.preventDefault();
        targetZoom += e.deltaY * 0.003;
        targetZoom = Math.max(3.0, Math.min(8.0, targetZoom));
      }

      canvasEl.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      canvasEl.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
      canvasEl.addEventListener('wheel', onWheel, { passive: false });

      // Resize Listener
      function onWindowResize() {
        if (!canvasEl) return;
        var width = canvasEl.clientWidth;
        var height = canvasEl.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      window.addEventListener('resize', onWindowResize);

      // Render Loop & IntersectionObserver Offscreen Pause
      var animFrameId = null;
      var isVisible = true;

      var observer = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      });
      observer.observe(canvasEl);

      function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        productGroup.rotation.y += (targetRotation.y - productGroup.rotation.y) * 0.08;
        productGroup.rotation.x += (targetRotation.x - productGroup.rotation.x) * 0.08;
        camera.position.z += (targetZoom - camera.position.z) * 0.08;

        renderer.render(scene, camera);
      }
      animate();

      // Controls Bar Events
      if (rotateControlBtn) {
        rotateControlBtn.addEventListener('click', function () {
          targetRotation.y += Math.PI / 2;
        });
      }

      if (zoomInControlBtn) {
        zoomInControlBtn.addEventListener('click', function () {
          targetZoom = Math.max(3.0, targetZoom - 0.8);
        });
      }

      if (zoomOutControlBtn) {
        zoomOutControlBtn.addEventListener('click', function () {
          targetZoom = Math.min(8.0, targetZoom + 0.8);
        });
      }

      if (resetControlBtn) {
        resetControlBtn.addEventListener('click', function () {
          targetRotation.x = 0;
          targetRotation.y = 0;
          targetZoom = 5.5;
        });
      }

      return {
        scene: scene,
        renderer: renderer,
        productGroup: productGroup,
        meshComponents: meshComponents,
        setMeshColor: function (hexColor) {
          var color = new THREE.Color(hexColor);
          // Modifies ONLY the materials of actual GLB meshes
          meshComponents.forEach(function (child) {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(function (m) { m.color.set(color); });
              } else {
                child.material = child.material.clone();
                child.material.color.set(color);
              }
            }
          });
        },
        toggleExplodeView: function (shouldExplode) {
          isExploded = shouldExplode;
          if (!meshComponents.length) return;

          meshComponents.forEach(function (child, idx) {
            var origPos = child.userData.origPosition || new THREE.Vector3();
            if (shouldExplode) {
              var offset = new THREE.Vector3(0, (idx + 1) * 0.35, 0);
              child.position.copy(origPos.clone().add(offset));
            } else {
              child.position.copy(origPos);
            }
          });
        },
        destroy: function () {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          window.removeEventListener('resize', onWindowResize);
          window.removeEventListener('mousemove', onPointerMove);
          window.removeEventListener('mouseup', onPointerUp);
          window.removeEventListener('touchmove', onPointerMove);
          window.removeEventListener('touchend', onPointerUp);
          observer.disconnect();
          renderer.dispose();
        }
      };
    }

    /* --------------------------------------------------------------------------
       2. EXPLODED VIEW TRIGGER (👁 Button & Modal)
       -------------------------------------------------------------------------- */
    if (explodedBtn && explodedModal) {
      explodedBtn.addEventListener('click', function () {
        explodedModal.classList.add('is-open');
        if (threeState) threeState.toggleExplodeView(true);
      });
    }

    if (explodedCloseBtn && explodedModal) {
      explodedCloseBtn.addEventListener('click', function () {
        explodedModal.classList.remove('is-open');
        if (threeState) threeState.toggleExplodeView(false);
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && explodedModal && explodedModal.classList.contains('is-open')) {
        explodedModal.classList.remove('is-open');
        if (threeState) threeState.toggleExplodeView(false);
      }
    });

    /* --------------------------------------------------------------------------
       3. VARIANT SELECTION & MESH COLOR UPDATES
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

        var priceEl = container.querySelector('.undrskin-price');
        if (priceEl && matchedVariant.price) {
          priceEl.textContent = formatMoney(matchedVariant.price);
        }

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

    colorSwatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        colorSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        swatch.classList.add('is-active');

        var hex = swatch.dataset.hex;
        if (threeState && hex) {
          threeState.setMeshColor(hex);
        }

        updateSelectedVariant();
      });
    });

    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        updateSelectedVariant();
      });
    });

    /* --------------------------------------------------------------------------
       4. SHOPIFY AJAX CART ADDITION (/cart/add.js)
       -------------------------------------------------------------------------- */
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
       5. MOBILE ACCORDION MODULE
       -------------------------------------------------------------------------- */
    var accordionHeaders = container.querySelectorAll('.undrskin-accordion-header');
    accordionHeaders.forEach(function (header) {
      header.addEventListener('click', function () {
        var item = header.closest('.undrskin-accordion-item');
        if (!item) return;

        var isActive = item.classList.contains('is-active');

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

    // Cleanup on Shopify Theme Editor Unload
    document.addEventListener('shopify:section:unload', function (e) {
      if (e.target && e.target.contains(container)) {
        if (threeState) threeState.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var sections = document.querySelectorAll('.undrskin-3d-product');
    sections.forEach(initUndrskin3DSection);
  });

  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector('.undrskin-3d-product')) {
      initUndrskin3DSection(e.target.querySelector('.undrskin-3d-product'));
    }
  });

})();
