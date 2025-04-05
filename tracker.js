const eventList = document.getElementById("event-list");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchAstronomyData, showError);
  } else {
    eventList.innerHTML = "<p>Geolocation not supported by this browser.</p>";
  }
}

function fetchAstronomyData(position) {
  const { latitude, longitude } = position.coords;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + btoa("65d206cd-4621-4456-a44e-07dc8c0f1d18:1065a5af9ef6e3c801b229d47a0be2bf6663fc6f6fc8a8d02a671ac41380570bbaf033ccae5cbdb2e362b412dcc8736300a1250d9ff55fb709441dc0738035500d932c17fce74e92f060cdcdaa0a68bbbcc2910da6d658663c6b8b4275f486b7594be878b3b7f7ef85e8d4e5800dc932") // Placeholder for GitHub Actions
  };

  const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${latitude}&longitude=${longitude}&from_date=today&to_date=today&elevation=0`;

  fetch(url, { headers })
    .then(response => response.json())
    .then(data => renderCelestialEvents(data.data.table.rows))
    .catch(err => {
      eventList.innerHTML = "<p>Error loading astronomy data.</p>";
      console.error(err);
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

function showError(error) {
  eventList.innerHTML = `<p>Geolocation error: ${error.message}</p>`;
}

getLocation();
