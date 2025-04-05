export async function handler(event) {
  const body = JSON.parse(event.body || '{}');
  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  console.log("🌐 NETLIFY FUNC → lat:", latitude, "lon:", longitude);

  if (!latitude || !longitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid lat/lon" }),
    };
  }

  // Format UTC date and time for AstronomyAPI
  const now = new Date();
  const yyyy_mm_dd = now.toISOString().split("T")[0];
  const hh_mm = now.toISOString().split("T")[1].slice(0, 5);

  // ✅ Basic Auth with App ID and App Secret
  const authString = `${process.env.ASTRO_APP_ID}:${process.env.ASTRO_APP_SECRET}`;
  const encodedAuth = Buffer.from(authString).toString("base64");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${encodedAuth}`,
  };

  const url = "https://api.astronomyapi.com/api/v2/bodies/positions";

  const requestBody = {
    latitude,
    longitude,
    elevation: 1,
    from_date: yyyy_mm_dd,
    to_date: yyyy_mm_dd,
    time: hh_mm,
  };

  console.log("📡 Sending AstronomyAPI request:", JSON.stringify(requestBody));
  console.log("🔐 Encoded Basic Auth:", encodedAuth.slice(0, 10) + "…");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AstronomyAPI error:", errorText);
      return {
        statusCode: response.status,
        body: errorText,
      };
    }

    const data = await response.json();
    console.log("✅ AstronomyAPI success");
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("🚨 Request failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
}
