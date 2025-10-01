// pages/api/affiliates.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.hydrinity.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ⚠️ Hardcoding is risky; rotate if leaked.
  const API_KEY = 'REPLACE_WITH_YOUR_UPPROMOTE_API_KEY'; // from UpPromote Settings → Integration → API

  const out = [];
  let page = 1;
  const limit = 100; // max page size if supported

  try {
    for (;;) {
      const url = `https://aff-api.uppromote.com/api/v1/affiliates?limit=${limit}&page=${page}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' },
      });

      if (!r.ok) {
        const body = await r.text();
        return res.status(502).json({
          error: 'Failed to fetch affiliates',
          upstream_status: r.status,
          upstream_detail: body,
        });
      }

      const data = await r.json();
      const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

      if (rows.length === 0) break;

      for (const a of rows) {
        out.push({
          id: a.id ?? a.aff_id ?? null,
          name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.name || null,
          email: a.email || null,
          zip: a.zip_code || a.postcode || null,
          // sca_ref may be nested differently; keep best-effort extraction:
          sca_ref:
            a.referral_link?.includes?.('sca_ref=')
              ? a.referral_link.split('sca_ref=')[1]
              : a.sca_ref ?? null,
        });
      }

      page += 1;
    }

    return res.status(200).json(out);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
