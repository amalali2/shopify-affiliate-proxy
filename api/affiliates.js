// /api/affiliates.js
export default async function handler(req, res) {
  const token = "Bearer pk_wjpmKncKyzsp53txbsmhRrYUbEQJCZnO";
  const allAffiliates = [];

  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await fetch(
        `https://aff-api.uppromote.com/api/v1/affiliates?page=${page}&per_page=100`,
        {
          headers: {
            Authorization: token,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch affiliates" });
      }

      const data = await response.json();

      if (Array.isArray(data.data)) {
        data.data.forEach((affiliate) => {
          allAffiliates.push({
            id: affiliate.id,
            name: `${affiliate.first_name} ${affiliate.last_name}`,
            email: affiliate.email,
            zip: affiliate.zipcode,
            sca_ref:
              affiliate.affiliate_link?.split("sca_ref=")[1] || null,
          });
        });
      }

      // Check if more pages exist
      const totalPages = data.meta?.last_page || 1;
      hasMore = page < totalPages;
      page++;
    }

    return res.status(200).json(allAffiliates);
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
