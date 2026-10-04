/* =====================================================================
   UndrSkin — front-end demo
   one file, no backend. three.js drives two cloth stages:
   the hero film and the configurator viewer.
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ data */
  var TEX = {
    rose: '{{A:g_rose}}',
    wine: '{{A:g_wine}}',
    black: '{{A:g_black}}',
    sand: '{{A:g_sand}}'
  };
  var COLOURWAYS = [
    { name: 'Dusty Rose', tex: TEX.rose, hex: '#B96F73' },
    { name: 'Maroon', tex: TEX.wine, hex: '#7E1626' },
    { name: 'Black', tex: TEX.black, hex: '#1B1717' },
    { name: 'Beige', tex: TEX.sand, hex: '#E2BC96' }
  ];

  var TICKER = ['95% bamboo viscose', 'Anti-microbial', 'Moisture-wicking', 'Four-way stretch',
    'Full coverage fit', 'Wireless comfort', 'Skin-friendly', 'Fresh from morning to night'];

  var TRIOS = [
    { t: 'Shades Trio', img: '{{A:pack_shades}}', fit: 0, sw: ['#B96F73', '#E2BC96', '#7E1626'],
      rate: 4.1, n: 8, ship: 'Get it by Sat, 29 Aug' },
    { t: 'Everyday Trio 2', img: '{{A:pack_everyday}}', fit: 0, sw: ['#B96F73', '#7E1626', '#1B1717'],
      rate: 5.0, n: 2, ship: 'Get it by Fri, 28 Aug' },
    { t: 'Shades Trio 2', img: '{{A:trio_warm}}', fit: 1, sw: ['#B96F73', '#E2BC96', '#7E1626'],
      rate: 4.5, n: 2, ship: 'Get it by Mon, 31 Aug' },
    { t: 'Everyday Core Trio', img: '{{A:trio_dark}}', fit: 1, sw: ['#B96F73', '#7E1626', '#1B1717'],
      rate: null, n: 0, ship: 'Get it by Mon, 31 Aug' }
  ];

  /* placeholder review copy — real star counts, invented words */
  var REVIEWS = [
    { who: 'Ananya R.', city: 'Hyderabad', r: 5, t: 'I forget I am wearing them',
      p: 'Bought the Shades Trio for work and the waistband is the whole story — nine hours at a desk and there is no line, no digging, nothing to adjust. The bamboo feels cooler than my cotton pairs by the afternoon.',
      meta: 'Size M · Dusty Rose · 12 Aug 2026', help: 4 },
    { who: 'Meghana K.', city: 'Bengaluru', r: 5, t: 'Softer than cotton, honestly',
      p: 'I was sceptical about bamboo at this price. It is genuinely softer, and after six washes the colour has not faded or the fabric gone thin. The maroon is a deeper shade than the photos suggest.',
      meta: 'Size L · Maroon · 2 Aug 2026', help: 2 },
    { who: 'Shruti P.', city: 'Pune', r: 4, t: 'Great fabric, size up if you are between',
      p: 'M was snug on the hip for me and L is perfect. Docking a star only for the sizing guidance. The seat coverage is exactly as shown — it does not ride up on a run for the bus.',
      meta: 'Size L · Beige · 24 Jul 2026', help: 6 },
    { who: 'Divya S.', city: 'Chennai', r: 5, t: 'No ride-up. That is the point.',
      p: 'Every other hipster I own creeps by lunch. These stay put through a full day of standing. The leg openings are bound flat so nothing shows under fitted trousers.',
      meta: 'Size S · Black · 15 Jul 2026', help: 3 },
    { who: 'Nikita J.', city: 'New Delhi', r: 3, t: 'Lovely feel, wash the dark one separately',
      p: 'The fabric and fit are lovely. The maroon bled a little in the first cold wash with lighter clothes — my fault partly, but worth flagging. Would still buy again for the comfort.',
      meta: 'Size L · Maroon · 28 Jun 2026', help: 5 },
    { who: 'Preeti M.', city: 'Mumbai', r: 2, t: 'Runs small for me',
      p: 'The fabric is as described and very soft, but XL sat higher and tighter on my waist than expected and there is no XXL in this pack. Returning for a different size, not a fabric complaint.',
      meta: 'Size XL · Beige · 19 Jun 2026', help: 1 }
  ];

  var BARS = [{ s: 5, n: 7 }, { s: 4, n: 3 }, { s: 3, n: 1 }, { s: 2, n: 1 }, { s: 1, n: 0 }];
  var QUOTES = ['I forget I am wearing them', 'Softer than cotton, honestly', 'No ride-up. That is the point.',
    'Cooler by the afternoon', 'The waistband is the whole story', 'Six washes, still the same shade'];

  /* --------------------------------------------------------------- helpers */
  var STAR = 'M12 2l2.9 6.3 6.9.8-5 4.7 1.3 6.8L12 17.4 5.9 20.6l1.3-6.8-5-4.7 6.9-.8L12 2Z';
  function stars(r) {
    var out = '', i;
    for (i = 1; i <= 5; i++) {
      var f = r >= i ? '#B96F73' : (r >= i - 0.75 && r > i - 1 ? 'url(#halfgrad)' : 'rgba(185,111,115,.22)');
      out += '<svg viewBox="0 0 24 24"><path fill="' + f + '" d="' + STAR + '"/></svg>';
    }
    return out;
  }
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  /* ------------------------------------------------------------- rendering */
  function paintTicker() {
    var one = TICKER.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    $('#tickerRow').innerHTML = one + one;
    var q = QUOTES.map(function (t) { return '<q>' + t + '</q>'; }).join('');
    $('#quotesRow').innerHTML = q + q;
  }

  function paintTrios() {
    $('#triosGrid').innerHTML = TRIOS.map(function (p, i) {
      var rate = p.rate === null
        ? '<span class="trio__new">New listing</span>'
        : '<span class="stars" aria-hidden="true">' + stars(p.rate) + '</span><span class="num">' + p.rate.toFixed(1) + '</span><span class="faint">(' + p.n + ')</span>';
      return '<article class="trio" data-reveal data-d="' + (i % 4) + '">' +
        '<div class="trio__img"><img class="' + (p.fit ? 'cover' : '') + '" src="' + p.img + '" alt="' + p.t + ' — three bamboo hipster panties" loading="lazy"></div>' +
        '<div class="trio__swatches">' + p.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div>' +
        '<h3 class="trio__t">' + p.t + '</h3>' +
        '<div class="pd__rate" style="font-size:.8rem;gap:.45rem">' + rate + '</div>' +
        '<div class="trio__meta"><span class="num">₹999 <span class="faint">· ₹333 a piece</span></span></div>' +
        '<span class="trio__ship">' + p.ship + '</span>' +
        '<button class="cta cta--ghost" data-add-trio="' + i + '" style="padding:.75rem 1rem"><span>Add to bag</span><span aria-hidden="true">+</span></button>' +
        '</article>';
    }).join('');
  }

  function paintReviews() {
    $('#revList').innerHTML = REVIEWS.map(function (r, i) {
      return '<article class="revcard" data-reveal data-d="' + (i % 4) + '">' +
        '<div class="revcard__top"><div class="revcard__who">' + r.who + '<span>' + r.city + '</span></div>' +
        '<span class="stars" role="img" aria-label="' + r.r + ' out of 5">' + stars(r.r) + '</span></div>' +
        '<h3 class="revcard__t">' + r.t + '</h3><p>' + r.p + '</p>' +
        '<div class="revcard__foot"><span class="verified">Verified purchase</span><span>' + r.meta + '</span>' +
        '<button class="helpful" data-help>Helpful · <span class="num">' + r.help + '</span></button></div>' +
        '</article>';
    }).join('');

    $('#bars').innerHTML = BARS.map(function (b) {
      var pct = Math.round(b.n / 12 * 100);
      return '<div class="bar"><span class="num">' + b.s + ' star</span>' +
        '<span class="bar__track"><span class="bar__fill" data-w="' + pct + '"></span></span>' +
        '<span class="num">' + pct + '%</span></div>';
    }).join('');
  }

  function paintStars() {
    $$('[data-stars]').forEach(function (el) { el.innerHTML = stars(parseFloat(el.getAttribute('data-stars'))); });
  }

  /* ------------------------------------------------------------------ bag */
  var bag = [];
  function bagRender() {
    var body = $('#drawerBody');
    if (!bag.length) {
      body.innerHTML = '<p class="drawer__empty">Nothing in the bag yet. Pick a shade and a size.</p>';
    } else {
      body.innerHTML = bag.map(function (it, i) {
        return '<div class="line"><span class="line__img"><img src="' + it.tex + '" alt=""></span>' +
          '<span class="line__t">' + it.name + '<span>Size ' + it.size + ' · ' + it.colour + ' · pack of 3</span></span>' +
          '<span style="display:grid;gap:.4rem;justify-items:end"><span class="num">₹' + it.price + '</span>' +
          '<button class="line__x" data-rm="' + i + '">Remove</button></span></div>';
      }).join('');
    }
    var tot = bag.reduce(function (a, b) { return a + b.price; }, 0);
    $('#drawerTot').textContent = '₹' + tot;
    $('#bagN').textContent = String(bag.length);
    var bagBtn = $('#bagBtn');
    bagBtn.classList.add('is-pop');
    setTimeout(function () { bagBtn.classList.remove('is-pop'); }, 420);
  }
  function drawer(open) {
    $('#drawer').classList.toggle('is-on', open);
    $('#scrim').classList.toggle('is-on', open);
    $('#drawer').setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('is-locked', open);
  }
  function addToBag(name, colour, size) {
    var cw = COLOURWAYS.filter(function (c) { return c.name === colour; })[0] || COLOURWAYS[0];
    bag.push({ name: name, colour: colour, size: size, price: 999, tex: cw.tex });
    bagRender();
    drawer(true);
    toast('Added — ' + name + ', size ' + size);
  }

  /* --------------------------------------------------------------- shaders */
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

  var HAZE_FRAG = [
    'uniform float uTime; varying vec2 vUv;',
    'float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }',
    'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);',
    '  return mix(mix(h21(i), h21(i+vec2(1.0,0.0)), f.x), mix(h21(i+vec2(0.0,1.0)), h21(i+vec2(1.0,1.0)), f.x), f.y); }',
    'void main(){',
    '  vec2 p = vUv * vec2(3.2, 2.0);',
    '  float t = uTime * 0.045;',
    '  float f = vn(p + vec2(t, -t*0.6)) * 0.55 + vn(p*2.1 - vec2(t*1.4, t)) * 0.3 + vn(p*4.3 + vec2(t*0.7, t*1.1)) * 0.15;',
    '  float fall = smoothstep(1.0, 0.15, distance(vUv, vec2(0.42, 0.55)) * 1.7);',
    '  vec3 c = mix(vec3(0.49, 0.09, 0.15), vec3(0.89, 0.74, 0.59), f);',
    '  gl_FragColor = vec4(c, f * fall * 0.16);',
    '}'
  ].join('\n');

  /* ----------------------------------------------------------- cloth stage */
  function makeStage(canvas, opts) {
    if (!window.THREE) return null;
    var renderer;
    try {
      /* premultipliedAlpha:false keeps straight-alpha maths — the cutouts have
         feathered edges and additive haze/motes rely on SRC_ALPHA blending */
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: true, premultipliedAlpha: false
      });
    } catch (e) { return null; }
    if (!renderer.getContext()) return null;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.dpr || 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
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
      uTime: { value: 0 }, uSway: { value: opts.sway || 1 }, uHover: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uA: { value: maps[0] }, uB: { value: maps[0] }, uMix: { value: 0 },
      uWipe: { value: new THREE.Vector2(0.5, 0.5) },
      uGrain: { value: 0.07 }, uExp: { value: opts.exp || 1.06 },
      uRim: { value: new THREE.Color(opts.rim || 0x5d3a33) }
    };

    var segs = opts.segs || [44, 32];
    var W = opts.width || 3.4;
    /* the four cutouts average 1.477:1 — keep the plane on that ratio so
       no colourway gets stretched when it swaps in */
    var geo = new THREE.PlaneGeometry(W, W * 0.677, segs[0], segs[1]);
    var mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: uni,
      transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    var cloth = new THREE.Mesh(geo, mat);
    var group = new THREE.Group();
    group.add(cloth);
    scene.add(group);

    /* haze */
    var haze = null;
    if (opts.haze) {
      haze = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 10),
        new THREE.ShaderMaterial({
          uniforms: { uTime: uni.uTime },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: HAZE_FRAG,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        })
      );
      haze.position.z = -5;
      scene.add(haze);
    }

    /* fibre motes */
    var motes = null, mv = null;
    if (opts.motes && !REDUCED) {
      var n = opts.motes;
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g2 = c.getContext('2d');
      var rg = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, 'rgba(255,238,220,1)');
      rg.addColorStop(0.35, 'rgba(255,228,205,.45)');
      rg.addColorStop(1, 'rgba(255,220,200,0)');
      g2.fillStyle = rg; g2.fillRect(0, 0, 64, 64);
      var sprite = new THREE.CanvasTexture(c);
      var pos = new Float32Array(n * 3);
      mv = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 7.5;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
        pos[i * 3 + 2] = -Math.random() * 2.6 - 0.2;
        mv[i] = 0.04 + Math.random() * 0.1;
      }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      motes = new THREE.Points(pg, new THREE.PointsMaterial({
        map: sprite, size: 0.055, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      scene.add(motes);
    }

    var st = {
      visible: true, prog: 0, target: { rx: 0, ry: 0, px: 0, py: 0 },
      cur: { rx: 0, ry: 0, px: 0, py: 0 }, spin: 0, spinV: 0, idx: 0, mixing: false,
      offX: 0, want: -1, wantWipe: null
    };

    function resize() {
      var w = canvas.clientWidth || canvas.parentNode.clientWidth;
      var h = canvas.clientHeight || canvas.parentNode.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      var wide = w / h > 1.15;
      st.offX = opts.shift ? (wide ? -0.92 : 0) : 0;
      var s = opts.shift ? (wide ? 1 : 0.82) : 1;
      group.scale.setScalar(s);
    }

    function setColour(i, wipe) {
      if (i === st.idx) { st.want = -1; return; }
      if (st.mixing) { st.want = i; st.wantWipe = wipe; return; }
      st.want = -1;
      st.idx = i;
      uni.uB.value = maps[i];
      uni.uWipe.value.set(wipe ? wipe[0] : 0.5, wipe ? wipe[1] : 0.62);
      uni.uMix.value = 0;
      st.mixing = true;
    }

    function tick(dt, t) {
      uni.uTime.value = t;
      if (st.mixing) {
        uni.uMix.value += dt * 1.25;
        if (uni.uMix.value >= 1) {
          uni.uMix.value = 0; uni.uA.value = uni.uB.value; st.mixing = false;
          if (st.want >= 0) setColour(st.want, st.wantWipe);
        }
      }
      var k = 1 - Math.pow(0.001, dt);
      st.cur.rx = lerp(st.cur.rx, st.target.rx, k);
      st.cur.ry = lerp(st.cur.ry, st.target.ry, k);
      st.cur.px = lerp(st.cur.px, st.target.px, k);
      st.cur.py = lerp(st.cur.py, st.target.py, k);
      uni.uPointer.value.set(st.cur.px * 1.4, st.cur.py * 1.0);
      uni.uHover.value = lerp(uni.uHover.value, st.hover ? 1 : 0.25, k);

      if (opts.drag) {
        st.spin += st.spinV * dt;
        st.spinV *= Math.pow(0.06, dt);
        if (!st.dragging && !REDUCED) st.spin += dt * 0.06;
      }

      var p = st.prog;
      group.rotation.y = st.cur.ry + st.spin + (opts.shift ? -0.2 + p * 0.42 : 0);
      group.rotation.x = st.cur.rx + (opts.shift ? 0.05 - p * 0.1 : 0);
      group.rotation.z = (opts.shift ? 0.02 - p * 0.06 : 0) + st.cur.px * 0.04;
      group.position.x = st.offX + st.cur.px * 0.16;
      group.position.y = (opts.shift ? 0.28 - p * 0.16 : 0) - st.cur.py * 0.14;
      if (opts.shift) {
        camera.position.z = (opts.z || 6) - 1.35 * Math.sin(p * Math.PI);
        camera.position.x = st.cur.px * -0.25;
        uni.uSway.value = (REDUCED ? 0.3 : 0.8) + p * 0.55;
      }
      if (motes) {
        var arr = motes.geometry.attributes.position.array;
        for (var i = 0; i < mv.length; i++) {
          arr[i * 3 + 1] += mv[i] * dt;
          arr[i * 3] += Math.sin(t * 0.3 + i) * dt * 0.03;
          if (arr[i * 3 + 1] > 2.7) { arr[i * 3 + 1] = -2.7; arr[i * 3] = (Math.random() - 0.5) * 7.5; }
        }
        motes.geometry.attributes.position.needsUpdate = true;
        motes.rotation.y = st.cur.px * 0.08;
      }
      renderer.render(scene, camera);
    }

    resize();
    return {
      tick: tick, resize: resize, setColour: setColour, st: st,
      setProgress: function (p) { st.prog = p; },
      pointer: function (x, y, hov) { st.target.px = x; st.target.py = y; st.hover = hov; st.target.ry = x * 0.22; st.target.rx = -y * 0.12; },
      spinBy: function (d) { st.spinV += d; },
      dragging: function (b) { st.dragging = b; }
    };
  }

  /* -------------------------------------------------------------- boot */
  function boot() {
    paintTicker(); paintTrios(); paintReviews(); paintStars();
    $$('.chapter__box').forEach(function (el) { el.setAttribute('data-reveal', ''); });

    /* reveal */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          $$('.bar__fill', e.target).forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
        }
      });
    }, { rootMargin: '-8% 0px -12% 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    var barsEl = $('#bars');
    if (barsEl) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) $$('.bar__fill', e.target).forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
        });
      }, { rootMargin: '-10% 0px' }).observe(barsEl);
    }

    /* nav + progress */
    var nav = $('#nav'), prog = $('#progress'), lastY = window.pageYOffset;
    function onScroll() {
      var y = window.pageYOffset;
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', y > 320 && y > lastY && !$('#drawer').classList.contains('is-on'));
      lastY = y;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      filmScroll();
    }

    /* stages */
    var heroStage = makeStage($('#stageCanvas'), {
      shift: true, haze: true, motes: 170, sway: 0.9, segs: [48, 34], width: 3.5, z: 6.3, dpr: 1.8, rim: 0x6b4038
    });
    var viewStage = makeStage($('#viewerCanvas'), {
      drag: true, haze: true, motes: 60, sway: 0.75, segs: [40, 28], width: 3.05, z: 5.6, dpr: 2, exp: 1.1, rim: 0x5a3a34
    });
    if (!heroStage && !viewStage) document.body.classList.add('no-webgl');

    var stages = [];
    if (heroStage) stages.push({ s: heroStage, el: $('#stage') });
    if (viewStage) stages.push({ s: viewStage, el: $('#viewer') });
    stages.forEach(function (o) {
      o.vis = true;
      new IntersectionObserver(function (es) { es.forEach(function (e) { o.vis = e.isIntersecting; }); }, { rootMargin: '120px' }).observe(o.el);
    });

    /* film choreography */
    var film = $('#film'), hero = $('.hero');
    function filmScroll() {
      var r = film.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      var fade = clamp(1 - p * 3.4, 0, 1);
      hero.style.opacity = fade;
      hero.style.transform = 'translateY(' + (-p * 40) + 'px)';
      if (!heroStage) return;
      heroStage.setProgress(p);
      heroStage.setColour(p < 0.34 ? 0 : p < 0.7 ? 1 : 2, [0.5, 0.7]);
    }

    /* pointer */
    window.addEventListener('mousemove', function (e) {
      if (heroStage) {
        var x = (e.clientX / window.innerWidth) * 2 - 1;
        var y = (e.clientY / window.innerHeight) * 2 - 1;
        heroStage.pointer(x, -y, true);
      }
      if (viewStage) {
        var v = $('#viewer').getBoundingClientRect();
        var inside = e.clientX > v.left && e.clientX < v.right && e.clientY > v.top && e.clientY < v.bottom;
        var vx = ((e.clientX - v.left) / v.width) * 2 - 1;
        var vy = ((e.clientY - v.top) / v.height) * 2 - 1;
        viewStage.pointer(clamp(vx, -1.4, 1.4), -clamp(vy, -1.4, 1.4), inside);
      }
    }, { passive: true });

    /* drag to turn */
    var viewer = $('#viewer'), down = false, lastX = 0;
    function dstart(x) { down = true; lastX = x; viewer.classList.add('is-drag'); if (viewStage) viewStage.dragging(true); }
    function dmove(x) { if (!down || !viewStage) return; viewStage.spinBy((x - lastX) * 0.012); lastX = x; }
    function dend() { down = false; viewer.classList.remove('is-drag'); if (viewStage) viewStage.dragging(false); }
    viewer.addEventListener('mousedown', function (e) { dstart(e.clientX); });
    window.addEventListener('mousemove', function (e) { dmove(e.clientX); }, { passive: true });
    window.addEventListener('mouseup', dend);
    viewer.addEventListener('touchstart', function (e) { dstart(e.touches[0].clientX); }, { passive: true });
    viewer.addEventListener('touchmove', function (e) { dmove(e.touches[0].clientX); }, { passive: true });
    viewer.addEventListener('touchend', dend);

    /* colourway + size */
    var colour = 'Dusty Rose', size = 'M';
    $('#dots').addEventListener('click', function (e) {
      var b = e.target.closest('.dot'); if (!b) return;
      $$('.dot').forEach(function (d) { d.classList.toggle('is-on', d === b); });
      var i = +b.getAttribute('data-c');
      colour = b.getAttribute('data-name');
      $('#cwName').textContent = colour;
      if (viewStage) viewStage.setColour(i, [0.5, 0.5]);
      var fb = $('#viewerFallback'); if (fb) fb.src = COLOURWAYS[i].tex;
    });
    $('#sizes').addEventListener('click', function (e) {
      var b = e.target.closest('.size'); if (!b || b.disabled) return;
      $$('.size').forEach(function (d) { d.classList.toggle('is-on', d === b); });
      size = b.getAttribute('data-s');
    });

    /* bag */
    function add() { addToBag('Bamboo Hipster · pack of 3', colour, size); }
    $('#addBtn').addEventListener('click', add);
    $('#addBtn2').addEventListener('click', add);
    $('#bagBtn').addEventListener('click', function () { drawer(true); });
    $('#drawerX').addEventListener('click', function () { drawer(false); });
    $('#scrim').addEventListener('click', function () { drawer(false); });
    $('#checkoutBtn').addEventListener('click', function () {
      if (!bag.length) { toast('Your bag is empty'); return; }
      toast('Demo build — checkout is not wired up');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') drawer(false); });
    document.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { bag.splice(+rm.getAttribute('data-rm'), 1); bagRender(); return; }
      var tr = e.target.closest('[data-add-trio]');
      if (tr) {
        var t = TRIOS[+tr.getAttribute('data-add-trio')];
        addToBag(t.t + ' · pack of 3', colour, size);
        return;
      }
      var hp = e.target.closest('[data-help]');
      if (hp && !hp.classList.contains('is-on')) {
        hp.classList.add('is-on');
        var n = hp.querySelector('span');
        n.textContent = String(+n.textContent + 1);
      }
    });

    /* loop */
    var last = performance.now();
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      var s = REDUCED ? 0.8 : t / 1000;
      stages.forEach(function (o) { if (o.vis) o.s.tick(dt, s); });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { stages.forEach(function (o) { o.s.resize(); }); onScroll(); }, 120);
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
