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

  let npcData = {};
  let allLocations = [];
  let markersLayer = L.layerGroup().addTo(map);

  // 🎯 CONFIGURAÇÃO DE FILTROS
  const filters = {
    types: new Set(["cidade", "forte", "dungeon"]),
    campaign: "avernus"
  };

  // 🎨 Cor por STATUS
  function getColorByStatus(status) {
    switch (status) {
      case "conhecido": return "blue";
      case "visitado": return "green";
      case "perigoso": return "red";
      default: return "gray";
    }
  }

  // 🧠 Regra de visibilidade
  function shouldShow(loc) {
    if (loc.type && !filters.types.has(loc.type)) return false;

    // Se não tem campaign → mostra (Faerûn)
    if (!loc.campaign) return true;

    const status = loc.campaign[filters.campaign];

    return status !== undefined;
  }

  // 🧱 Renderização dos markers
  function renderMarkers() {
    markersLayer.clearLayers();

    allLocations.forEach(loc => {

      if (!shouldShow(loc)) return;

      let status = null;

      if (loc.campaign) {
        status = loc.campaign[filters.campaign];
      }

      const color = getColorByStatus(status);

      const marker = L.circleMarker([loc.y, loc.x], {
        radius: 10,          // 👈 maior para mobile
        color: "black",      // 👈 borda
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9
      }).addTo(markersLayer);

      let popup = `<b>${loc.name}</b>`;

      // 📷 Imagem
      if (loc.image) {
        popup += `<br><img src="${loc.image}" style="width:200px; margin:5px 0;">`;
      }

      // 📄 Descrição
      if (loc.description) {
        popup += `<br>${loc.description}`;
      }

      // 🧠 NPCs
      if (loc.npcs && loc.npcs.length > 0) {
        popup += `<br><br><b>NPCs Notáveis:</b><ul>`;

        loc.npcs.forEach(npc => {
          const info = npcData[npc.id];

          popup += `<li title="${info?.description || ""}">
            ${npc.name}
          </li>`;
        });

        popup += `</ul>`;
      }

      // 📝 Notas
      if (loc.notes) {
        popup += `<br><br><a href="${loc.notes}" target="_blank">Ver anotações</a>`;
      }

      // 🔗 Link
      if (loc.link) {
        popup += `<br><br><a href="${loc.link}">Abrir mapa</a>`;
      }

      marker.bindPopup(popup);

      // 🏷️ Label
      marker.bindTooltip(loc.name, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "map-label"
      });
    });

    updateLabels();
  }

  // 🔄 Carregar dados
  fetch('data/npcs.json')
    .then(res => res.json())
    .then(npcs => {
      npcData = npcs;
      return fetch(config.data);
    })
    .then(res => res.json())
    .then(data => {
      allLocations = data;
      renderMarkers();
    })
    .catch(err => console.error("Erro ao carregar dados:", err));

  // 🧪 Debug coordenadas
  map.on('click', function (e) {
    console.log(
      "X:", Math.round(e.latlng.lng),
      "Y:", Math.round(e.latlng.lat)
    );
  });

  // 🎚️ Labels por zoom
  function updateLabels() {
    const zoom = map.getZoom();

    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker && layer.getTooltip()) {
        if (zoom >= -1) {
          layer.openTooltip();
        } else {
          layer.closeTooltip();
        }
      }
    });
  }

  map.on("zoomend", updateLabels);

  // 🎛️ Filtro interativo
  const filterContainer = document.getElementById("filters");

  if (filterContainer) {
    document.querySelectorAll('#filters input').forEach(input => {
      input.addEventListener('change', () => {

        if (input.checked) {
          filters.types.add(input.value);
        } else {
          filters.types.delete(input.value);
        }

        renderMarkers();
      });
    });
  }
}
