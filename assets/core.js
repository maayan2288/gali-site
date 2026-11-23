/* Shared: loads site details, catalog and images from Google (Apps Script), with local defaults as fallback. */
(function () {
  const CFG = window.GALI_CONFIG || {};
  const URL_ = (CFG.APPS_SCRIPT_URL || '').trim();

  function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  }

  async function loadConfig() {
    const out = { site: Object.assign({}, CFG.site || {}), catalog: window.GALI_DEFAULT_CATALOG || { types: [], fabrics: [] }, images: Object.assign({}, CFG.images || {}), live: false };
    if (!URL_) return out;
    try {
      const r = await withTimeout(fetch(URL_ + '?action=config', { cache: 'no-store' }), 8000);
      const j = await r.json();
      if (j && j.ok) {
        if (j.site) Object.assign(out.site, j.site);
        if (j.catalog && Array.isArray(j.catalog.types) && j.catalog.types.length) out.catalog = j.catalog;
        Object.assign(out.images, j.images || {});
        out.live = true;
      }
    } catch (e) { /* stay on defaults */ }
    return out;
  }

  /* text/plain avoids a CORS preflight, which Apps Script does not answer */
  async function post(payload) {
    if (!URL_) throw new Error('not_configured');
    const r = await withTimeout(fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) }), 30000);
    const j = await r.json();
    if (!j || !j.ok) throw new Error((j && j.error) || 'failed');
    return j;
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '₪' + Math.round(n).toLocaleString('he-IL');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  window.Gali = { loadConfig, post, esc, money, store, configured: !!URL_ };
})();
