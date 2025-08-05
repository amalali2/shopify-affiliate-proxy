export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.hydrinity.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const allAffiliates = [];
  let page = 1;
  const limit = 100; // max per UpPromote docs

  while (true) {
    const url = `https://api.uppromote.com/api/public-affiliate?page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.pk_wjpmKncKyzsp53txbsmhRrYUbEQJCZnO}`,
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch affiliates' });
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      break; // no more pages
    }

    allAffiliates.push(...data.data);
    page += 1;
  }

  const simplified = allAffiliates.map((affiliate) => ({
    id: affiliate.id,
    name: `${affiliate.first_name} ${affiliate.last_name}`.trim(),
    email: affiliate.email,
    zip: affiliate.zip_code,
    sca_ref: affiliate.referral_link?.split('sca_ref=')[1] || null,
  }));

  return res.status(200).json(simplified);
}
