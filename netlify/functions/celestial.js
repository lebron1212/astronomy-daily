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

  const result = {
    astronomy: {},
    constellations: [],
    celestial_events: []
  };

  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/astronomy?latitude=${latitude}&longitude=${longitude}&timezone=auto`;
    const meteoRes = await fetch(openMeteoUrl);
    if (meteoRes.ok) {
      const meteoData = await meteoRes.json();
      result.astronomy.sunrise = meteoData.sunrise;
      result.astronomy.sunset = meteoData.sunset;
      result.astronomy.moonrise = meteoData.moonrise;
      result.astronomy.moonset = meteoData.moonset;
      result.astronomy.moon_phase_value = meteoData.moon_phase;
    } else {
      console.error("Open-Meteo failed:", await meteoRes.text());
    }
  } catch (err) {
    console.error("Open-Meteo fetch error:", err);
  }

  try {
    const ipGeoUrl = `https://api.ipgeolocation.io/astronomy?lat=${latitude}&long=${longitude}`;
    const ipGeoRes = await fetch(ipGeoUrl);
    if (ipGeoRes.ok) {
      const ipGeoData = await ipGeoRes.json();
      result.astronomy.moon_phase_label = ipGeoData.moon_status;
      result.astronomy.moon_altitude = ipGeoData.moon_altitude;
      result.astronomy.moon_illumination = ipGeoData.moon_illumination;
    } else {
      console.error("IPGeolocation failed:", await ipGeoRes.text());
    }
  } catch (err) {
    console.error("IPGeolocation fetch error:", err);
  }

  try {
    const stellariumUrl = `https://api.stellarium-web.org/api/main/skyobjects?lat=${latitude}&lon=${longitude}&alt=0`;
    const stellariumRes = await fetch(stellariumUrl);
    if (stellariumRes.ok) {
      const stellariumData = await stellariumRes.json();
      result.constellations = stellariumData.objects?.filter(obj => obj.type === 'constellation') || [];
    } else {
      console.error("Stellarium failed:", await stellariumRes.text());
    }
  } catch (err) {
    console.error("Stellarium fetch error:", err);
  }

  try {
    const eventsUrl = `https://raw.githubusercontent.com/lebron1212/space-events/main/space_events.json`;
    const eventsRes = await fetch(eventsUrl);
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      result.celestial_events = eventsData.events || [];
    } else {
      console.error("Events JSON failed:", await eventsRes.text());
    }
  } catch (err) {
    console.error("Events JSON fetch error:", err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}
