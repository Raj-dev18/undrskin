/**
 * UNDRSKIN REUSABLE 3D SHOPIFY CLOTH ENGINE (assets/undrskin-3d.js)
 * Preserves the exact 3D visual engine, Three.js shaders, Base64 textures,
 * pointer drag interaction, colour wiping, and material inspection modal.
 */

(function () {
  'use strict';

  // Base64 WebP Textures from public/undrskin-3d-demo.html
  var TEX = {
    rose: 'data:image/webp;base64,UklGRmY6AABXRUJQVlA4WAoAAAAQAAAA5wMAqwIAQUxQSO4hAAAB/yckSPD/eGtEpO4jjtw2cqTusjZM2P8/OLqqNt4i+j8BY5+NI2LERxcf3PzjzG6XgFYSRCNd0Ue36KJ76kYPPXLuoIeg3vIM5dRMz1FLjqUbleShjlxUke9cQwm0o4JyljwlQdbSbFUeOapABt1UY/Htw+nApyq4VGa6h5fDuG0bSXT673rumd1/REyATNZYTNYwY+zZ/QOpcrgOyyE4ksYJpwzP2fbrjh3PDlOpvQgic55uW1vkRtu2tY8zJIvBJNtlmSWzXVaZqywXXszMzMztq3Xd1L1b9y/gHmObmZnv+2ImZ8Z5Ho2MTAVkRngM3RARE0DHtjZFkvN9kZklJhc9Jk9LYMmWqwWwx7ABZmZmGmZmHrGGmaG5uzL+z8jIiCzpDGU5ETEBvm5tOzZX27Zl3fajkHKqklJUCKpGrFFJKsYwcw3etm1bc/f9YMp+pm0/c7Zt4zLqPPZ9e/AD7mPft/a0FhETwP+ybxYw63ezPAVQEPC+fy30l7cFQJv+BoAcMOsfUpAj97Fg+aUvENz50yiHflmHMFmR+nIMcB8YUc1T2vfTPHCAWADA/n/doXemUR7hAoD5fhkFDcQEYCLEqx8/7Sj+wh4PjcPfTj6PqnnB5QBsRNz43CbnOfovqgUrVvazhAD0KD6+DC953z4X09MU/ufNqMbx/jRFrAl0qO9+upyyDSsQJAFV1CeiARUlAHvREbB08j37GZ58QPt+Zcuzxi3hI9XLKhmqh+dM0OgXvodauoCpX0M2EBn5JS+flR9+muIIkgaG9vZ+PnM1zHKjQnkD0EFQ20oe/+AbYHwQ4Q4AeeuryAzoMTizAOi9b5gBdHQGwPsDusSOp+KzN6M1LFFJ2EwAmKN226sbnQHHViJYVMz3OwQbSBFg+rEF+cpH7zFy7nIFDZSqNLuIGqW0/nVqKwgEUe+//ccZBif9VaklAUh9AtJAKhr6wpsmv/ZSRnQvkKhYnCE1KsQP4laXSHlVCgR3/kthYtI73UqYOQDz7T0zATEx6sJHnjHk01tzACkCwQZqG/j0SlKTzC8RQ+1q5Q2AyxE8JkBLnttP4/BOVDsAVKpllxnQo/DIkoulTz8dXNgyxT3Agqi9/GRGo5X60zTdVMkQe+S9P6ju6r9RzSpWUYtNAwYkB1h+atlDOvH+w4wcC0w01h9plPqrR1HTahWQAGSobp0ncdO7hyrhLCBrj8kKIqO+9V6A83cojANWJBqvz6IGZel515ONiWiVAligumOQwoE3ZlIaKQPIXcW8WlzBNNCjeNGQ3/n4OmRnAkCMgDINjNHHRYPFCcs1fsLmAWQOQYl+zqsDFLRzG4KZq8irVRWsoE/hyvmpgde+dcmFKOwDZmIcJ2/WDxj3FnCI3fblEACtn4J4RqhFpBF8yNArz8y64PnbjOwOSIzv+UOuxqg/fR2NuWgzAWCO4PjSUQpY8spAINa5kFlrJ6gop8Q3vHZ24OoRCmMasFAw7pUOfshDc9LGaz2bHLVWBjoIH/aAOPHzaxMVcegAajsheWvJhFCUcoY+sscF8kOfuzNkX6Cw7wMhMEmTztIgVmeeJk6tTJWMSN3x5lZnAMr1m0JALtbI1DqRaUjO0OunByzdfdcCO48+YMZEXpiKagr8gMmvGtU41G6eaQDEPZ/uQKN0dbJWhaSiWDTqrVcuupAvvmR1YDAN0TAxwc23n8itKYkXoImXrlIBFq undesirable',
    wine: 'data:image/webp;base64,UklGRpaKAABXRUJQVlA4WAoAAAAQAAAA5wMAqwIAQUxQSO4hAAAB/yckSPD/eGtEpO4jjtw2cqTusjZM2P8/OLqqNt4i+j8BY5+NI2LERxcf3PzjzG6XgFYSRCNd0Ue36KJ76kYPPXLuoIeg3vIM5dRMz1FLjqUbleShjlxUke9cQwm0o4JyljwlQdbSbFUeOapABt1UY/Htw+nApyq4VGa6h5fDuG0bSXT673rumd1/REyATNZYTNYwY+zZ/QOpcrgOyyE4ksYJpwzP2fbrjh3PDlOpvQgic55uW1vkRtu2tY8zJIvBJNtlmSWzXVaZqywXXszMzMztq3Xd1L1b9y/gHmObmZnv+2ImZ8Z5Ho2MTAVkRngM3RARE0DHtjZFkvN9kZklJhc9Jk9LYMmWqwWwx7ABZmZmGmZmHrGGmaG5uzL+z8jIiCzpDGU5ETEBvm5tOzZX27Zl3fajkHKqklJUCKpGrFFJKsYwcw3etm1bc/f9YMp+pm0/c7Zt4zLqPPZ9e/AD7mPft/a0FhETwP+ybxYw63ezPAVQEPC+fy30l7cFQJv+BoAcMOsfUpAj97Fg+aUvENz50yiHflmHMFmR+nIMcB8YUc1T2vfTPHCAWADA/n/doXemUR7hAoD5fhkFDcQEYCLEqx8/7Sj+wh4PjcPfTj6PqnnB5QBsRNz43CbnOfovqgUrVvazhAD0KD6+DC953z4X09MU/ufNqMbx/jRFrAl0qO9+upyyDSsQJAFV1CeiARUlAHvREbB08j37GZ58QPt+Zcuzxi3hI9XLKhmqh+dM0OgXvodauoCpX0M2EBn5JS+flR9+muIIkgaG9vZ+PnM1zHKjQnkD0EFQ20oe/+AbYHwQ4Q4AeeuryAzoMTizAOi9b5gBdHQGwPsDusSOp+KzN6M1LFFJ2EwAmKN226sbnQHHViJYVMz3OwQbSBFg+rEF+cpH7zFy7nIFDZSqNLuIGqW0/nVqKwgEUe+//ccZBif9VaklAUh9AtJAKhr6wpsmv/ZSRnQvkKhYnCE1KsQP4laXSHlVCgR3/kthYtI73UqYOQDz7T0zATEx6sJHnjHk01tzACkCwQZqG/j0SlKTzC8RQ+1q5Q2AyxE8JkBLnttP4/BOVDsAVKpllxnQo/DIkoulTz8dXNgyxT3Agqi9/GRGo5X60zTdVMkQe+S9P6ju6r9RzSpWUYtNAwYkB1h+atlDOvH+w4wcC0w01h9plPqrR1HTahWQAGSobp0ncdO7hyrhLCBrj8kKIqO+9V6A83cojANWJBqvz6IGZel515ONiWiVAligumOQwoE3ZlIaKQPIXcW8WlzBNNCjeNGQ3/n4OmRnAkCMgDINjNHHRYPFCcs1fsLmAWQOQYl+zqsDFLRzG4KZq8irVRWsoE/hyvmpgde+dcmFKOwDZmIcJ2/WDxj3FnCI3fblEACtn4J4RqhFpBF8yNArz8y64PnbjOwOSIzv+UOuxqg/fR2NuWgzAWCO4PjSUQpY8spAINa5kFlrJ6gop8Q3vHZ24OoRCmMasFAw7pUOfshDc9LGaz2bHLVWBjoIH/aAOPHzaxMVcegAajsheWvJhFCUcoY+sscF8kOfuzNkX6Cw7wMhMEmTztIgVmeeJk6tTJWMSN3x5lZnAMr1m0JALtbI1DqRaUjO0OunByzdfdcCO48+YMZEXpiKagr8gMmvGtU41G6eaQDEPZ/uQKN0dbJWhaSiWDTqrVcuupAvvmR1YDAN0TAxwc23n8itKYkXoImXrlIBFq undesirable',
    black: 'data:image/webp;base64,UklGRpaKAABXRUJQVlA4WAoAAAAQAAAA5wMAqwIAQUxQSO4hAAAB/yckSPD/eGtEpO4jjtw2cqTusjZM2P8/OLqqNt4i+j8BY5+NI2LERxcf3PzjzG6XgFYSRCNd0Ue36KJ76kYPPXLuoIeg3vIM5dRMz1FLjqUbleShjlxUke9cQwm0o4JyljwlQdbSbFUeOapABt1UY/Htw+nApyq4VGa6h5fDuG0bSXT673rumd1/REyATNZYTNYwY+zZ/QOpcrgOyyE4ksYJpwzP2fbrjh3PDlOpvQgic55uW1vkRtu2tY8zJIvBJNtlmSWzXVaZqywXXszMzMztq3Xd1L1b9y/gHmObmZnv+2ImZ8Z5Ho2MTAVkRngM3RARE0DHtjZFkvN9kZklJhc9Jk9LYMmWqwWwx7ABZmZmGmZmHrGGmaG5uzL+z8jIiCzpDGU5ETEBvm5tOzZX27Zl3fajkHKqklJUCKpGrFFJKsYwcw3etm1bc/f9YMp+pm0/c7Zt4zLqPPZ9e/AD7mPft/a0FhETwP+ybxYw63ezPAVQEPC+fy30l7cFQJv+BoAcMOsfUpAj97Fg+aUvENz50yiHflmHMFmR+nIMcB8YUc1T2vfTPHCAWADA/n/doXemUR7hAoD5fhkFDcQEYCLEqx8/7Sj+wh4PjcPfTj6PqnnB5QBsRNz43CbnOfovqgUrVvazhAD0KD6+DC953z4X09MU/ufNqMbx/jRFrAl0qO9+upyyDSsQJAFV1CeiARUlAHvREbB08j37GZ58QPt+Zcuzxi3hI9XLKhmqh+dM0OgXvodauoCpX0M2EBn5JS+flR9+muIIkgaG9vZ+PnM1zHKjQnkD0EFQ20oe/+AbYHwQ4Q4AeeuryAzoMTizAOi9b5gBdHQGwPsDusSOp+KzN6M1LFFJ2EwAmKN226sbnQHHViJYVMz3OwQbSBFg+rEF+cpH7zFy7nIFDZSqNLuIGqW0/nVqKwgEUe+//ccZBif9VaklAUh9AtJAKhr6wpsmv/ZSRnQvkKhYnCE1KsQP4laXSHlVCgR3/kthYtI73UqYOQDz7T0zATEx6sJHnjHk01tzACkCwQZqG/j0SlKTzC8RQ+1q5Q2AyxE8JkBLnttP4/BOVDsAVKpllxnQo/DIkoulTz8dXNgyxT3Agqi9/GRGo5X60zTdVMkQe+S9P6ju6r9RzSpWUYtNAwYkB1h+atlDOvH+w4wcC0w01h9plPqrR1HTahWQAGSobp0ncdO7hyrhLCBrj8kKIqO+9V6A83cojANWJBqvz6IGZel515ONiWiVAligumOQwoE3ZlIaKQPIXcW8WlzBNNCjeNGQ3/n4OmRnAkCMgDINjNHHRYPFCcs1fsLmAWQOQYl+zqsDFLRzG4KZq8irVRWsoE/hyvmpgde+dcmFKOwDZmIcJ2/WDxj3FnCI3fblEACtn4J4RqhFpBF8yNArz8y64PnbjOwOSIzv+UOuxqg/fR2NuWgzAWCO4PjSUQpY8spAINa5kFlrJ6gop8Q3vHZ24OoRCmMasFAw7pUOfshDc9LGaz2bHLVWBjoIH/aAOPHzaxMVcegAajsheWvJhFCUcoY+sscF8kOfuzNkX6Cw7wMhMEmTztIgVmeeJk6tTJWMSN3x5lZnAMr1m0JALtbI1DqRaUjO0OunByzdfdcCO48+YMZEXpiKagr8gMmvGtU41G6eaQDEPZ/uQKN0dbJWhaSiWDTqrVcuupAvvmR1YDAN0TAxwc23n8itKYkXoImXrlIBFq undesirable',
    sand: 'data:image/webp;base64,UklGRpaKAABXRUJQVlA4WAoAAAAQAAAA5wMAqwIAQUxQSO4hAAAB/yckSPD/eGtEpO4jjtw2cqTusjZM2P8/OLqqNt4i+j8BY5+NI2LERxcf3PzjzG6XgFYSRCNd0Ue36KJ76kYPPXLuoIeg3vIM5dRMz1FLjqUbleShjlxUke9cQwm0o4JyljwlQdbSbFUeOapABt1UY/Htw+nApyq4VGa6h5fDuG0bSXT673rumd1/REyATNZYTNYwY+zZ/QOpcrgOyyE4ksYJpwzP2fbrjh3PDlOpvQgic55uW1vkRtu2tY8zJIvBJNtlmSWzXVaZqywXXszMzMztq3Xd1L1b9y/gHmObmZnv+2ImZ8Z5Ho2MTAVkRngM3RARE0DHtjZFkvN9kZklJhc9Jk9LYMmWqwWwx7ABZmZmGmZmHrGGmaG5uzL+z8jIiCzpDGU5ETEBvm5tOzZX27Zl3fajkHKqklJUCKpGrFFJKsYwcw3etm1bc/f9YMp+pm0/c7Zt4zLqPPZ9e/AD7mPft/a0FhETwP+ybxYw63ezPAVQEPC+fy30l7cFQJv+BoAcMOsfUpAj97Fg+aUvENz50yiHflmHMFmR+nIMcB8YUc1T2vfTPHCAWADA/n/doXemUR7hAoD5fhkFDcQEYCLEqx8/7Sj+wh4PjcPfTj6PqnnB5QBsRNz43CbnOfovqgUrVvazhAD0KD6+DC953z4X09MU/ufNqMbx/jRFrAl0qO9+upyyDSsQJAFV1CeiARUlAHvREbB08j37GZ58QPt+Zcuzxi3hI9XLKhmqh+dM0OgXvodauoCpX0M2EBn5JS+flR9+muIIkgaG9vZ+PnM1zHKjQnkD0EFQ20oe/+AbYHwQ4Q4AeeuryAzoMTizAOi9b5gBdHQGwPsDusSOp+KzN6M1LFFJ2EwAmKN226sbnQHHViJYVMz3OwQbSBFg+rEF+cpH7zFy7nIFDZSqNLuIGqW0/nVqKwgEUe+//ccZBif9VaklAUh9AtJAKhr6wpsmv/ZSRnQvkKhYnCE1KsQP4laXSHlVCgR3/kthYtI73UqYOQDz7T0zATEx6sJHnjHk01tzACkCwQZqG/j0SlKTzC8RQ+1q5Q2AyxE8JkBLnttP4/BOVDsAVKpllxnQo/DIkoulTz8dXNgyxT3Agqi9/GRGo5X60zTdVMkQe+S9P6ju6r9RzSpWUYtNAwYkB1h+atlDOvH+w4wcC0w01h9plPqrR1HTahWQAGSobp0ncdO7hyrhLCBrj8kKIqO+9V6A83cojANWJBqvz6IGZel515ONiWiVAligumOQwoE3ZlIaKQPIXcW8WlzBNNCjeNGQ3/n4OmRnAkCMgDINjNHHRYPFCcs1fsLmAWQOQYl+zqsDFLRzG4KZq8irVRWsoE/hyvmpgde+dcmFKOwDZmIcJ2/WDxj3FnCI3fblEACtn4J4RqhFpBF8yNArz8y64PnbjOwOSIzv+UOuxqg/fR2NuWgzAWCO4PjSUQpY8spAINa5kFlrJ6gop8Q3vHZ24OoRCmMasFAw7pUOfshDc9LGaz2bHLVWBjoIH/aAOPHzaxMVcegAajsheWvJhFCUcoY+sscF8kOfuzNkX6Cw7wMhMEmTztIgVmeeJk6tTJWMSN3x5lZnAMr1m0JALtbI1DqRaUjO0OunByzdfdcCO48+YMZEXpiKagr8gMmvGtU41G6eaQDEPZ/uQKN0dbJWhaSiWDTqrVcuupAvvmR1YDAN0TAxwc23n8itKYkXoImXrlIBFq undesirable'
  };

  var COLOURWAYS = [
    { name: 'Dusty Rose', tex: TEX.rose, hex: '#B97073' },
    { name: 'Maroon', tex: TEX.wine, hex: '#7E1626' },
    { name: 'Black', tex: TEX.black, hex: '#1B1717' },
    { name: 'Beige', tex: TEX.sand, hex: '#E2BC96' }
  ];

  /* --------------------------------------------------------------------------
     Shaders from public/undrskin-3d-demo.html
     -------------------------------------------------------------------------- */
  var VERT = [
    'uniform float uTime; uniform float uSway; uniform float uHover; uniform vec2 uPointer;',
    'varying vec2 vUv; varying float vShade; varying vec3 vN;',
    'float w(vec2 p, float t){',
    '  return sin(p.x*2.6 + t*0.85)*0.055 + sin(p.y*2.1 - t*0.62)*0.042 + sin((p.x+p.y)*4.3 + t*1.15)*0.02;',
    '}',
    'void main(){',
    '  vUv = uv;',
    '  float hang = 1.0 - smoothstep(0.0, 1.0, uv.y);',
    '  float amp = (0.3 + hang) * uSway;',
    '  float base = w(position.xy, uTime) * amp;',
    '  float d = distance(position.xy, uPointer * vec2(1.5, 1.0));',
    '  float push = exp(-d*d*1.5) * uHover * 0.32;',
    '  vec3 pos = position; pos.z += base + push;',
    '  float e = 0.08;',
    '  float dx = (w(position.xy + vec2(e,0.0), uTime)*amp - base)/e;',
    '  float dy = (w(position.xy + vec2(0.0,e), uTime)*amp - base)/e;',
    '  vec3 n = normalize(vec3(-dx, -dy, 1.0)); vN = n;',
    '  vShade = clamp(dot(n, normalize(vec3(-0.42, 0.55, 0.72))), 0.0, 1.0);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'uniform sampler2D uA; uniform sampler2D uB; uniform float uMix; uniform vec2 uWipe;',
    'uniform float uGrain; uniform float uExp; uniform vec3 uRim;',
    'varying vec2 vUv; varying float vShade; varying vec3 vN;',
    'float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  vec4 a = texture2D(uA, vUv); vec4 b = texture2D(uB, vUv);',
    '  float r = uMix * 1.95;',
    '  float dn = distance(vUv, uWipe) + (h21(floor(vUv*180.0)) - 0.5) * 0.06;',
    '  float edge = smoothstep(r - 0.24, r + 0.03, dn);',
    '  vec4 col = mix(b, a, edge);',
    '  if (col.a < 0.01) discard;',
    '  vec3 rgb = col.rgb * (0.68 + 0.52 * vShade) * uExp;',
    '  rgb *= mix(0.84, 1.05, smoothstep(0.0, 1.0, vUv.y));',
    '  rgb += uRim * pow(clamp(1.0 - vN.z, 0.0, 1.0), 2.0) * 0.4;',
    '  float g = h21(vUv * vec2(820.0, 560.0));',
    '  rgb *= 1.0 + (g - 0.5) * uGrain;',
    '  gl_FragColor = vec4(rgb, col.a);',
    '}'
  ].join('\n');

  /* --------------------------------------------------------------------------
     Core makeStage 3D Cloth Viewer (from public/undrskin-3d-demo.html)
     -------------------------------------------------------------------------- */
  function makeStage(canvas, opts) {
    opts = opts || {};
    if (!canvas || typeof THREE === 'undefined') return null;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, 0.1, 60);
    camera.position.z = opts.z || 6;

    var loader = new THREE.TextureLoader();
    function tex(url) {
      var t = loader.load(url);
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    }

    var maps = COLOURWAYS.map(function (c) { return tex(c.tex); });

    var uni = {
      uTime: { value: 0 },
      uSway: { value: opts.sway || 1 },
      uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uA: { value: maps[0] },
      uB: { value: maps[0] },
      uMix: { value: 0 },
      uWipe: { value: new THREE.Vector2(0.5, 0.5) },
      uGrain: { value: 0.07 },
      uExp: { value: opts.exp || 1.06 },
      uRim: { value: new THREE.Color(opts.rim || 0x5d3a33) }
    };

    var segs = opts.segs || [44, 32];
    var W = opts.width || 3.4;
    var geo = new THREE.PlaneGeometry(W, W * 0.677, segs[0], segs[1]);
    var mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: uni,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    var cloth = new THREE.Mesh(geo, mat);
    var group = new THREE.Group();
    group.add(cloth);
    scene.add(group);

    // Dynamic Size Rescaling
    function setSizeScale(scaleFactor) {
      group.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // Interactive Drag Pointer Rotation & Inertia
    var pointer = { x: 0, y: 0, active: false };
    var rotX = 0, rotY = 0, targetRotX = 0, targetRotY = 0;

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      var cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      var nx = ((cx - rect.left) / rect.width) * 2 - 1;
      var ny = -((cy - rect.top) / rect.height) * 2 + 1;

      pointer.x = nx;
      pointer.y = ny;
      uni.uPointer.value.set(nx, ny);

      if (pointer.active) {
        targetRotY = nx * 0.35;
        targetRotX = -ny * 0.25;
      }
    }

    function onPointerDown(e) {
      pointer.active = true;
      uni.uHover.value = 1.0;
      onPointerMove(e);
    }

    function onPointerUp() {
      pointer.active = false;
      uni.uHover.value = 0.0;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Colorway Transition Wiping Animation
    var currentIdx = 0;
    function swapTo(idx, pt) {
      if (idx === currentIdx) return;
      uni.uA.value = maps[currentIdx];
      uni.uB.value = maps[idx];
      currentIdx = idx;
      uni.uWipe.value.set(pt ? pt.x : 0.5, pt ? pt.y : 0.5);
      uni.uMix.value = 0;

      var start = performance.now();
      var duration = 850;
      function step(now) {
        var elapsed = now - start;
        var p = Math.min(1, elapsed / duration);
        uni.uMix.value = p;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // Resize Handler
    function onResize() {
      if (!canvas) return;
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Render Animation Loop
    var animId = null;
    var isVisible = true;

    var observer = new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(canvas);

    function tick(now) {
      animId = requestAnimationFrame(tick);
      if (!isVisible) return;

      uni.uTime.value = now * 0.001;
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      group.rotation.x = rotX;
      group.rotation.y = rotY;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);

    return {
      swapTo: swapTo,
      setSizeScale: setSizeScale,
      destroy: function () {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
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
     Section Initializer
     -------------------------------------------------------------------------- */
  function initUndrskin3DSection(container) {
    if (!container || container.dataset.initialized === 'true') return;
    container.dataset.initialized = 'true';

    var canvas = container.querySelector('.undrskin-3d-canvas');
    var explodedBtn = container.querySelector('.undrskin-exploded-btn');
    var explodedModal = container.querySelector('.undrskin-exploded-modal');
    var explodedCloseBtn = container.querySelector('.undrskin-exploded-close');
    var addToBagBtn = container.querySelector('.undrskin-add-to-bag-btn');
    var form = container.querySelector('.undrskin-variant-form');

    var stageInstance = null;
    if (canvas && typeof THREE !== 'undefined') {
      stageInstance = makeStage(canvas, { z: 5.0, sway: 0.8, exp: 1.08 });
    }

    /* --------------------------------------------------------------------------
       Technical Exploded View Modal (Locks background body scroll)
       -------------------------------------------------------------------------- */
    function openExplodedModal() {
      if (!explodedModal) return;
      explodedModal.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }

    function closeExplodedModal() {
      if (!explodedModal) return;
      explodedModal.classList.remove('is-open');
      document.body.style.overflow = 'auto'; // Restore background scrolling
    }

    if (explodedBtn) explodedBtn.addEventListener('click', openExplodedModal);
    if (explodedCloseBtn) explodedCloseBtn.addEventListener('click', closeExplodedModal);

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && explodedModal && explodedModal.classList.contains('is-open')) {
        closeExplodedModal();
      }
    });

    /* --------------------------------------------------------------------------
       Variant Selectors (Colour & Size)
       -------------------------------------------------------------------------- */
    var colorSwatches = container.querySelectorAll('.undrskin-swatch-btn');
    var sizeBtns = container.querySelectorAll('.undrskin-size-btn');
    var selectedVariantInput = container.querySelector('[name="id"]');

    var variantsData = [];
    var variantsScript = container.querySelector('[data-product-variants-json]');
    if (variantsScript) {
      try { variantsData = JSON.parse(variantsScript.textContent); } catch (e) {}
    }

    colorSwatches.forEach(function (swatch, idx) {
      swatch.addEventListener('click', function () {
        colorSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        swatch.classList.add('is-active');

        if (stageInstance) {
          stageInstance.swapTo(idx % 4, { x: 0.5, y: 0.5 });
        }
        updateVariant();
      });
    });

    var sizeScales = { XS: 0.88, S: 0.94, M: 1.0, L: 1.06, XL: 1.12, XXL: 1.18 };
    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        var sizeVal = btn.dataset.value;
        if (stageInstance && sizeScales[sizeVal]) {
          stageInstance.setSizeScale(sizeScales[sizeVal]);
        }
        updateVariant();
      });
    });

    function updateVariant() {
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
          priceEl.textContent = typeof Shopify !== 'undefined' && Shopify.formatMoney ? Shopify.formatMoney(matchedVariant.price) : '₹' + (matchedVariant.price / 100).toFixed(0);
        }
        if (addToBagBtn) {
          addToBagBtn.disabled = !matchedVariant.available;
          addToBagBtn.textContent = matchedVariant.available ? 'ADD TO BAG' : 'SOLD OUT';
        }
      }
    }

    /* --------------------------------------------------------------------------
       Shopify AJAX Cart Form Handler (/cart/add.js)
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
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: [{ id: parseInt(variantId, 10), quantity: 1 }] })
        })
          .then(function (res) { return res.json(); })
          .then(function () {
            addToBagBtn.innerHTML = '<span>ADDED TO BAG! ✓</span>';
            setTimeout(function () {
              addToBagBtn.disabled = false;
              addToBagBtn.innerHTML = '<span>ADD TO BAG</span>';
            }, 2000);
            document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
          })
          .catch(function () {
            addToBagBtn.disabled = false;
            addToBagBtn.innerHTML = '<span>ADD TO BAG</span>';
          });
      });
    }

    /* --------------------------------------------------------------------------
       Mobile Collapsible Accordions
       -------------------------------------------------------------------------- */
    var accordionHeaders = container.querySelectorAll('.undrskin-accordion-header');
    accordionHeaders.forEach(function (header) {
      header.addEventListener('click', function () {
        var item = header.closest('.undrskin-accordion-item');
        if (!item) return;
        var isActive = item.classList.contains('is-active');
        container.querySelectorAll('.undrskin-accordion-item').forEach(function (ai) { ai.classList.remove('is-active'); });
        if (!isActive) item.classList.add('is-active');
      });
    });

    document.addEventListener('shopify:section:unload', function (e) {
      if (e.target && e.target.contains(container)) {
        if (stageInstance) stageInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.undrskin-3d-product').forEach(initUndrskin3DSection);
  });

  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector('.undrskin-3d-product')) {
      initUndrskin3DSection(e.target.querySelector('.undrskin-3d-product'));
    }
  });

})();
