export default async function handler(req, res) {
  try {
    const url = new URL("https://aff-api.uppromote.com/api/v1/affiliates");
    // optional: support search query param
    if (req.query.q) url.searchParams.set("q", req.query.q);

    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer pk_wjpmKncKyzsp53txbsmhRrYUbEQJCZnO",
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      console.error("UpPromote API error:", await response.text());
      return res.status(500).json({ error: "Failed to fetch affiliates" });
    }

    const json = await response.json();
    // `json.data` is the array of affiliate objects
    const affiliates = json.data.map(a => ({
      id: a.id,
      name: `${a.first_name} ${a.last_name}`,
      email: a.email,
      phone: a.phone,
      city: a.city,
      zip: a.zipcode,
      sca_ref: a.affiliate_link?.split("sca_ref=")[1] || null
    }));

    res.status(200).json({ affiliates });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal proxy error" });
  }
}
