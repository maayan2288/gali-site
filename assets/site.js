(async function () {
  const { esc, money, store, post } = window.Gali;
  const PR = window.GaliPricing;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const goTo = s => { const el = document.querySelector(s); if (!el) return; if (window.GaliLenis) window.GaliLenis.scrollTo(el, { offset: -90 }); else el.scrollIntoView({ behavior: 'smooth' }); };
  const CART_KEY = 'gali_cart_v1', DETAILS_KEY = 'gali_details_v1';

  const DEFAULT_DESC = {
    t_pleat: 'וילון בד קלאסי בתפירת פאלדים, נותן לחלון מראה רך ומלא.',
    t_roll: 'וילון גלילה נקי ומינימליסטי שמסנן אור ושומר על פרטיות.',
    t_roll_b: 'וילון גלילה מאפיל לחדרי שינה ולחדרי ילדים.',
    t_roman: 'וילון רומי ישר שמתקפל לקפלים אופקיים מסודרים.',
    t_roman_soft: 'וילון רומי בקפלים רכים ונופלים, למראה חמים.',
    t_zebra: 'פסים שקופים ואטומים לסירוגין, לשליטה מדויקת באור.'
  };

  const C = await window.Gali.loadConfig();
  const CFG = window.GALI_CONFIG || {};
  const site = C.site, IMG = C.images || {};
  let cat = C.catalog;
  // only the fabrics chosen for the website (by id or model name); empty list = all fabrics
  const SITE_FABS = (CFG.siteFabrics || []).map(s => String(s).trim().toLowerCase()).filter(Boolean);
  if (SITE_FABS.length) cat = Object.assign({}, cat, { fabrics: (cat.fabrics || []).filter(f => SITE_FABS.includes(String(f.id).toLowerCase()) || SITE_FABS.includes(String(f.name).toLowerCase())) });
  const img = slot => IMG[slot] && IMG[slot].url ? IMG[slot].url : '';
  const VISIBLE_TYPES = (cat.types || []).filter(t => !(site.hiddenTypes || []).includes(t.id));

  /* ---------- site texts and images ---------- */
  $$('[data-site]').forEach(el => { const v = site[el.dataset.site]; if (v) el.textContent = v; });
  // about text: blank lines split paragraphs; a paragraph that is just "או" becomes a centered divider
  if (site.aboutText) {
    const box = $('#about [data-site="aboutText"]');
    box.innerHTML = String(site.aboutText).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
      .map(s => s === 'או' ? '<span class="or">או</span>' : `<span class="para">${esc(s)}</span>`).join('');
  }
  if (site.businessName) document.title = site.businessName + ' · וילונות בהתאמה אישית';
  $('#year').textContent = new Date().getFullYear();
  if (CFG.STAFF_URL) { $('#staffLink').href = CFG.STAFF_URL; $('#staffLink').hidden = false; }
  if (img('logo')) { $('#logo').src = img('logo'); $('#logo').hidden = false; }
  if (img('hero')) $('#heroMedia').innerHTML = `<img src="${esc(img('hero'))}" alt="" fetchpriority="high">`;
  if (img('about')) $('#aboutFrame').innerHTML = `<img class="img" src="${esc(img('about'))}" alt="" data-parallax="-0.08">`;
  if (site.serviceArea) { $('#areaLine').textContent = 'אזור שירות: ' + site.serviceArea; $('#areaLine').hidden = false; }

  const telHref = site.phone ? 'tel:' + site.phone.replace(/[^\d+]/g, '') : '';
  const waHref = (text) => site.whatsapp ? 'https://wa.me/' + site.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(text || site.whatsappText || '') : '';
  if (waHref()) { ['#fabWa', '#cpWa'].forEach(s => { $(s).href = waHref(); $(s).hidden = false; }); }
  if (telHref) { $('#cpCall').href = telHref; $('#cpCall').hidden = false; $('#cpCall').textContent = 'התקשרו · ' + site.phone; }
  $('#footContact').innerHTML = [
    site.phone && `<div>טלפון: <a href="${esc(telHref)}">${esc(site.phone)}</a></div>`,
    site.whatsapp && `<div><a href="${esc(waHref())}" target="_blank" rel="noopener">שליחת הודעה בווטסאפ</a></div>`,
    site.email && `<div>מייל: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>`,
    site.hours && `<div>${esc(site.hours)}</div>`,
    site.serviceArea && `<div>אזור שירות: ${esc(site.serviceArea)}</div>`,
    site.instagram && `<div><a href="${esc(site.instagram)}" target="_blank" rel="noopener">אינסטגרם</a></div>`,
    site.facebook && `<div><a href="${esc(site.facebook)}" target="_blank" rel="noopener">פייסבוק</a></div>`
  ].filter(Boolean).join('');

  /* gallery */
  const gal = Object.keys(IMG).filter(k => /^gallery_/.test(k)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (gal.length) {
    $('#gallery').hidden = false; $('#navGallery').hidden = false;
    const cols = [[], [], []]; gal.forEach((k, i) => cols[i % 3].push(k));
    const speeds = [0.06, -0.04, 0.1];
    $('#galleryGrid').innerHTML = cols.map((c, ci) => `<div class="col" data-parallax="${speeds[ci]}">${c.map((k, i) => `<img class="reveal" style="--i:${i}" src="${esc(img(k))}" alt="${esc(IMG[k].alt || '')}" loading="lazy">`).join('')}</div>`).join('');
    $('#galleryGrid').addEventListener('click', e => {
      if (e.target.tagName !== 'IMG') return;
      const lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = `<img src="${esc(e.target.src)}" alt="">`;
      lb.addEventListener('click', () => lb.remove()); document.body.appendChild(lb);
    });
  }

  /* catalog cards */
  const typeImg = (t, cls) => img('type_' + t.id) ? `<img class="${cls}" src="${esc(img('type_' + t.id))}" alt="${esc(t.name)}" loading="lazy">` : `<div class="${cls} ph">${esc(t.name)}</div>`;
  $('#typeCards').innerHTML = VISIBLE_TYPES.map((t, i) => `
    <article class="card reveal" style="--i:${i % 3}">
      <div class="media">${typeImg(t, 'img')}<span class="num">${String(i + 1).padStart(2, '0')}</span><div class="over"><h3>${esc(t.name)}</h3></div></div>
      <div class="body"><p>${esc((site.typeDescs || {})[t.id] || DEFAULT_DESC[t.id] || '')}</p>
      <button class="btn ghost small" type="button" data-order-type="${esc(t.id)}">להזמנה והערכת מחיר ←</button></div>
    </article>`).join('');
  $('#typeCards').addEventListener('click', e => {
    const b = e.target.closest('[data-order-type]'); if (!b) return;
    setType(b.dataset.orderType); goTo('#order');
  });

  /* ---------- builder ---------- */
  const showPrices = site.showPrices !== false;
  let cur = { typeId: '', qty: 1, fullness: '3', rail: 'A' };
  let editIndex = -1;
  let cart = store.get(CART_KEY, []);

  $('#typePick').innerHTML = VISIBLE_TYPES.map(t => `<button type="button" class="type-opt" data-type="${esc(t.id)}" aria-pressed="false">${typeImg(t, '')}<span>${esc(t.name)}</span></button>`).join('');
  $('#typePick').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) setType(b.dataset.type); });
  $('#fLocation').innerHTML = '<option value="">בחרו חדר</option>' + (cat.locations || []).map(l => `<option>${esc(l)}</option>`).join('') + '<option>אחר</option>';
  // pleated curtains: 3 is the recommended default, 2 the budget option
  const FULL_LABEL = { '3': 'פי 3 · מומלץ', '2.5': 'פי 2.5', '2': 'פי 2 · חסכוני (פחות מומלץ)' };
  const fullOpts = (cat.fullness || ['3', '2.5', '2']).filter(f => num(f) >= 2).sort((a, b) => num(b) - num(a));
  $('#fFullness').innerHTML = fullOpts.map(f => `<option value="${esc(f)}">${esc(FULL_LABEL[f] || 'פי ' + f)}</option>`).join('');
  $('#fFullness').value = fullOpts.includes('3') ? '3' : fullOpts[0];
  const RAILS = PR.railsList();
  $('#fRail').innerHTML = RAILS.map(r => `<option value="${esc(r.id)}">${esc(r.name)}${r.id === 'A' ? ' · כלולה' : ' · בתוספת'}</option>`).join('');
  $('#fRemote').innerHTML = '<option value="">בלי שלט</option>' + ((cat.roller || {}).remotes || []).map(r => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  const hasMech = t => !!(t && (t.roller || t.roman));
  const READY = CFG.readyRoman && (CFG.readyRoman.models || []).length ? CFG.readyRoman : null;
  const readyModel = id => (READY && READY.models.find(m => m.id === id)) || null;
  const isReadyType = t => !!(READY && t && t.id === READY.typeId);
  const readySku = c => { const m = readyModel(c.readyModel), s = m && m.sizes.find(x => `${x.w}x${x.h}` === c.readySize); return s ? s.sku || '' : ''; };

  /* ---------- two ways to order: self-order (measure yourself, delivery) / free home consultation ---------- */
  const MODE_KEY = 'gali_mode_v1';
  let mode = store.get(MODE_KEY, 'self'); if (mode !== 'consult') mode = 'self';
  const DLV = CFG.delivery || {}, INST = DLV.install || {}, AREAS = INST.areas || [];
  const isSet = v => v !== null && v !== undefined && v !== '';

  // measuring instructions per type (shown in self-order)
  const MEASURE = {
    pleat: `<p><b>רוחב:</b> אם כבר יש מסילה, מודדים את האורך שלה. אם אין, מודדים את רוחב החלון ומוסיפים 15–20 ס״מ מכל צד, כדי שהווילון יכסה היטב.</p>
      <p><b>גובה:</b> מהתקרה (או מהמקום שבו תותקן המסילה) ועד הרצפה. מודדים בשלוש נקודות לאורך החלון ורושמים את המידה הקטנה.</p>`,
    roller: `<p><b>התקנה על הקיר או התקרה:</b> רוחב החלון ועוד 10 ס״מ מכל צד. גובה: מהמקום שבו יותקן הגליל ועד כ-10 ס״מ מתחת לאדן החלון.</p>
      <p><b>התקנה בתוך הנישה של החלון:</b> מודדים את הרוחב הפנימי בשלוש נקודות (למעלה, באמצע ולמטה) ורושמים את הקטנה. גובה: מהחלק העליון של הנישה ועד האדן.</p>`,
    roman: `<p><b>התקנה על הקיר או התקרה:</b> רוחב החלון ועוד 10 ס״מ מכל צד. גובה: מהמקום שבו יותקן הווילון ועד כ-10 ס״מ מתחת לאדן החלון.</p>
      <p><b>התקנה בתוך הנישה:</b> הרוחב הפנימי בשלוש נקודות, רושמים את הקטנה. גובה: מהחלק העליון של הנישה ועד האדן.</p>`
  };
  const MEASURE_TIPS = `<p class="tip">מודדים במטר מתכת, בס״מ ובלי לעגל. לא בטוחים? <button class="link" type="button" data-open-contact>שלחו לנו שאלה</button> או קבעו פגישת ייעוץ ונמדוד בשבילכם.</p>`;

  function setMode(m) {
    mode = m === 'consult' ? 'consult' : 'self'; store.set(MODE_KEY, mode);
    document.body.dataset.mode = mode;
    $$('[data-set-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.setMode === mode)));
    const self = mode === 'self';
    $('#modeIntro').textContent = self
      ? 'בוחרים, מודדים לפי ההוראות ומזמינים. ההזמנה מגיעה במשלוח עד הבית עם כל מה שצריך להתקנה, ואם רוצים גם עם התקנה.'
      : 'הכי פשוט: התקשרו, שלחו הודעה או השאירו פרטים ונחזור לתאם. בפגישה נגיע עם מגוון רחב של בדים, נמדוד ונסגור מחיר סופי.';
    $('#consultQuick').hidden = self;
    // in a consultation the curtain list is optional: keep the builder folded until asked for
    const fold = !self && !estOpened && !cart.length && editIndex < 0;
    $('#builder').classList.toggle('collapsed', fold);
    $('#estNote').hidden = self; $('#estOpen').hidden = !fold;
    $('#builderTitle').textContent = editIndex >= 0 ? 'עריכת וילון' : (self ? 'הוספת וילון' : 'הערכת מחיר (לא חובה)');
    $('#measureNote').textContent = self ? 'מודדים בס״מ לפי ההוראות כאן למטה. המדידה באחריותכם, ואנחנו כאן לעזור בשאלות.' : 'מספיקות מידות משוערות. נמדוד במדויק בפגישה.';
    $('#measureOkBox').hidden = !self;
    $('#measureGuide').hidden = !self;
    $('#fabricHint').textContent = self ? 'מבחר הבדים באתר. רוצים לראות עוד? בפגישת ייעוץ נביא מגוון רחב יותר.' : 'אפשר לבחור עכשיו או להשאיר לפגישה. נביא איתנו מגוון רחב יותר.';
    const unsure = $('#fMechSide').querySelector('[value="לא בטוח"]'); unsure.disabled = self; unsure.hidden = self;
    if (self && $('#fMechSide').value === 'לא בטוח') $('#fMechSide').value = '';
    $('#addItem').textContent = editIndex >= 0 ? 'שמירת שינויים' : (self ? 'הוספה להזמנה' : 'הוספה לרשימה');
    $('#cartTitle').textContent = self ? 'ההזמנה שלי' : 'הווילונות לפגישה';
    $('#deliveryBox').hidden = !self; $('#consultBox').hidden = self;
    $('#meetBox').hidden = self;
    $('#detailsTitle').textContent = self ? 'פרטים למשלוח' : 'פרטים לתיאום הפגישה';
    $('#sendBtn').textContent = sendLabel();
    renderTypeFields(); update(); renderCart();
  }
  let estOpened = false;
  $('#estOpen').addEventListener('click', () => { estOpened = true; $('#builder').classList.remove('collapsed'); $('#estOpen').hidden = true; });
  $('#cqForm').addEventListener('click', e => { e.preventDefault(); goTo('#detailsForm'); });
  if (waHref()) { $('#cqWa').href = waHref(); $('#cqWa').hidden = false; }
  if (telHref) { $('#cqCall').href = telHref; $('#cqCall').textContent = 'התקשרו · ' + site.phone; $('#cqCall').hidden = false; }
  const sendLabel = () => mode === 'self' ? 'שליחת ההזמנה' : 'קביעת פגישת ייעוץ';
  $('#modePick').addEventListener('click', e => { const b = e.target.closest('[data-set-mode]'); if (b) setMode(b.dataset.setMode); });
  document.addEventListener('click', e => { const a = e.target.closest('[data-mode]'); if (a) setMode(a.dataset.mode); });

  const deliveryChoice = () => (document.querySelector('input[name=delivery]:checked') || {}).value || 'ship';
  $('#shipText').textContent = isSet(DLV.shippingFee) ? (num(DLV.shippingFee) ? money(num(DLV.shippingFee)) : 'חינם') : 'דמי משלוח קבועים';
  $('#installText').textContent = 'המחיר לפי כמות הווילונות, סוג הווילון ואזור ההתקנה';
  $('#fArea').innerHTML = '<option value="">בחרו אזור</option>' + AREAS.map(a => `<option>${esc(a.name)}</option>`).join('');
  $('#deliveryBox').addEventListener('change', () => renderCart());

  /* shipping + installation for self-order; unknown prices are shown as "given before approval" */
  function deliveryCalc() {
    const rows = []; let add = 0, pending = false;
    if (mode !== 'self' || !cart.length) return { rows, add, pending };
    if (isSet(DLV.shippingFee)) { rows.push(['משלוח', num(DLV.shippingFee) ? money(num(DLV.shippingFee)) : 'חינם']); add += num(DLV.shippingFee); }
    else { rows.push(['משלוח', 'יימסר לפני אישור']); pending = true; }
    if (deliveryChoice() === 'install') {
      const per = INST.perType || {}; let inst = 0, known = true;
      cart.forEach(c => { if (isSet(per[c.typeId])) inst += num(per[c.typeId]) * (num(c.qty) || 1); else known = false; });
      const area = AREAS.find(a => a.name === $('#fArea').value);
      if (AREAS.length && !area) known = false; if (area) inst += num(area.add);
      if (known) { rows.push(['התקנה', money(inst)]); add += inst; }
      else { rows.push(['התקנה', 'לפי כמות, סוג ואזור · יימסר לפני אישור']); pending = true; }
    }
    return { rows, add, pending };
  }

  function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

  function setType(id) {
    cur.typeId = id || ''; cur.fabricId = ''; cur.color = '';
    $$('#typePick [data-type]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === cur.typeId)));
    // once a type is chosen only it stays visible; "החלפת סוג" opens the full list again
    $('#typePick').classList.toggle('picked', !!cur.typeId);
    $('#changeType').hidden = !cur.typeId;
    $('#builder').classList.toggle('no-type', !cur.typeId);
    renderTypeFields(); update();
  }
  $('#changeType').addEventListener('click', () => {
    $('#typePick').classList.remove('picked'); $('#changeType').hidden = true;
  });

  function renderTypeFields() {
    const t = PR.typeOf(cat, cur.typeId) || {};
    // straight roman (custom size) uses only the dedicated roman fabrics from the production floor
    const fabs = PR.fabricsFor(cat, t).filter(f => !isReadyType(t) || f.group === 'רומי');
    $('#fabricBox').hidden = !fabs.length;
    if (fabs.length) {
      // customers see the fabric name only; notes from the production floor are internal
      const opt = f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`;
      let html = `<option value="">${mode === 'consult' ? 'נבחר יחד בפגישה' : 'בחרו בד'}</option>`;
      if (t.roman) {
        const own = fabs.filter(f => f.group === 'רומי'), other = fabs.filter(f => f.group !== 'רומי');
        if (own.length) html += `<optgroup label="בדים לרומי (כלול במחיר)">${own.map(opt).join('')}</optgroup>`;
        if (other.length) html += `<optgroup label="בדי וילון נוספים (בתוספת מחיר הבד)">${other.map(opt).join('')}</optgroup>`;
      } else html += fabs.map(opt).join('');
      $('#fFabric').innerHTML = html; $('#fFabric').value = cur.fabricId || '';
    }
    $('#readyBox').hidden = !isReadyType(t);
    $('#wBox').hidden = $('#hBox').hidden = false;
    if (isReadyType(t)) renderReady();
    $('#fullnessBox').hidden = !t.hasPleat;
    $('#railBox').hidden = !t.hasRail;
    $('#rollerBox').hidden = !t.roller;
    $('#mechBox').hidden = !hasMech(t);
    const rule = t.rule === 'roman' || t.roman ? 'roman' : t.roller ? 'roller' : t.hasPleat ? 'pleat' : '';
    $('#measureBody').innerHTML = (MEASURE[rule] || MEASURE.roller) + MEASURE_TIPS;
    const nicheOpt = $('#fMount').querySelector('[value="נישה"]'); nicheOpt.hidden = nicheOpt.disabled = !(t.roller || t.roman);
    if (nicheOpt.disabled && $('#fMount').value === 'נישה') $('#fMount').value = '';
    renderFabricExtras();
  }

  /* ---------- straight roman in ready sizes ---------- */
  function renderReady() {
    const on = cur.romanReady !== false;
    $$('#romanSize [data-rs]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.rs === 'ready') === on)));
    $('#readyPick').hidden = !on; $('#customRomanNote').hidden = on;
    if (!on) return;
    $('#wBox').hidden = $('#hBox').hidden = true; $('#fabricBox').hidden = true;
    const m = readyModel(cur.readyModel);
    $('#readyModels').innerHTML = READY.models.map(x => `<button type="button" class="model" data-model="${esc(x.id)}" aria-pressed="${x.id === cur.readyModel}">
      <img src="${esc(x.photos[0] || x.fabric)}" alt="" loading="lazy"><span><b>${esc(x.name)}</b><small>${esc(x.note || '')}</small></span></button>`).join('');
    $('#readyGallery').innerHTML = m ? [m.fabric, ...m.photos].filter(Boolean).map((src, i) =>
      `<button type="button" data-zoom="${esc(src)}" aria-label="הגדלת תמונה"><img src="${esc(src)}" alt="" loading="lazy">${i === 0 && m.fabric ? '<span>הבד מקרוב</span>' : ''}</button>`).join('') : '';
    const sel = $('#fReadySize');
    sel.innerHTML = m ? '<option value="">בחרו מידה</option>' + m.sizes.map(s => `<option value="${s.w}x${s.h}">${s.w} × ${s.h} ס״מ</option>`).join('') : '<option value="">בחרו קודם דגם</option>';
    sel.disabled = !m;
    if (m && !m.sizes.some(s => `${s.w}x${s.h}` === cur.readySize)) cur.readySize = '';
    sel.value = cur.readySize || '';
  }
  $('#romanSize').addEventListener('click', e => { const b = e.target.closest('[data-rs]'); if (!b) return; cur.romanReady = b.dataset.rs === 'ready'; renderTypeFields(); update(); });
  $('#readyModels').addEventListener('click', e => { const b = e.target.closest('[data-model]'); if (!b) return; cur.readyModel = b.dataset.model; renderReady(); update(); });
  $('#readyGallery').addEventListener('click', e => {
    const b = e.target.closest('[data-zoom]'); if (!b) return;
    const lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = `<img src="${esc(b.dataset.zoom)}" alt="">`;
    lb.addEventListener('click', () => lb.remove()); document.body.appendChild(lb);
  });

  function renderFabricExtras() {
    const f = PR.fabricOf(cat, cur.fabricId);
    const sw = f && img('fab_' + f.id);
    $('#fabSwatch').hidden = !sw; if (sw) $('#fabSwatch').src = sw;
    const colors = f && f.colors && f.colors.length ? f.colors : [];
    $('#colorBox').hidden = !colors.length;
    $('#fColor').innerHTML = '<option value="">בחרו צבע</option>' + colors.map(c => `<option>${esc(c)}</option>`).join('');
    $('#fColor').value = cur.color || '';
  }

  function readForm() {
    const [brand, kind] = ($('#fMotor').value || '|').split('|');
    Object.assign(cur, {
      location: $('#fLocation').value, qty: Math.max(1, Math.min(20, parseInt($('#fQty').value) || 1)),
      width: $('#fWidth').value, heightR: $('#fHeight').value, heightL: $('#fHeight').value,
      fabricId: $('#fabricBox').hidden ? '' : $('#fFabric').value, color: $('#colorBox').hidden ? '' : $('#fColor').value,
      fullness: $('#fFullness').value, rail: $('#fRail').value || 'A', mechSide: $('#fMechSide').value, mount: $('#fMount').value,
      cassette: $('#fCassette').checked, motorBrand: brand || '', motorKind: brand ? kind : '', remoteId: brand ? $('#fRemote').value : '',
      notes: $('#fNotes').value.trim()
    });
    const t = PR.typeOf(cat, cur.typeId) || {};
    cur.isReady = isReadyType(t) && cur.romanReady !== false;
    if (cur.isReady) {
      cur.readySize = $('#fReadySize').value;
      const [w, h] = (cur.readySize || '').split('x');
      Object.assign(cur, { width: w || '', heightR: h || '', heightL: h || '', fabricId: '', color: '' });
    }
    if (!t.hasPleat) cur.fullness = '';
    if (!t.hasRail) cur.rail = '';
    if (!t.roller) Object.assign(cur, { cassette: false, motorBrand: '', motorKind: '', remoteId: '' });
    if (!hasMech(t)) cur.mechSide = '';
    // chain only on manual rollers; length follows the height automatically
    cur.chainLen = t.roller && !cur.motorBrand ? PR.chainLen(cur) : '';
  }

  function writeForm(c) {
    $('#fLocation').value = c.location || ''; $('#fQty').value = c.qty || 1;
    $('#fWidth').value = c.width || ''; $('#fHeight').value = c.heightR || '';
    $('#fFullness').value = c.fullness || '3'; $('#fRail').value = c.rail || 'A'; $('#fMechSide').value = c.mechSide || ''; $('#fMount').value = c.mount || '';
    $('#fCassette').checked = !!c.cassette; $('#fMotor').value = c.motorBrand ? c.motorBrand + '|' + c.motorKind : '';
    $('#fRemote').value = c.remoteId || ''; $('#fNotes').value = c.notes || '';
  }

  function update() {
    readForm();
    $('#remoteBox').hidden = !cur.motorBrand;
    const r = PR.railOf(cat, $('#fRail').value); $('#railHint').textContent = r ? r.note || '' : '';
    $('#chainBox').hidden = !((PR.typeOf(cat, cur.typeId) || {}).roller && !cur.motorBrand);
    $('#chainVal').textContent = cur.chainLen ? cur.chainLen + ' מ׳' : 'יחושב לפי הגובה';
    const e = PR.estimate(cat, cur);
    $('#priceLine').hidden = !showPrices;
    const pv = $('#priceVal'), nt = e.p ? money(e.p) : '—';
    if (pv.textContent !== nt) { pv.textContent = nt; pv.classList.add('bump'); clearTimeout(pv._t); pv._t = setTimeout(() => pv.classList.remove('bump'), 250); }
    $('#priceExplain').textContent = e.p ? e.explain : e.explain;
  }

  $('#builder').addEventListener('input', e => { if (e.target.id === 'fFabric') { cur.fabricId = e.target.value; cur.color = ''; renderFabricExtras(); } update(); });
  $('#builder').addEventListener('change', update);

  function describe(c) {
    const t = PR.typeOf(cat, c.typeId), f = PR.fabricOf(cat, c.fabricId);
    const parts = [c.isReady && readyModel(c.readyModel) ? 'דגם ' + readyModel(c.readyModel).name + ' (מידה מוכנה)' : '', c.width && c.heightR ? `${c.width}×${c.heightR} ס״מ` : '', c.mount ? (c.mount === 'נישה' ? 'בנישה' : 'ל' + c.mount) : '', f ? 'בד ' + f.name : '', c.color, c.fullness ? 'כיווץ ' + c.fullness : '',
      c.rail && c.rail !== 'A' ? (PR.railOf(cat, c.rail) || { name: 'מסילה ' + c.rail }).name : '',
      c.mechSide && c.mechSide !== 'לא בטוח' ? 'מנגנון ' + c.mechSide : '', c.chainLen ? 'שרשרת ' + c.chainLen + ' מ׳' : '', c.cassette ? 'קסטה' : '', c.motorBrand ? (c.motorKind === 'wt' ? 'מנוע חכם' : 'מנוע עם שלט') : '', c.qty > 1 ? c.qty + ' יח׳' : ''];
    return { title: (t ? t.name : 'וילון') + (c.location ? ' · ' + c.location : ''), detail: parts.filter(Boolean).join(' · ') };
  }

  function validate(c) {
    const t = PR.typeOf(cat, c.typeId);
    if (!t) return 'בחרו סוג וילון';
    if (c.isReady && !c.readyModel) return 'בחרו דגם';
    if (c.isReady && !c.readySize) return 'בחרו מידה';
    if (!num(c.width) || num(c.width) < 30) return 'הזינו רוחב בס״מ';
    if (!num(c.heightR) || num(c.heightR) < 30) return 'הזינו גובה בס״מ';
    if (mode === 'consult') return '';   // in a consultation we measure and pick fabrics together
    if (!c.mount) return 'בחרו חיבור (תקרה, קיר או נישה)';
    if (!c.isReady && PR.fabricsFor(cat, t).length && !c.fabricId) return 'בחרו בד';
    if (hasMech(t) && !c.mechSide) return 'בחרו צד מנגנון';
    return '';
  }

  $('#addItem').addEventListener('click', () => {
    readForm();
    const err = validate(cur);
    $('#builderErr').hidden = !err; $('#builderErr').textContent = err;
    if (err) return;
    const item = JSON.parse(JSON.stringify(cur));
    const e = PR.estimate(cat, item); item._price = e.p;
    if (editIndex >= 0) cart[editIndex] = item; else cart.push(item);
    editIndex = -1; $('#cancelEdit').hidden = true; $('#addItem').textContent = mode === 'self' ? 'הוספה להזמנה' : 'הוספה לרשימה'; $('#builderTitle').textContent = mode === 'self' ? 'הוספת וילון' : 'הערכת מחיר (לא חובה)';
    store.set(CART_KEY, cart); renderCart();
    $('#fWidth').value = ''; $('#fHeight').value = ''; $('#fNotes').value = ''; $('#fQty').value = 1; update();
    if (window.innerWidth < 900) goTo('#cartPanel');
  });
  $('#cancelEdit').addEventListener('click', () => { editIndex = -1; $('#cancelEdit').hidden = true; $('#addItem').textContent = mode === 'self' ? 'הוספה להזמנה' : 'הוספה לרשימה'; $('#builderTitle').textContent = mode === 'self' ? 'הוספת וילון' : 'הערכת מחיר (לא חובה)'; });

  function renderCart() {
    // re-price with the current catalog
    cart.forEach(c => { c._price = PR.estimate(cat, c).p; });
    $('#items').innerHTML = cart.length ? cart.map((c, i) => { const d = describe(c); return `
      <li class="item"><div><div class="t">${esc(d.title)}</div><div class="d">${esc(d.detail)}</div>
        ${showPrices ? `<div class="d">${c._price ? money(c._price) : 'מחיר בייעוץ'}</div>` : ''}</div>
        <div class="acts"><button class="link" type="button" data-edit="${i}">עריכה</button><button class="link" type="button" data-del="${i}">הסרה</button></div></li>`; }).join('')
      : `<li class="empty">${mode === 'self' ? 'עוד לא הוספתם וילונות. בחרו סוג, בד ומידות בטופס.' : 'אפשר להוסיף וילונות לקבלת הערכת מחיר, או לשלוח בקשה לפגישה גם בלי רשימה.'}</li>`;
    const items = cart.reduce((a, c) => a + (c._price || 0), 0), unpriced = cart.some(c => !c._price);
    const d = deliveryCalc();
    $('#areaBox').hidden = !(mode === 'self' && deliveryChoice() === 'install' && AREAS.length);
    $('#sumRows').innerHTML = showPrices && d.rows.length ? [['וילונות', items ? money(items) : '—'], ...d.rows].map(([k, v]) => `<div><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('') : '';
    const total = items + d.add;
    $('#totalRow').hidden = !showPrices || !items;
    $('#totalLabel').textContent = mode === 'self' ? (d.pending ? 'סה״כ עד כה (כולל מע״מ)' : 'סה״כ (כולל מע״מ)') : 'הערכת מחיר משוערת (כולל מע״מ)';
    $('#totalVal').textContent = money(total) + (unpriced ? ' + פריטים בייעוץ' : '');
    const pieces = cart.reduce((a, c) => a + (num(c.qty) || 1), 0);
    $('#consultTip').textContent = pieces >= 2
      ? 'מעולה. נביא לפגישה בדים שמתאימים לווילונות שבחרתם, ונמדוד הכל במקום.'
      : 'פגישת הייעוץ מומלצת להזמנה של 2 וילונות ומעלה. לווילון אחד אפשר גם להזמין בקלות בהזמנה אונליין.';
    $('#sendBtn').disabled = mode === 'self' && !cart.length;
  }
  $('#items').addEventListener('click', e => {
    const d = e.target.closest('[data-del]'), ed = e.target.closest('[data-edit]');
    if (d) { cart.splice(+d.dataset.del, 1); store.set(CART_KEY, cart); renderCart(); }
    if (ed) {
      editIndex = +ed.dataset.edit; const c = cart[editIndex];
      setType(c.typeId); cur = Object.assign({}, c); writeForm(c); renderTypeFields(); $('#fFabric').value = c.fabricId || ''; renderFabricExtras(); update();
      $('#builder').classList.remove('collapsed'); $('#estOpen').hidden = true;
      $('#cancelEdit').hidden = false; $('#addItem').textContent = 'שמירת שינויים'; $('#builderTitle').textContent = 'עריכת וילון';
      goTo('#builder');
    }
  });

  /* ---------- send order ---------- */
  const form = $('#detailsForm');
  const saved = store.get(DETAILS_KEY, {});
  ['name', 'phone', 'email', 'city', 'street', 'house', 'floorApt'].forEach(k => { if (saved[k]) form.elements[k].value = saved[k]; });
  form.addEventListener('input', () => { const o = {}; ['name', 'phone', 'email', 'city', 'street', 'house', 'floorApt'].forEach(k => o[k] = form.elements[k].value); store.set(DETAILS_KEY, o); });

  function orderText(cust) {
    const lines = cart.map((c, i) => { const d = describe(c); return `${i + 1}. ${d.title}: ${d.detail}${showPrices && c._price ? ' (' + money(c._price) + ')' : ''}${c.notes ? ' · ' + c.notes : ''}`; });
    const total = cart.reduce((a, c) => a + (c._price || 0), 0);
    const head = mode === 'self' ? 'הזמנה אונליין מהאתר · ' + (deliveryChoice() === 'install' ? 'משלוח + התקנה' : 'משלוח') : 'בקשה לפגישת ייעוץ מהאתר' + (cust.meetWhen ? ' · ' + cust.meetWhen : '');
    return `${head}\n${cust.name} · ${cust.phone}\n${cust.city} ${cust.street || ''} ${cust.house || ''}\n\n${lines.join('\n')}${showPrices && total ? '\n\nסה״כ הערכה: ' + money(total) : ''}${cust.notes ? '\n\nהערות: ' + cust.notes : ''}`;
  }

  function msg(el, cls, text) { el.className = 'msg ' + cls; el.textContent = text; el.hidden = false; }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form));
    const self = mode === 'self';
    if (self && !cart.length) return msg($('#sendMsg'), 'err', 'הוסיפו לפחות וילון אחד להזמנה.');
    if (self) {
      const bad = cart.findIndex(c => validate(c));
      if (bad >= 0) return msg($('#sendMsg'), 'err', `בווילון ${bad + 1} (${describe(cart[bad]).title}) חסר: ${validate(cart[bad]).replace(/^בחרו /, '')}. לחצו "עריכה" והשלימו.`);
    }
    if (!fd.name.trim() || !fd.phone.trim() || !fd.city.trim()) return msg($('#sendMsg'), 'err', 'נא למלא שם, טלפון ועיר.');
    if (self && (!fd.street.trim() || !fd.house.trim())) return msg($('#sendMsg'), 'err', 'נא למלא כתובת מלאה למשלוח (רחוב ומספר בית).');
    if (self && deliveryChoice() === 'install' && AREAS.length && !$('#fArea').value) return msg($('#sendMsg'), 'err', 'בחרו אזור התקנה.');
    if (fd.phone.replace(/\D/g, '').length < 9) return msg($('#sendMsg'), 'err', 'מספר הטלפון נראה חסר.');
    if (self && !fd.measureOk) return msg($('#sendMsg'), 'err', 'נא לאשר שהמידות נמדדו על ידכם ובאחריותכם.');
    if (!fd.consent) return msg($('#sendMsg'), 'err', 'נא לאשר שנחזור אליכם.');
    const [floor, apt] = String(fd.floorApt || '').split(/[\/,]/).map(s => s.trim());
    const customer = { name: fd.name.trim(), phone: fd.phone.trim(), email: fd.email.trim(), city: fd.city.trim(), street: fd.street.trim(), house: fd.house.trim(), floor: floor || '', apt: apt || '', notes: fd.notes.trim(), meetWhen: self ? '' : (fd.meetWhen || '') };
    const items = cart.map(c => {
      const m = c.motorBrand ? PR.pickMotor(cat, c) : null;
      const t = PR.typeOf(cat, c.typeId), f = PR.fabricOf(cat, c.fabricId);
      const rm = c.isReady ? readyModel(c.readyModel) : null;
      return { typeId: c.typeId, typeName: t ? t.name : '', fabricId: c.fabricId || '', fabricName: rm ? 'רומי מוכן ' + rm.name : (f ? f.name : ''),
        fabricText: rm ? 'רומי מוכן ' + rm.name : '', readyModel: rm ? rm.name : '', readySku: rm ? readySku(c) : '', color: c.color || '', location: c.location || '',
        width: num(c.width), heightR: num(c.heightR), heightL: num(c.heightL || c.heightR), qty: c.qty || 1, fullness: c.fullness || '', rail: c.rail || '',
        mechSide: c.mechSide === 'לא בטוח' ? '' : (c.mechSide || ''), chainLen: c.chainLen || '', mount: c.mount || '',
        cassette: !!c.cassette, motorId: m ? m.id : '', motorKind: m ? c.motorKind : '', remoteId: c.remoteId || '', notRomanFab: !!(t && t.roman && f && f.group !== 'רומי'),
        notes: c.notes || '', estimate: c._price || 0 };
    });
    const estimate = items.reduce((a, c) => a + c.estimate, 0);
    const dc = deliveryCalc();
    const delivery = self ? { method: deliveryChoice() === 'install' ? 'משלוח + התקנה' : 'משלוח', area: $('#fArea').value || '', fees: dc.add, pending: dc.pending } : null;

    if (!window.Gali.configured) {
      // site not connected to Google yet: offer WhatsApp instead
      if (waHref()) { $('#sendWa').hidden = false; $('#sendWa').onclick = () => window.open(waHref(orderText(customer)), '_blank'); }
      const alt = [waHref() && 'לשלוח את ההזמנה בווטסאפ', site.phone && 'להתקשר ' + site.phone].filter(Boolean).join(' או ');
      return msg($('#sendMsg'), 'err', 'השליחה מהאתר עדיין בהקמה.' + (alt ? ' אפשר ' + alt + '.' : ''));
    }
    $('#sendBtn').disabled = true; $('#sendBtn').textContent = 'שולחים...';
    try {
      const r = await post({ action: 'order', mode: self ? 'self' : 'consult', delivery, customer, items, estimate, website: fd.website || '' });
      cart = []; store.del(CART_KEY); renderCart();
      msg($('#sendMsg'), 'ok', self
        ? `תודה ${customer.name}! ההזמנה התקבלה (מספר ${r.id}). נעבור עליה ונחזור אליכם לאישור ולתיאום המשלוח.`
        : `תודה ${customer.name}! הבקשה לפגישת ייעוץ התקבלה (מספר ${r.id}). נחזור אליכם בהקדם לתיאום מועד.`);
    } catch (err) {
      msg($('#sendMsg'), 'err', 'משהו השתבש בשליחה. נסו שוב' + (waHref() ? ', או שלחו בווטסאפ.' : '.'));
      if (waHref()) { $('#sendWa').hidden = false; $('#sendWa').onclick = () => window.open(waHref(orderText(customer)), '_blank'); }
    } finally { $('#sendBtn').textContent = sendLabel(); $('#sendBtn').disabled = mode === 'self' && !cart.length; }
  });

  /* ---------- floating contact ---------- */
  const panel = $('#contactPanel');
  const openPanel = () => { panel.hidden = false; panel.querySelector('input[name=name]').focus({ preventScroll: true }); };
  document.addEventListener('click', e => { if (e.target.closest('[data-open-contact]')) openPanel(); });
  $('#cpClose').addEventListener('click', () => { panel.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
  document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('[data-open-contact]')) panel.hidden = true; });

  $('#leadForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target)), m = $('#leadMsg');
    if (!fd.name.trim() || fd.phone.replace(/\D/g, '').length < 9) return msg(m, 'err', 'נא למלא שם וטלפון.');
    if (!window.Gali.configured) {
      if (waHref()) { window.open(waHref(`היי, אשמח לשיחת ייעוץ.\nשם: ${fd.name}\nטלפון: ${fd.phone}\n${fd.when ? 'מתי נוח: ' + fd.when + '\n' : ''}${fd.topic || ''}`), '_blank'); return msg(m, 'ok', 'פתחנו לכם ווטסאפ עם הפרטים.'); }
      return msg(m, 'err', 'הטופס עדיין בהקמה.' + (site.phone ? ' אפשר להתקשר ' + site.phone : ''));
    }
    const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
    try { await post({ action: 'lead', kind: 'שיחת ייעוץ', name: fd.name.trim(), phone: fd.phone.trim(), when: fd.when, topic: fd.topic, website: fd.website || '' });
      e.target.reset(); msg(m, 'ok', 'תודה! נחזור אליכם ' + (fd.when && fd.when !== 'בהקדם' ? 'ב' + fd.when.split(' ')[0] : 'בהקדם') + '.');
    } catch (err) { msg(m, 'err', 'לא הצלחנו לשלוח. נסו שוב או כתבו לנו בווטסאפ.'); }
    finally { btn.disabled = false; }
  });

  /* init */
  setType(cur.typeId); setMode(mode);
  document.dispatchEvent(new Event('gali:ready'));
})();
