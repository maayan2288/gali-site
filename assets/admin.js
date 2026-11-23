(async function () {
  const { esc, post, loadConfig } = window.Gali;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const KEY = 'gali_admin_key';
  let key = ''; try { key = sessionStorage.getItem(KEY) || ''; } catch (e) {}
  let C, IMG = {};

  const show = (el, cls, text) => { el.className = 'msg ' + cls; el.textContent = text; el.hidden = false; if (cls === 'ok') setTimeout(() => { el.hidden = true; }, 4000); };
  const admin = (op, extra) => post(Object.assign({ action: 'admin', key, op }, extra || {}));

  if (!window.Gali.configured) { $('#notConfigured').hidden = false; return; }

  async function tryLogin(k) {
    key = k;
    try { await admin('check'); try { sessionStorage.setItem(KEY, k); } catch (e) {} return true; }
    catch (e) { return false; }
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const ok = await tryLogin(e.target.key.value.trim());
    if (ok) start(); else show($('#loginErr'), 'err', 'סיסמה שגויה (או שהסקריפט עדיין לא פורסם כ-Web App).');
  });
  $('#logout').addEventListener('click', () => { try { sessionStorage.removeItem(KEY); } catch (e) {} location.reload(); });

  if (key && await tryLogin(key)) start(); else $('#login').hidden = false;

  async function start() {
    $('#login').hidden = true; $('#app').hidden = false;
    C = await loadConfig(); IMG = C.images || {};
    fillSite(); renderImages(); renderFabrics();
  }

  /* tabs */
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.tab; });
  }));

  /* ---------- details ---------- */
  const TEXT_FIELDS = ['businessName', 'tagline', 'phone', 'whatsapp', 'whatsappText', 'email', 'serviceArea', 'hours', 'instagram', 'facebook', 'aboutTitle', 'aboutText', 'priceNote'];
  function fillSite() {
    const f = $('#siteForm'), s = C.site;
    TEXT_FIELDS.forEach(k => { f.elements[k].value = s[k] || ''; });
    f.elements.showPrices.checked = s.showPrices !== false;
    const types = C.catalog.types || [], descs = s.typeDescs || {}, hidden = s.hiddenTypes || [];
    $('#typeDescs').innerHTML = types.map(t => `<label class="f">${esc(t.name)}<textarea data-desc="${esc(t.id)}" rows="2">${esc(descs[t.id] || '')}</textarea></label>`).join('');
    $('#typeShow').innerHTML = types.map(t => `<label class="check"><input type="checkbox" data-show="${esc(t.id)}" ${hidden.includes(t.id) ? '' : 'checked'}> ${esc(t.name)}</label>`).join('');
  }
  $('#siteForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, site = {};
    TEXT_FIELDS.forEach(k => { site[k] = f.elements[k].value.trim(); });
    site.whatsapp = site.whatsapp.replace(/\D/g, '').replace(/^0/, '972');
    site.showPrices = f.elements.showPrices.checked;
    site.typeDescs = {}; $$('[data-desc]').forEach(t => { if (t.value.trim()) site.typeDescs[t.dataset.desc] = t.value.trim(); });
    site.hiddenTypes = $$('[data-show]').filter(c => !c.checked).map(c => c.dataset.show);
    f.classList.add('busy');
    try { await admin('saveSite', { site }); C.site = Object.assign(C.site, site); f.elements.whatsapp.value = site.whatsapp; show($('#siteMsg'), 'ok', 'נשמר. האתר מתעדכן תוך כשתי דקות.'); }
    catch (err) { show($('#siteMsg'), 'err', 'השמירה נכשלה: ' + err.message); }
    finally { f.classList.remove('busy'); }
  });

  /* ---------- images ---------- */
  function resize(file, max, keepPng) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = rej;
      r.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error('לא הצלחנו לקרוא את התמונה'));
        im.onload = () => {
          const sc = Math.min(1, max / Math.max(im.width, im.height));
          const cv = document.createElement('canvas'); cv.width = Math.round(im.width * sc); cv.height = Math.round(im.height * sc);
          const ctx = cv.getContext('2d');
          if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); }
          ctx.drawImage(im, 0, 0, cv.width, cv.height);
          res(keepPng ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.85));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  async function upload(slot, file, opts) {
    opts = opts || {};
    const dataUrl = await resize(file, opts.max || 1800, !!opts.png);
    const r = await admin('uploadImage', { slot, dataUrl, alt: opts.alt || '' });
    IMG[slot] = r.image;
  }

  function slotCard(slot, title, opts) {
    opts = opts || {};
    const im = IMG[slot];
    return `<div class="slot" data-slot="${esc(slot)}">
      ${im ? `<img class="pv ${opts.png ? 'contain' : ''}" src="${esc(im.url)}" alt="">` : `<div class="pv ph">אין תמונה</div>`}
      <div class="b"><strong>${esc(title)}</strong>${opts.hint ? `<span class="note">${esc(opts.hint)}</span>` : ''}
        <div class="row"><label class="btn primary small">${im ? 'החלפה' : 'העלאה'}<input type="file" accept="image/*" data-up="${esc(slot)}" data-png="${opts.png ? 1 : ''}" data-max="${opts.max || ''}"></label>
        ${im ? `<button class="btn ghost small" type="button" data-rm="${esc(slot)}">מחיקה</button>` : ''}</div></div></div>`;
  }

  function renderImages() {
    $('#mainSlots').innerHTML = slotCard('logo', 'לוגו', { png: true, max: 600, hint: 'PNG עם רקע שקוף נראה הכי טוב' })
      + slotCard('hero', 'תמונה ראשית', { hint: 'תמונה רחבה, מופיעה בראש האתר' })
      + slotCard('about', 'תמונה ל"עלינו"');
    $('#typeSlots').innerHTML = (C.catalog.types || []).map(t => slotCard('type_' + t.id, t.name)).join('');
    const gal = Object.keys(IMG).filter(k => /^gallery_/.test(k)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    $('#gallerySlots').innerHTML = gal.length ? gal.map((k, i) => slotCard(k, 'תמונה ' + (i + 1))).join('') : '<p class="muted">עוד אין תמונות בגלריה. הגלריה תופיע באתר אחרי שתעלי תמונה ראשונה.</p>';
  }

  document.addEventListener('change', async e => {
    const inp = e.target.closest('[data-up]'); if (!inp || !inp.files[0]) return;
    const card = inp.closest('.slot, tr'); card.classList.add('busy');
    try { await upload(inp.dataset.up, inp.files[0], { png: !!inp.dataset.png, max: +inp.dataset.max || 1800 }); show($('#imgMsg'), 'ok', 'התמונה עלתה.'); }
    catch (err) { show($('#imgMsg'), 'err', 'ההעלאה נכשלה: ' + err.message); }
    finally { renderImages(); renderFabrics(); }
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    if (!confirm('למחוק את התמונה?')) return;
    const card = b.closest('.slot, tr'); card.classList.add('busy');
    try { await admin('deleteImage', { slot: b.dataset.rm }); delete IMG[b.dataset.rm]; }
    catch (err) { show($('#imgMsg'), 'err', 'המחיקה נכשלה: ' + err.message); }
    finally { renderImages(); renderFabrics(); }
  });
  $('#galleryAdd').addEventListener('change', async e => {
    const files = [...e.target.files]; if (!files.length) return;
    show($('#imgMsg'), 'ok', 'מעלה ' + files.length + ' תמונות...');
    let n = 0;
    for (const f of files) { try { await upload('gallery_' + Date.now(), f); n++; renderImages(); } catch (err) {} }
    e.target.value = '';
    show($('#imgMsg'), n === files.length ? 'ok' : 'err', 'עלו ' + n + ' מתוך ' + files.length + ' תמונות.');
  });

  /* ---------- catalog ---------- */
  function renderFabrics() {
    const q = ($('#fabFilter').value || '').trim();
    const fabs = (C.catalog.fabrics || []).filter(f => !q || (f.name + ' ' + f.group + ' ' + f.category).includes(q));
    $('#fabRows').innerHTML = fabs.map(f => { const s = 'fab_' + f.id, im = IMG[s]; return `<tr>
      <td>${im ? `<img src="${esc(im.url)}" alt="">` : '—'}</td><td>${esc(f.name)}${f.note ? ' <span class="note">' + esc(f.note) + '</span>' : ''}</td><td>${esc(f.group)} ${esc(f.category)}</td>
      <td><label class="btn ghost small" style="position:relative;overflow:hidden">${im ? 'החלפה' : 'העלאה'}<input type="file" accept="image/*" data-up="${esc(s)}" data-max="700" style="position:absolute;inset:0;opacity:0"></label>
      ${im ? `<button class="link" type="button" data-rm="${esc(s)}">מחיקה</button>` : ''}</td></tr>`; }).join('');
  }
  $('#fabFilter').addEventListener('input', renderFabrics);

  let pending = null;
  $('#backupFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const j = JSON.parse(await file.text());
      const settings = (j.state || j).settings;
      if (!settings || !settings.types) throw new Error('זה לא נראה כמו קובץ גיבוי של רצפת הייצור');
      pending = window.buildPublicCatalog(settings);
      $('#catPreview').innerHTML = `<p>נמצאו <b>${pending.types.length}</b> סוגי וילונות ו-<b>${pending.fabrics.length}</b> בדים פעילים.</p>
        <button class="btn primary" type="button" id="saveCat">עדכון הקטלוג באתר</button>`;
      $('#saveCat').addEventListener('click', async () => {
        $('#saveCat').disabled = true;
        try { await admin('saveCatalog', { catalog: pending }); C.catalog = pending; fillSite(); renderImages(); renderFabrics(); show($('#catMsg'), 'ok', 'הקטלוג עודכן. האתר יציג את המחירים החדשים תוך כשתי דקות.'); }
        catch (err) { show($('#catMsg'), 'err', 'העדכון נכשל: ' + err.message); $('#saveCat').disabled = false; }
      });
    } catch (err) { show($('#catMsg'), 'err', err.message || 'הקובץ לא תקין'); }
  });
})();
