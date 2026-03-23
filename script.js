const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2
});

const bounds = [[0,0], [1632,2048]];
L.imageOverlay('assets/sword-coast.webp', bounds).addTo(map);
map.fitBounds(bounds);

// Carregar dados
fetch('data/locations.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(loc => {
      const marker = L.marker([loc.y, loc.x]).addTo(map);

      marker.bindPopup(`
        <b>${loc.name}</b><br>
        ${loc.description}<br><br>
        <i>${loc.notes}</i><br>
        <small>${loc.session}</small>
      `);
    });
  });

map.on('click', function(e) {
	console.log("X:", Math.round(e.latlng.lng), Math.round("Y:" e latlng.lat));
});