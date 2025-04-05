export async function handler(event) {
  const body = JSON.parse(event.body || '{}');
  const latitude = parseFloat(body.latitude);
  const longitude = parseFloat(body.longitude);

  if (!latitude || !longitude) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid lat/lon" }),
    };
  }

  try {
    // 1. Open-Meteo Astronomy (sun/moon times + moon phase)
    const openMeteoUrl = `https://api.open-meteo.com/v1/astronomy?latitude=${latitude}&longitude=${longitude}&timezone=auto`;
    const meteoRes = await fetch(openMeteoUrl);
    const meteoData = await meteoRes.json();

    // 2. IPGeolocation.io Moon Info (demo access for light use)
    const ipGeoUrl = `https://api.ipgeolocation.io/astronomy?lat=${latitude}&long=${longitude}`;
    const ipGeoRes = await fetch(ipGeoUrl);
    const ipGeoData = await ipGeoRes.json();

    // 3. Stellarium Web - visible sky objects (constellations, stars)
    const stellariumUrl = `https://api.stellarium-web.org/api/main/skyobjects?lat=${latitude}&lon=${longitude}&alt=0`;
    const stellariumRes = await fetch(stellariumUrl);
    const stellariumData = await stellariumRes.json();

    // 4. In-The-Sky Events - pre-curated fallback
    const eventsUrl = `https://raw.githubusercontent.com/lebron1212/space-events/main/space_events.json`; // You can host a curated JSON here
    const eventsRes = await fetch(eventsUrl);
    const eventsData = await eventsRes.json();

    // Combine all data
    const result = {
      astronomy: {
        sunrise: meteoData.sunrise,
        sunset: meteoData.sunset,
        moonrise: meteoData.moonrise,
        moonset: meteoData.moonset,
        moon_phase_value: meteoData.moon_phase,
        moon_phase_label: ipGeoData.moon_status,
        moon_altitude: ipGeoData.moon_altitude,
        moon_illumination: ipGeoData.moon_illumination,
      },
      constellations: stellariumData.objects?.filter(obj => obj.type === 'constellation') || [],
      celestial_events: eventsData.events || [],
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("🚨 Celestial tracker error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
}
