/* Builds the PUBLIC catalog from a production-floor backup file (state.settings).
   Keeps customer prices only: no supplier costs, supplier names or price books leave the browser. */
window.buildPublicCatalog = function (settings) {
  const s = settings || {}, P = s.pricing || {}, R = s.roller || {};
  const N = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const AF = N(P.addonFactor) || 1, vat = 1 + N(P.vat) / 100;
  const tiers = [...(P.tiers || [])].sort((a, b) => (a.upTo === '' ? 1e9 : N(a.upTo)) - (b.upTo === '' ? 1e9 : N(b.upTo)));
  const tier = cost => { const c = N(cost); if (!c) return 0; const t = tiers.find(x => x.upTo === '' || c <= N(x.upTo)); return t ? N(t.price) : 0; };
  return {
    updated: new Date().toISOString().slice(0, 10),
    pricing: { sewPerM: N(P.sewPerM), pleatMaxH: N(P.pleatMaxH), romanPerSqm: N(P.romanPerSqm), romanAddCm: P.romanAddCm == null ? 20 : N(P.romanAddCm),
      decoRailPerM: N(P.decoRailPerM), rollerMinW: N(R.minWidthCm), rollerMinH: N(R.minHeightCm), rollMarginCm: 20,
      topCm: N((s.formula || {}).topCm), hemCm: N((s.formula || {}).hemCm) },
    roller: {
      cassettePerM: N(R.cassettePerM) * AF,
      tubesMotor: (R.tubesMotor || []).map(x => ({ from: N(x.from), to: N(x.to), perM: N(x.perM) * AF })),
      tubesNoMotor: (R.tubesNoMotor || []).map(x => ({ from: N(x.from), to: N(x.to), perM: N(x.perM) * AF })),
      motors: (R.motors || []).map(m => ({ id: m.id, name: m.name, fits: m.fits, rts: N(m.rts) * AF, wt: N(m.wt) * AF })),
      remotes: (R.remotes || []).map(r => ({ id: r.id, name: r.name, dooya: N(r.dooya) * AF, somfy: N(r.somfy) * AF }))
    },
    fullness: ((s.lists || {}).fullness || []).map(String),
    locations: (s.lists || {}).locations || [],
    types: (s.types || []).map(t => ({ id: t.id, name: t.name, rule: t.priceRule || '', group: t.fabricGroup || '', cat: t.fabricCat || '',
      roller: !!t.roller, hasPleat: !!t.hasPleat, hasRail: !!t.hasRail, roman: t.priceRule === 'roman' ? (t.id === 't_roman_soft' ? 'soft' : 'straight') : null })),
    fabrics: (s.fabrics || []).filter(f => f.active).map(f => ({ id: f.id, name: f.model || '', group: f.group || '', category: f.category || '',   // internal notes (price-book codes etc.) are not published
      colors: f.colors || [], widthCm: N(f.widthCm), pm: tier(f.cost), psqm: Math.round(N(f.cost) * N(P.rollerFactor) * vat * 100) / 100 }))
  };
};
