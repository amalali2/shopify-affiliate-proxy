export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.hydrinity.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight OK
  }

  const allAffiliates = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const response = await fetch(`https://api.uppromote.com/api/public-affiliate?page=${page}`, {
        headers: {
          Authorization: `Bearer ${process.env.UPPROMOTE_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching page ${page}:`, errorText);
        return res.status(500).json({ error: 'Failed to fetch affiliates', detail: errorText });
      }

      const json = await response.json();

      if (json.data) {
        json.data.forEach((affiliate) => {
          allAffiliates.push({
            id: affiliate.id,
            name: `${affiliate.first_name} ${affiliate.last_name}`.trim(),
            email: affiliate.email,
            zip: affiliate.zip_code,
            sca_ref: affiliate.referral_link?.split('sca_ref=')[1] || null,
          });
        });
      }

      totalPages = json.pagination?.last_page || 1;
      page++;
    }

    return res.status(200).json(allAffiliates);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
