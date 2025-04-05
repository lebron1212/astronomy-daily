const eventList = document.getElementById("event-list");

function fetchLocationAndData() {
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(loc => {
      fetchAstronomyData(loc.latitude, loc.longitude);
    })
    .catch(err => {
      eventList.innerHTML = "<p>Unable to get location from IP.</p>";
      console.error("IP Location Error:", err);
    });
}

function fetchAstronomyData(latitude, longitude) {
  fetch("/.netlify/functions/astro", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.data || !data.data.table) {
        throw new Error("Invalid response from AstronomyAPI");
      }
      renderCelestialEvents(data.data.table.rows);
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      eventList.innerHTML = `<p>Error loading celestial data.</p>`;
    });
}

function renderCelestialEvents(bodies) {
  eventList.innerHTML = "";
  bodies.forEach(row => {
    const name = row.entry.name;
    const rise = row.entry.rise?.time || "N/A";
    const set = row.entry.set?.time || "N/A";

    const el = document.createElement("div");
    el.className = "astro-event";
    el.innerHTML = `
      <h3>${name}</h3>
      <p>Rise: ${rise}</p>
      <p>Set: ${set}</p>
    `;
    eventList.appendChild(el);
  });
}

fetchLocationAndData();
