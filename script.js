window.addEventListener("DOMContentLoaded", async function () {

    // Leaflet, coordinates are represented by an array of 2 elements
    // [ <lat>, <lng> ]
    let singapore = [1.29, 103.85];
    // L is defined by Leaflet's JavaScript file
    let map = L.map('map'); // create a map and render it to the #map
    map.setView(singapore, 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
    }).addTo(map);

    //read in the locations.geojson file
    let response = await axios.get('locations.geojson');

    let features = response.data.features;

    let clusters = L.markerClusterGroup();
    clusters.addTo(map);

    for (let feature of features) {
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let locations = [lat, lng];
        let marker = L.marker(locations);

        marker.addTo(clusters);

        let names = document.createElement('div')
        names.innerHTML = feature.properties.Description;

        let specific = names.querySelectorAll('td');

        marker.bindPopup(`${specific[0].innerHTML}`);
    }

    document.querySelector("#submit-btn").addEventListener('click', async function(){

        let redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
        let searchTerms = document.querySelector("#postal-code").value;
        let response = await axios.get("https://geocode.xyz/" + searchTerms + "?json=1");
        let currentLat = response.data.latt;
        let currentLng = response.data.longt;
        let currentCoordinates = [currentLat, currentLng];
        let currentMarker = L.marker(currentCoordinates, {icon: redIcon});
        currentMarker.addTo(map);

        let popup = L.popup();
        popup.setLatLng(currentCoordinates);
        popup.setContent(`YOU ARE HERE!`);
        popup.openOn(map);

        let zoom = 20;
        map.setView(currentCoordinates, zoom);
    })
});



