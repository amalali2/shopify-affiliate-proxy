// /api/affiliates.js (Next.js API Route – Node runtime)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.hydrinity.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // For quick testing you can pass ?token=... (prefer env vars in production)
  const API_KEY = (req.query.token || process.env.UPPROMOTE_API_KEY || '').trim();
  if (!API_KEY) return res.status(400).json({ error: 'Missing API key' });

  const base = 'https://aff-api.uppromote.com/api/v1';

  try {
    // 1) Verify key
    const authResp = await fetch(`${base}/authentication`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' },
    });
    if (!authResp.ok) {
      const detail = await safeText(authResp);
      return res.status(401).json({
        error: 'UpPromote auth failed',
        upstream_status: authResp.status,
        upstream_detail: detail
      });
    }

    // 2) Paginate affiliates
    const out = [];
    let page = 1;
    const limit = 100; // max 100 per docs
    while (true) {
      const url = new URL(`${base}/affiliates`);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('page', String(page));

      const r = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: 'application/json',
        },
      });

      if (!r.ok) {
        const detail = await safeText(r);
        return res.status(502).json({
          error: 'Failed to fetch affiliates',
          upstream_status: r.status,
          upstream_detail: detail
        });
      }

      const json = await r.json();
      const data = json?.data || [];

      // Map to your required JSON structure
      for (const a of data) {
        // Name should be the company (fallback to first+last, then email)
        const name =
          a.company?.trim() ||
          `${a.first_name || ''} ${a.last_name || ''}`.trim() ||
          a.email ||
          '';

        // Extract sca_ref from affiliate_link if present
        const sca_ref = (typeof a.affiliate_link === 'string' && a.affiliate_link.includes('sca_ref='))
          ? a.affiliate_link.split('sca_ref=')[1].split(/[&?#]/)[0]
          : null;

        out.push({
          name,                         // ← company-first
          address: a.address || '',
          city: a.city || '',
          state: a.state || '',
          zip_code: a.zipcode || a.zip || '',
          phone: a.phone || '',
          sca_ref,
        });
      }

      // Stop if we've reached the last page
      const meta = json?.meta;
      if (!meta || page >= (meta.last_page || page)) break;
      page += 1;
    }

    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: String(err?.message || err) });
  }
}

async function safeText(resp) {
  try { return await resp.text(); } catch { return ''; }
}
