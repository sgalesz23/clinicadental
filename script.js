/* =========================================================
   Sonríe Valencia — Interactividad
   ========================================================= */
'use strict';

/* ---- CONFIGURACIÓN (edita estos datos) ---- */
const CONFIG = {
  clinica: 'Sonríe Valencia',
  whatsapp: '584140000000', // código de país + número, sin + ni espacios
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Año del footer ---------- */
$('#year').textContent = new Date().getFullYear();

/* ---------- Header dinámico + enlace activo ---------- */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

const navLinks = $$('.nav__list a');
const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

/* ---------- Menú móvil ---------- */
const burger = $('#burger'), nav = $('#nav');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Animaciones al hacer scroll ---------- */
const revealIO = new IntersectionObserver((entries, io) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('is-in');
    io.unobserve(el);
    // Elimina el retardo escalonado para que el hover responda al instante
    setTimeout(() => { el.style.transitionDelay = '0s'; el.style.willChange = 'auto'; }, 1600);
    if (el.matches('.trust')) runCounters(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => {
  el.style.setProperty('--d', el.dataset.delay || 0);
  revealIO.observe(el);
});

/* ---------- Contadores ---------- */
function runCounters(scope) {
  $$('[data-count]', scope).forEach(el => {
    const target = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || '';
    const fmt = v => v.toLocaleString('es-VE', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Glow en tarjetas de servicio ---------- */
$$('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ---------- FAQ (acordeón) ---------- */
$$('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    $$('.faq__q').forEach(b => b.setAttribute('aria-expanded', 'false')); // uno abierto a la vez
    btn.setAttribute('aria-expanded', String(!open));
  });
});

/* =========================================================
   COMPARADOR ANTES / DESPUÉS (ilustraciones SVG generadas)
   ========================================================= */
const BA_CASES = [
  { note: 'Blanqueamiento láser: hasta 8 tonos más claros en una sola sesión.', before: { tone: 'stained', mess: 0 }, after: { tone: 'white', mess: 0 } },
  { note: 'Diseño de sonrisa: carillas que armonizan forma, tamaño y color.',   before: { tone: 'dull', mess: 2 },   after: { tone: 'white', mess: 0 } },
  { note: 'Ortodoncia: dientes alineados para una mordida sana y estética.',    before: { tone: 'dull', mess: 3 },   after: { tone: 'white', mess: 0 } },
];

function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function smileSVG({ tone, mess }, seed) {
  const r = rand(seed);
  const fills = {
    white:   ['#ffffff', '#f4f8fc'],
    stained: ['#e2c476', '#d3b05c'],
    dull:    ['#ece3c4', '#ddd0a4'],
  }[tone];
  const upperW = [22, 26, 31, 35, 35, 31, 26, 22];
  const lowerW = [18, 20, 22, 24, 24, 22, 20, 18];
  const tooth = (x, w, yEdge, h, up, i) => {
    const jitter = mess ? (r() - .5) * mess * 9 : 0;
    const rot = mess ? (r() - .5) * mess * 9 : 0;
    const hh = h + (mess ? (r() - .5) * mess * 7 : 0);
    const gap = mess ? r() * mess * 1.6 : 0;
    const cx = x + w / 2;
    const y = up ? yEdge - 8 : yEdge - hh;
    const fill = fills[i % 2];
    return `<rect x="${x + gap + jitter * .4}" y="${y}" width="${w - 2 - gap}" height="${hh + 8}" rx="${Math.min(12, w / 2.4)}" fill="${fill}" stroke="rgba(120,90,60,.22)" stroke-width="1" transform="rotate(${rot} ${cx} ${yEdge})"/>`;
  };
  let upper = '', lower = '', ux = 200 - upperW.reduce((a, b) => a + b, 0) / 2, lx = 200 - lowerW.reduce((a, b) => a + b, 0) / 2;
  upperW.forEach((w, i) => { const c = ux + w / 2, u = (c - 200) / 150; upper += tooth(ux, w, 77 + 53 * u * u, 52 - Math.abs(u) * 14, true, i); ux += w; });
  lowerW.forEach((w, i) => { const c = lx + w / 2, u = (c - 200) / 150; lower += tooth(lx, w, 194 - 64 * u * u, 34 - Math.abs(u) * 10, false, i); lx += w; });

  return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="skin${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6cdb6"/><stop offset="1" stop-color="#eab295"/></linearGradient>
      <clipPath id="mouth${seed}"><path d="M52 130C100 60 300 60 348 130 300 214 100 214 52 130Z"/></clipPath>
    </defs>
    <rect width="400" height="250" fill="url(#skin${seed})"/>
    <path d="M52 130C100 60 300 60 348 130 300 214 100 214 52 130Z" fill="#6e1a29"/>
    <g clip-path="url(#mouth${seed})">${upper}${lower}
      <ellipse cx="200" cy="190" rx="60" ry="20" fill="#a8364a" opacity=".55"/>
    </g>
    <path d="M52 130C100 60 300 60 348 130" fill="none" stroke="#c4566a" stroke-width="13" stroke-linecap="round"/>
    <path d="M52 130C100 214 300 214 348 130" fill="none" stroke="#cf6377" stroke-width="15" stroke-linecap="round"/>
    <path d="M70 124C120 78 280 78 330 124" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

const baStage = $('#baStage'), baRange = $('#baRange');
function showCase(i) {
  const c = BA_CASES[i];
  $('#baBefore').innerHTML = smileSVG(c.before, 11 + i * 7);
  $('#baAfter').innerHTML = smileSVG(c.after, 97 + i * 7);
  $('#baNote').textContent = c.note;
  $$('.ba__tabs button').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
}
$$('.ba__tabs button').forEach(b => b.addEventListener('click', () => showCase(+b.dataset.case)));
baRange.addEventListener('input', () => baStage.style.setProperty('--pos', baRange.value + '%'));
showCase(0);

/* =========================================================
   SISTEMA DE RESERVA DE CITAS
   ========================================================= */
const form = $('#bookingForm');
const state = { step: 1, servicio: '', fecha: null, hora: '' };
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const SLOTS_SEMANA = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
const SLOTS_SABADO = ['08:00','09:00','10:00','11:00','12:00'];
const MAX_MESES_ADELANTE = 3;

const today = new Date(); today.setHours(0, 0, 0, 0);
let view = new Date(today.getFullYear(), today.getMonth(), 1);

const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtLong = d => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
const fmtHora = h => { const [H, M] = h.split(':').map(Number); return `${H % 12 || 12}:${String(M).padStart(2, '0')} ${H < 12 ? 'a. m.' : 'p. m.'}`; };

// Horarios ya ocupados: simulados de forma determinista (en producción, consulta tu agenda/backend).
function takenSlots(date) {
  const reserved = JSON.parse(localStorage.getItem('citas') || '[]').filter(c => c.fechaKey === key(date)).map(c => c.hora);
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  const r = rand(seed + 7);
  const list = date.getDay() === 6 ? SLOTS_SABADO : SLOTS_SEMANA;
  return new Set([...list.filter(() => r() < .28), ...reserved]);
}
const isOpen = d => d.getDay() !== 0 && d >= today;

function renderCalendar() {
  $('#calTitle').textContent = `${MESES[view.getMonth()]} ${view.getFullYear()}`;
  const grid = $('#calGrid'); grid.innerHTML = '';
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // lunes primero
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('span'));
  for (let n = 1; n <= days; n++) {
    const d = new Date(view.getFullYear(), view.getMonth(), n);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'day'; b.textContent = n;
    b.disabled = !isOpen(d);
    b.setAttribute('aria-label', fmtLong(d));
    if (+d === +today) b.classList.add('is-today');
    if (state.fecha && +state.fecha === +d) b.classList.add('is-sel');
    b.addEventListener('click', () => { state.fecha = d; state.hora = ''; renderCalendar(); renderSlots(); updateSummary(); clearErr('fecha'); });
    grid.appendChild(b);
  }
  const lastView = new Date(today.getFullYear(), today.getMonth() + MAX_MESES_ADELANTE, 1);
  $('#calPrev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
  $('#calNext').disabled = view >= lastView;
}
$('#calPrev').addEventListener('click', () => { view.setMonth(view.getMonth() - 1); renderCalendar(); });
$('#calNext').addEventListener('click', () => { view.setMonth(view.getMonth() + 1); renderCalendar(); });

function renderSlots() {
  const grid = $('#slotsGrid'); grid.innerHTML = '';
  if (!state.fecha) { $('#slotsTitle').textContent = 'Selecciona un día'; return; }
  $('#slotsTitle').textContent = fmtLong(state.fecha);
  const list = state.fecha.getDay() === 6 ? SLOTS_SABADO : SLOTS_SEMANA;
  const taken = takenSlots(state.fecha);
  const now = new Date();
  let available = 0;
  list.forEach(h => {
    const [H] = h.split(':').map(Number);
    const past = +state.fecha === +today && H <= now.getHours();
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'slot'; b.textContent = fmtHora(h);
    b.disabled = taken.has(h) || past;
    if (!b.disabled) available++;
    if (state.hora === h) b.classList.add('is-sel');
    b.addEventListener('click', () => { state.hora = h; renderSlots(); updateSummary(); clearErr('fecha'); });
    grid.appendChild(b);
  });
  if (!available) {
    const p = document.createElement('p'); p.className = 'slots__empty';
    p.textContent = 'No quedan horarios este día. Prueba con otra fecha.';
    grid.appendChild(p);
  }
}

/* ---- Resumen lateral ---- */
function updateSummary() {
  const set = (id, val) => { const el = $(id); el.textContent = val || '—'; el.classList.toggle('is-empty', !val); };
  set('#sumServicio', state.servicio);
  set('#sumFecha', state.fecha ? fmtLong(state.fecha) : '');
  set('#sumHora', state.hora ? fmtHora(state.hora) : '');
  set('#sumPaciente', form.nombre.value.trim());
}
$$('input[name="servicio"]').forEach(r => r.addEventListener('change', () => { state.servicio = r.value; clearErr('servicio'); updateSummary(); }));
form.nombre.addEventListener('input', updateSummary);

/* ---- Enlaces "Agendar" de las tarjetas preseleccionan el servicio ---- */
$$('[data-service]').forEach(a => a.addEventListener('click', () => {
  const radio = $$('input[name="servicio"]').find(r => r.value === a.dataset.service);
  if (radio) { radio.checked = true; state.servicio = radio.value; updateSummary(); }
}));

/* ---- Validación ---- */
const showErr = (name, msg) => {
  const el = $(`[data-err="${name}"]`); if (!el) return;
  el.textContent = msg;
  el.closest('.field')?.classList.toggle('invalid', !!msg);
};
const clearErr = name => showErr(name, '');

function validateStep(n) {
  let ok = true;
  const fail = (name, msg) => { showErr(name, msg); ok = false; };
  if (n === 1) {
    if (!state.servicio) fail('servicio', 'Elige un servicio para continuar.');
  }
  if (n === 2) {
    if (!state.fecha) fail('fecha', 'Selecciona un día disponible.');
    else if (!state.hora) fail('fecha', 'Selecciona una hora para ese día.');
  }
  if (n === 3) {
    const nombre = form.nombre.value.trim();
    if (nombre.split(/\s+/).filter(w => w.length > 1).length < 2) fail('nombre', 'Escribe tu nombre y apellido.'); else clearErr('nombre');
    if (!/^\d{6,10}$/.test(form.cedula.value.trim())) fail('cedula', 'Cédula inválida (solo números, 6 a 10 dígitos).'); else clearErr('cedula');
    const tel = form.telefono.value.replace(/[\s\-().]/g, '');
    const telOk = form.codigo.value === '+58' ? /^0?(4(12|14|16|24|26)|2\d{2})\d{7}$/.test(tel) : /^\d{7,12}$/.test(tel);
    if (!telOk) fail('telefono', form.codigo.value === '+58' ? 'Ej.: 414 1234567 (móvil) o 241 1234567 (fijo).' : 'Teléfono inválido.'); else clearErr('telefono');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.correo.value.trim())) fail('correo', 'Ingresa un correo válido.'); else clearErr('correo');
    if (!form.acepto.checked) fail('acepto', 'Debes aceptar el aviso de privacidad.'); else clearErr('acepto');
  }
  if (!ok) $(`.step[data-step="${n}"] .err:not(:empty)`)?.closest('.field, .step')?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  return ok;
}
form.cedula.addEventListener('input', () => form.cedula.value = form.cedula.value.replace(/\D/g, ''));

/* ---- Navegación entre pasos ---- */
function goStep(n) {
  state.step = n;
  $$('.step').forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
  $$('.steps li').forEach(li => {
    const i = +li.dataset.stepInd;
    li.classList.toggle('is-active', i === n);
    li.classList.toggle('is-done', i < n);
  });
  $('#btnBack').hidden = n === 1;
  $('#btnNext').hidden = n === 3;
  $('#btnSubmit').hidden = n !== 3;
  if (n === 2) { renderCalendar(); renderSlots(); }
  if (matchMedia('(max-width: 900px)').matches) $('.steps').scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
}
$('#btnNext').addEventListener('click', () => { if (validateStep(state.step)) goStep(state.step + 1); });
$('#btnBack').addEventListener('click', () => goStep(state.step - 1));

/* ---- Envío ---- */
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateStep(3)) return;

  const cita = {
    servicio: state.servicio,
    fechaKey: key(state.fecha),
    fecha: fmtLong(state.fecha),
    hora: state.hora,
    nombre: form.nombre.value.trim(),
    cedula: `${form.cedulaTipo.value}-${form.cedula.value.trim()}`,
    telefono: `${form.codigo.value} ${form.telefono.value.trim()}`,
    correo: form.correo.value.trim(),
    notas: form.notas.value.trim(),
    creada: new Date().toISOString(),
  };

  /* TODO (producción): enviar `cita` a tu backend / Formspree / Google Sheets / WhatsApp API.
     Ejemplo:  await fetch('/api/citas', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cita) }) */
  try {
    const all = JSON.parse(localStorage.getItem('citas') || '[]'); all.push(cita);
    localStorage.setItem('citas', JSON.stringify(all));
  } catch (_) { /* almacenamiento no disponible */ }

  const nombre = cita.nombre.split(' ')[0];
  $('#okText').textContent = `${nombre}, solicitamos tu cita de ${cita.servicio.toLowerCase()} para el ${cita.fecha} a las ${fmtHora(cita.hora)}`;
  const msg = `Hola, soy ${cita.nombre} (C.I. ${cita.cedula}). Solicité una cita de ${cita.servicio} para el ${cita.fecha} a las ${fmtHora(cita.hora)}. Quedo atento(a) a su confirmación.`;
  $('#okWa').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  openModal('successModal');

  form.reset();
  Object.assign(state, { servicio: '', fecha: null, hora: '' });
  updateSummary(); goStep(1);
});

/* =========================================================
   MODALES
   ========================================================= */
let lastFocus = null;
function openModal(id) {
  const m = document.getElementById(id);
  lastFocus = document.activeElement;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  (m.querySelector('a.btn, button') || m).focus();
}
function closeModals() {
  $$('.modal').forEach(m => m.hidden = true);
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}
$$('[data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openModal(a.dataset.open); }));
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModals(); }));
addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

updateSummary();
