/* ================= script.js: contato (Formspree) + Google Maps CEUs + rota ================= */

document.addEventListener('DOMContentLoaded', function () {
  /* ---------------- FORMULÁRIO - envio para Formspree ---------------- */
  const form = document.getElementById("contatoForm");
  const status = document.getElementById("status");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "Enviando...";
      const data = new FormData(form);
      try {
        const resp = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          status.textContent = "Mensagem enviada com sucesso!";
          form.reset();
        } else {
          status.textContent = "Ops! Algo deu errado.";
        }
      } catch (err) {
        console.error("Erro ao enviar formulário:", err);
        status.textContent = "Erro de conexão. Tente novamente.";
      }
    });
  }

  /* ---------------- GOOGLE MAPS + CEUs + ROTA ---------------- */
  // Espera Google Maps carregar (script tag foi defer)
  function initMapWhenReady() {
    if (typeof google === 'undefined' || !google.maps) {
      // ainda não carregou, tenta novamente em 200ms
      setTimeout(initMapWhenReady, 200);
      return;
    }

    // ========== 1) DADOS DOS CEUs ==========
    // Substitua esta lista por CEUs reais com coordenadas (lat, lng) e endereço.
    // Exemplo do formato:
    // { id: 1, name: 'CEU Butantã', lat: -23.5571, lng: -46.7340, endereco: 'Av. Corifeu...' }
    const ceus = [
  { id: 1, name: "CEU Butantã", lat: -23.577642, lng: -46.743495, endereco: "Av. Eng. Heitor Antônio Eiras Garcia, 1870 – Butantã" },
  { id: 2, name: "CEU Paraisópolis", lat: -23.609205, lng: -46.713707, endereco: "Rua Dr. José Augusto de Souza e Silva, 40 – Paraisópolis" },
  { id: 3, name: "CEU Campo Limpo", lat: -23.628715, lng: -46.761309, endereco: "Av. Carlos Lacerda, 678 – Campo Limpo" },
  { id: 4, name: "CEU Jaçanã", lat: -23.458211, lng: -46.564891, endereco: "R. Benvenuto Cereser, 100 – Jaçanã" },
  { id: 5, name: "CEU São Mateus", lat: -23.586220, lng: -46.472548, endereco: "R. Curupira, 111 – São Mateus" },
  { id: 6, name: "CEU Vila Rubi", lat: -23.703405, lng: -46.662746, endereco: "Av. Arquiteto Vilanova Artigas, 21 – Cidade Ademar" },
  { id: 7, name: "CEU Heliópolis", lat: -23.616946, lng: -46.590779, endereco: "Estr. das Lágrimas, 2385 – Heliópolis" },
  { id: 8, name: "CEU Aricanduva", lat: -23.565964, lng: -46.509783, endereco: "Av. Olga Fadel Abarca, 45 – Aricanduva" },
  { id: 9, name: "CEU Vila Curuçá", lat: -23.505261, lng: -46.420406, endereco: "R. Manoel Quirino de Mattos, 49 – Vila Curuçá" },
  { id: 10, name: "CEU Três Lagos", lat: -23.744200, lng: -46.690200, endereco: "R. Pedra Dourada, 65 – Grajaú" },
  { id: 11, name: "CEU Parelheiros", lat: -23.840997, lng: -46.702655, endereco: "R. Terezinha do Prado Oliveira, 130 – Parelheiros" },
  { id: 12, name: "CEU Lajeado", lat: -23.543502, lng: -46.387891, endereco: "R. Manoel da Mota Coutinho, 293 – Guaianases" },
  { id: 13, name: "CEU Sapopemba", lat: -23.600982, lng: -46.520255, endereco: "Av. Arquiteto Vilanova Artigas, 800 – Sapopemba" },
  { id: 14, name: "CEU Pêra Marmelo", lat: -23.494282, lng: -46.776725, endereco: "Av. Pêra Marmelo, 226 – Jaraguá" },
  { id: 15, name: "CEU Parque Anhanguera", lat: -23.440451, lng: -46.756924, endereco: "Av. Rubens de Souza Araújo, 50 – Anhanguera" }
  ];


    // ========== 2) INICIALIZA MAPA ==========
    const mapElem = document.getElementById('map');
    if (!mapElem) return; // se não existe, não inicializa

    const centerSP = { lat: -23.55, lng: -46.63 };
    const map = new google.maps.Map(mapElem, {
      center: centerSP,
      zoom: 12
    });

    // icons
    const icon = {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    };

    // directions services & renderer
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    directionsRenderer.setMap(map);

    // ========== 3) MARCADORES ==========
    const markers = [];
    ceus.forEach(ceu => {
      const marker = new google.maps.Marker({
        position: { lat: ceu.lat, lng: ceu.lng },
        map,
        title: ceu.name,
        icon
      });
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-weight:600">${ceu.name}</div><div style="font-size:0.9rem">${ceu.endereco || ''}</div>
                  <button data-ceu-id="${ceu.id}" style="margin-top:6px; padding:6px 8px; cursor:pointer;">Ver rota</button>`
      });
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // delegate click on "Ver rota" from infoWindow using DOM
      google.maps.event.addListener(infoWindow, 'domready', function() {
        const btn = document.querySelector(`button[data-ceu-id="${ceu.id}"]`);
        if (btn) {
          btn.onclick = () => {
            // chama rota usando origem (campo) ou localização do navegador
            requestRouteTo(ceu);
          };
        }
      });

      markers.push({ marker, infoWindow, ceu });
    });

    // ========== 4) POPULAR LISTA LATERAL ==========
    const ceuList = document.getElementById('ceuList');
    const busca = document.getElementById('buscaCeu');
    const btnBuscar = document.getElementById('btnBuscar');
    const origemInput = document.getElementById('origemInput');

    function renderList(items) {
      ceuList.innerHTML = '';
      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.name}</strong><br/><small>${item.endereco || ''}</small>`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          map.setCenter({ lat: item.lat, lng: item.lng });
          map.setZoom(15);
          // abre infowindow correspondente
          const found = markers.find(m => m.ceu.id === item.id);
          if (found) {
            found.infoWindow.open(map, found.marker);
          }
        });
        // duplo clique traça rota direto
        li.addEventListener('dblclick', () => {
          requestRouteTo(item);
        });
        ceuList.appendChild(li);
      });
    }

    renderList(ceus);

    function doSearch() {
      const q = (busca.value || '').trim().toLowerCase();
      if (!q) {
        renderList(ceus);
        map.setCenter(centerSP);
        map.setZoom(12);
        return;
      }
      const filtered = ceus.filter(c => c.name.toLowerCase().includes(q) || (c.endereco || '').toLowerCase().includes(q));
      renderList(filtered);
      if (filtered.length === 1) {
        map.setCenter({ lat: filtered[0].lat, lng: filtered[0].lng });
        map.setZoom(15);
      } else if (filtered.length > 1) {
        map.setCenter({ lat: filtered[0].lat, lng: filtered[0].lng });
        map.setZoom(13);
      } else {
        alert('Nenhum CEU encontrado com esse termo.');
      }
    }

    btnBuscar.addEventListener('click', (e) => {
      e.preventDefault();
      doSearch();
    });
    busca.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
      }
    });

    // ========== 5) ROTA (origem: campo ou localização do navegador) ==========
    function requestRouteTo(targetCea) {
      // se usuario preencheu origem no input, usa isso
      const origemText = (origemInput && origemInput.value || '').trim();
      if (origemText) {
        // geocodificar o texto para coordenadas via Google Maps Geocoder
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: origemText }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const originLatLng = results[0].geometry.location;
            calculateAndDisplayRoute(originLatLng, new google.maps.LatLng(targetCea.lat, targetCea.lng));
          } else {
            alert('Não foi possível encontrar a origem informada. Tente outro endereço ou deixe em branco para usar sua localização.');
          }
        });
        return;
      }

      // se não preencheu origem, tenta usar geolocalização do navegador
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const originLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          calculateAndDisplayRoute(originLatLng, new google.maps.LatLng(targetCea.lat, targetCea.lng));
        }, (err) => {
          console.warn('Erro geolocalização:', err);
          alert('Não foi possível obter sua localização. Permita o uso de localização ou preencha o campo Origem com um endereço.');
        }, { timeout: 10000 });
      } else {
        alert('Navegador não suporta geolocalização. Informe um endereço no campo Origem.');
      }
    }

    function calculateAndDisplayRoute(originLatLng, destLatLng) {
      directionsService.route({
        origin: originLatLng,
        destination: destLatLng,
        travelMode: google.maps.TravelMode.DRIVING // pode trocar para WALKING, TRANSIT, BICYCLING
      }, (response, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
          // ajustar mapa para mostrar rota inteira
          const route = response.routes[0];
          const bounds = new google.maps.LatLngBounds();
          route.legs.forEach(leg => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });
          map.fitBounds(bounds, 70);
          // opcional: mostrar popups com duração/distância
          const leg = route.legs[0];
          alert(`Rota encontrada: ${leg.distance.text} - ${leg.duration.text}`);
        } else {
          console.error('Directions request failed due to ' + status);
          alert('Não foi possível traçar a rota: ' + status);
        }
      });
    }

    // botão localizar-me (control custom)
    const locateControlDiv = document.createElement('div');
    locateControlDiv.style.margin = '8px';
    const locateBtn = document.createElement('button');
    locateBtn.textContent = '📍 Minha localização';
    locateBtn.style.padding = '6px';
    locateBtn.style.cursor = 'pointer';
    locateControlDiv.appendChild(locateBtn);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locateControlDiv);

    locateBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setCenter(p);
          map.setZoom(14);
          // opcional: colocar um marcador temporário
          new google.maps.Marker({ position: p, map, title: 'Você está aqui' });
        }, (err) => {
          alert('Erro ao obter localização: permita o navegador ou preencha Origem.');
        });
      } else {
        alert('Seu navegador não suporta geolocalização.');
      }
    });

  } // fim initMapWhenReady

  // start when google available
  initMapWhenReady();

}); // fim DOMContentLoaded
