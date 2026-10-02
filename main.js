(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hero – slová postupne
  const h1 = $('[data-words]');
  if (h1) {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/([ \t\n]+)/).forEach(t => {
          if (!t) return;
          if (/^[ \t\n]+$/.test(t)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = t; s.style.animationDelay = (0.2 + i++ * 0.07) + 's';
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else wrap(n);
    });
    wrap(h1);
  }

  // hero – fotka sa „obkladá“ dlaždicu po dlaždici, od ľavého dolného rohu
  const tiles = $('#tiles');
  if (tiles) {
    const m = tiles.parentElement, r = m.getBoundingClientRect();
    const cols = innerWidth < 600 ? 5 : 6, rows = Math.max(4, Math.round(cols * r.height / r.width));
    m.style.setProperty('--cols', cols); m.style.setProperty('--rows', rows);
    const frag = document.createDocumentFragment();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const t = document.createElement('i');
      t.style.setProperty('--d', (0.35 + (x + (rows - 1 - y)) * 0.06 + Math.random() * 0.05).toFixed(3) + 's');
      frag.append(t);
    }
    tiles.append(frag);
  }

  // navigácia
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = ''; }));

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv, .clip').forEach(el => {
    const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [];
    const idx = sib.indexOf(el); if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 0.08 + 's';
    io.observe(el);
  });
  // bento – náhodné poradie odkrytia
  const bi = $$('.bi'), order = bi.map((_, i) => i).sort(() => Math.random() - .5);
  bi.forEach((el, i) => { el.style.transitionDelay = order[i] * 0.07 + 's'; io.observe(el); });

  // služby – fotka pri kurzore
  const pv = $('#pv'), pvi = $('img', pv);
  if (matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, x = 0, y = 0, run = false;
    const loop = () => { x += (tx - x) * .16; y += (ty - y) * .16; pv.style.left = x + 'px'; pv.style.top = y + 'px'; if (run) requestAnimationFrame(loop); };
    $$('.svc__i').forEach(li => {
      // fotka nahradí popis v riadku (x drží stĺpec popisu, y ide za kurzorom)
      const px = () => { const r = $('p', li).getBoundingClientRect(); return r.left + Math.min(r.width, 300) / 2 + 10; };
      li.addEventListener('pointerenter', e => {
        pvi.src = li.dataset.img;
        tx = px(); ty = e.clientY;
        if (!run) { x = tx; y = ty; run = true; requestAnimationFrame(loop); }
        pv.classList.add('is-on');
      });
      li.addEventListener('pointermove', e => { tx = px(); ty = e.clientY; });
      li.addEventListener('pointerleave', () => pv.classList.remove('is-on'));
    });
    $('#svc').addEventListener('pointerleave', () => { run = false; });
  }

  // kúpeľňa – aktívny krok mení sticky fotku
  const steps = $$('.bath__s'), frames = $$('.bath__frame img'), num = $('#bathn');
  const setStep = i => {
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => sio.observe(s)); setStep(0);

  // spôsob kladenia – SVG ukážka (dlaždica 2 : 1)
  const svg = $('#vzor'), lbl = $('#vzorlbl');
  if (svg) {
    const NS = 'http://www.w3.org/2000/svg', W = 600, G = 4;
    const FARBY = {
      biela: { c: '#efebe4', g: '#c9c0b2', n: 'biela' },
      terakota: { c: '#b65f3e', g: '#e3d7c7', n: 'terakota' },
      zelena: { c: '#56705f', g: '#e6dfd2', n: 'zelená' },
      antracit: { c: '#38352f', g: '#8e877b', n: 'antracit' },
    };
    const NAZVY = { rovno: 'Rovno', vazba: 'Na väzbu', diagonala: 'Diagonálne', kost: 'Rybia kosť' };
    let vzor = 'rovno', farba = 'biela';
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const tint = (h, a) => { const [r, g, b] = hex(h); const f = v => Math.round(a > 0 ? v + (255 - v) * a : v * (1 + a)); return `rgb(${f(r)},${f(g)},${f(b)})`; };
    // každá dlaždica má trochu iný odtieň, ako skutočný obklad
    const jit = () => (Math.random() - .5) * .09;
    const rect = (x, y, w, h) => ({ x, y, w, h, j: jit() });
    const tvary = {
      rovno: () => { const l = 120, s = 60, o = []; for (let y = 0; y < W; y += s) for (let x = 0; x < W; x += l) o.push(rect(x, y, l, s)); return { o }; },
      vazba: () => { const l = 120, s = 60, o = []; for (let r = 0, y = 0; y < W; y += s, r++) for (let x = r % 2 ? -l / 2 : 0; x < W; x += l) o.push(rect(x, y, l, s)); return { o }; },
      diagonala: () => { const l = 120, s = 60, o = []; for (let y = -300; y < 900; y += s) for (let x = -300; x < 900; x += l) o.push(rect(x, y, l, s)); return { o, rot: 45 }; },
      kost: () => {
        const w = 42, o = [];
        for (let m = -14; m <= 14; m++) for (let i = -16; i <= 16; i++) {
          const X = i * w + 300 - w, Y = (i + 4 * m) * w + 300 - w;
          o.push(rect(X, Y, 2 * w, w)); o.push(rect(X, Y + w, w, 2 * w));
        }
        return { o, rot: 45 };
      },
    };
    const draw = anim => {
      const f = FARBY[farba], { o, rot } = tvary[vzor]();
      svg.textContent = '';
      const bg = document.createElementNS(NS, 'rect');
      Object.entries({ width: W, height: W, fill: f.g }).forEach(([k, v]) => bg.setAttribute(k, v));
      svg.append(bg);
      const g = document.createElementNS(NS, 'g');
      if (rot) g.setAttribute('transform', `rotate(${rot} 300 300)`);
      o.forEach(t => {
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', t.x + G / 2); r.setAttribute('y', t.y + G / 2);
        r.setAttribute('width', t.w - G); r.setAttribute('height', t.h - G); r.setAttribute('rx', 1.5);
        r.setAttribute('fill', tint(f.c, t.j)); r.dataset.j = t.j;
        if (anim && !calm) {
          const cx = t.x + t.w / 2 - 300, cy = t.y + t.h / 2 - 300;
          r.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: Math.hypot(cx, cy) * 1.1, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        }
        g.append(r);
      });
      svg.append(g);
      lbl.textContent = `${NAZVY[vzor]} · ${f.n}`;
    };
    const recolor = () => {
      const f = FARBY[farba];
      svg.firstChild.setAttribute('fill', f.g);
      $$('g rect', svg).forEach(r => r.setAttribute('fill', tint(f.c, +r.dataset.j)));
      lbl.textContent = `${NAZVY[vzor]} · ${f.n}`;
    };
    $$('[data-vzor]').forEach(b => b.addEventListener('click', () => {
      vzor = b.dataset.vzor; $$('[data-vzor]').forEach(x => x.classList.toggle('is-on', x === b)); draw(true);
    }));
    $$('[data-farba]').forEach(b => b.addEventListener('click', () => {
      farba = b.dataset.farba; $$('[data-farba]').forEach(x => x.classList.toggle('is-on', x === b)); recolor();
    }));
    draw(false);
  }

  // lightbox
  const lb = $('#lb'), lbimg = $('#lbimg');
  $$('.bi').forEach(g => g.addEventListener('click', () => { lbimg.src = g.dataset.full; lbimg.alt = $('img', g).alt; lb.hidden = false; document.body.style.overflow = 'hidden'; }));
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  $('#lbx').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (!lb.hidden && e.key === 'Escape') close(); });

  // dopyt
  const file = $('.file input');
  file.addEventListener('change', () => { $('.file span').textContent = file.files.length ? `Priložené: ${file.files.length} ${file.files.length === 1 ? 'fotka' : file.files.length < 5 ? 'fotky' : 'fotiek'}` : '+ Priložiť fotku priestoru'; });
  $('#dopyt').addEventListener('submit', e => { e.preventDefault(); $('#formok').hidden = false; });
})();
