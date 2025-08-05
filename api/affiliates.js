export default async function handler(req, res) {
  const response = await fetch('https://api.uppromote.com/api/public-affiliate', {
    headers: {
      Authorization: 'Bearer pk_wjpmKncKyzsp53txbsmhRrYUbEQJCZnO',
    }
  });

  if (!response.ok) {
    return res.status(500).json({ error: 'Failed to fetch affiliates' });
  }

  const affiliates = await response.json();

  const simplified = affiliates.data.map((affiliate) => {
    return {
      name: affiliate.name,
      email: affiliate.email,
      code: affiliate.code,
      sca_ref: affiliate.sca_ref,
    };
  });

  return res.status(200).json(simplified);
}
