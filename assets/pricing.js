/* Price estimate. Same formulas as the production-floor app (autoPrice / rollerExtras / autoFabric),
   working on the public catalog (customer prices only). Returns {p, explain} with p = 0 when no automatic price. */
(function () {
  const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

  function fabricOf(cat, id) { return (cat.fabrics || []).find(f => f.id === id) || null; }
  function typeOf(cat, id) { return (cat.types || []).find(t => t.id === id) || null; }

  /* which fabrics fit a type (fabOk in the app) */
  function fabricsFor(cat, t) {
    if (!t || !t.rule) return [];
    const all = cat.fabrics || [];
    if (t.roman) return all.filter(f => f.group === 'רומי' || f.group === 'פאלדים');
    return all.filter(f => (!t.group || f.group === t.group) && (!t.cat || String(f.category || '').includes(t.cat)));
  }

  /* roman: metres of fabric when the customer picks a non-roman fabric */
  function romanFabricMeters(cat, c) {
    const P = cat.pricing, f = fabricOf(cat, c.fabricId), w = num(c.width), h = num(c.heightR);
    const add = num(P.romanAddCm), cw = w + add, ch = h + add, roll = f ? num(f.widthCm) : 0;
    const R = x => Math.ceil(x * 10) / 10;
    if (!roll || roll >= cw) return R(ch / 100);
    if (roll >= ch) return R(cw / 100);
    return R(Math.ceil(cw / roll) * ch / 100);
  }

  function railsList() { return (window.GALI_CONFIG || {}).rails || [{ id: 'A', name: 'מסילה רגילה (A)', note: 'כלולה במחיר', perM: 0 }]; }
  function railOf(cat, id) { return railsList().find(r => r.id === id) || null; }

  /* chain length (metres) by height, same as chainAuto in the app */
  function chainLen(c) {
    const h = Math.max(num(c.heightR), num(c.heightL));
    if (!h) return '';
    return String(h <= 100 ? 0.5 : h <= 160 ? 1.2 : h <= 200 ? 1.5 : 2);
  }

  function pickMotor(cat, c) {
    if (!c.motorBrand) return null;
    const w = num(c.width), list = (cat.roller.motors || []).filter(m => m.name.toLowerCase().startsWith(c.motorBrand));
    const fit = list.find(m => (w <= 300 ? m.fits === 'עד 300' : m.fits === 'מעל 300')) || list[0];
    return fit || null;
  }

  function rollerExtras(cat, c) {
    const R = cat.roller, w = num(c.width), out = [];
    if (c.cassette) out.push({ name: 'קסטה סגורה', cost: Math.ceil(w) / 100 * num(R.cassettePerM) });
    const m = pickMotor(cat, c);
    const tube = (m ? R.tubesMotor : R.tubesNoMotor).find(x => w > num(x.from) && w <= num(x.to));
    if (tube) out.push({ name: 'צינור', cost: w / 100 * num(tube.perM) });
    if (m) out.push({ name: 'מנוע ' + (c.motorKind === 'wt' ? 'חכם' : 'רדיו'), cost: num(c.motorKind === 'wt' ? m.wt : m.rts) });
    if (m && c.remoteId) {
      const r = (R.remotes || []).find(x => x.id === c.remoteId);
      if (r) out.push({ name: r.name, cost: num(m.name.toLowerCase().startsWith('somfy') ? r.somfy : r.dooya) });
    }
    return out;
  }

  function estimate(cat, c) {
    const t = typeOf(cat, c.typeId); if (!t || !t.rule) return { p: 0, explain: 'המחיר יינתן בשיחת הייעוץ' };
    const P = cat.pricing, w = num(c.width), h = num(c.heightR), q = num(c.qty) || 1, f = fabricOf(cat, c.fabricId);
    if (!w || !h) return { p: 0, explain: 'חסר רוחב או גובה' };
    let p = 0, explain = '';
    if (t.rule === 'pleat') {
      if (h > num(P.pleatMaxH)) return { p: 0, explain: 'בגובה מעל ' + num(P.pleatMaxH) / 100 + ' מ׳ המחיר נקבע אחרי ייעוץ' };
      const k = num(c.fullness); if (!k) return { p: 0, explain: 'חסר כיווץ' };
      if (!f || !num(f.pm)) return { p: 0, explain: 'בחרו בד' };
      const wm = w / 100; p = (wm * k * num(f.pm) + wm * num(P.sewPerM)) * q;
      explain = 'בד ותפירה';
      const r = t.hasRail ? railOf(cat, c.rail) : null;
      if (r && r.id !== 'A') {
        const perM = r.perM != null ? num(r.perM) : (r.id === 'דקורטיבית' ? num(P.decoRailPerM) : 0);
        if (perM) { p += wm * perM * q; explain += ' + ' + r.name; }
        else explain += ' · ' + r.name + ': התוספת תימסר בהצעה';
      }
    } else if (t.rule === 'roller') {
      if (!f || !num(f.psqm)) return { p: 0, explain: 'בחרו בד' };
      const bw = Math.max(w, num(P.rollerMinW)), bh = Math.max(h, num(P.rollerMinH));
      const ex = rollerExtras(cat, c), ad = ex.reduce((a, x) => a + x.cost, 0);
      p = (bw / 100 * bh / 100 * num(f.psqm) + ad) * q;
      explain = 'בד' + (bw > w || bh > h ? ' (לפי מינימום חיוב)' : '') + (ex.length ? ' + ' + ex.map(x => x.name).join(' + ') : '');
    } else if (t.rule === 'roman') {
      p = w / 100 * h / 100 * num(P.romanPerSqm); explain = 'לפי מ״ר';
      if (f && f.group !== 'רומי') {
        if (!num(f.pm)) return { p: 0, explain: 'המחיר לבד הזה יינתן בייעוץ' };
        p += romanFabricMeters(cat, c) * num(f.pm); explain += ' + בד';
      }
      p *= q;
    } else return { p: 0, explain: 'המחיר יינתן בשיחת הייעוץ' };
    return { p: Math.round(p), explain: explain + (q > 1 ? ' × ' + q : '') };
  }

  window.GaliPricing = { estimate, fabricsFor, typeOf, fabricOf, pickMotor, railsList, railOf, chainLen };
})();
