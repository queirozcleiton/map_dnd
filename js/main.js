function initMap(config) {
  const map = L.map(config.divId, {
    crs: L.CRS.Simple,
    minZoom: -2
  });

  const bounds = [[0, 0], [config.height, config.width]];

  L.imageOverlay(config.image, bounds).addTo(map);
  map.fitBounds(bounds);

  map.setMaxBounds(bounds);
  map.setMaxZoom(1);

  // Carregar dados
  fetch(config.data)
    .then(res => res.json())
    .then(data => {
      data.forEach(loc => {
        const marker = L.marker([loc.y, loc.x]).addTo(map);

        let popup = `<b>${loc.name}</b><br>${loc.description || ""}`;

        if (loc.link) {
          popup += `<br><br><a href="${loc.link}">Abrir mapa</a>`;
        }

        marker.bindPopup(popup);
      });
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  // Debug de coordenadas
  map.on('click', function(e) {
    console.log(
      "X:", Math.round(e.latlng.lng),
      "Y:", Math.round(e.latlng.lat)
    );
  });
}