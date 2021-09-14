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

    //load CSV data
    let rawData = await loadCentresData();

    let centreCodeWithCoordinates = [];

    let sparkGroup = L.layerGroup();
    let baseGroup = L.layerGroup();

    for (let feature of features) {

        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let locations = [lat, lng];
        let marker = L.marker(locations);

        marker.addTo(baseGroup);

        let popupDiv = document.createElement('div')
        popupDiv.innerHTML = feature.properties.Description;

        let centreName = popupDiv.querySelectorAll('td')[0];
        let centreCode = popupDiv.querySelectorAll('td')[1];
        //let address = popupDiv.querySelectorAll('td')[2];
        //console.log(centreCode);

        for (let csvCentreData of rawData) {
            if (csvCentreData.centre_code.includes(centreCode.innerHTML)) {
                //console.log(csvCentreData.centre_name);
                x = csvCentreData.centre_name;
                y = csvCentreData.spark_certified;
                z = csvCentreData.centre_address;
            }
        }

        centreCodeWithCoordinates.push({
            'centreName': centreName.innerHTML,
            'centreCode': centreCode.innerHTML,
            'latlng': locations,
            'sparkCertified': y,
            'address': z  
          })


        let popupContent = `
        Centre Name: ${x} <br>
        spark_certified: ${y}<br>
        Address: ${z}`;
        let popupOptions =
            { 'minWidth': '500' }

        marker.bindPopup(popupContent, popupOptions);

    }


    for (let i of centreCodeWithCoordinates){
        if (i.sparkCertified == "Yes"){
            let sparkMarker = i.latlng
            
            let sparkIcon = L.icon({
                iconUrl: '../images/spark-logo.jpeg',
                iconSize: [38, 38]
            })
            
            L.marker(sparkMarker, { icon: sparkIcon }).addTo(sparkGroup);
        }
    }  

    //console.log(centreCodeWithCoordinates)


    let baseLayers = {
        'All Centres': baseGroup,
        'SPARK Certified': sparkGroup
      }
      
      let overlayLayer = {
        'All Centres': baseGroup
      }
      
      L.control.layers(baseLayers, overlayLayer).addTo(map)

    document.querySelector("#submit-btn").addEventListener('click', async function () {

        let allPages = document.querySelectorAll('.page');
        for (let p of allPages) {
            p.classList.remove('show');
            p.classList.add('hidden');
        }

        // only show map page
        document.querySelector('#two').classList.add('show');

        let searchTerms = document.querySelector("#postal-code").value;
        let response = await axios.get("https://geocode.xyz/" + searchTerms + "?json=1");
        let currentLat = response.data.latt;
        let currentLng = response.data.longt;
        let currentCoordinates = [currentLat, currentLng];
        map.flyTo(currentCoordinates, 17);
        //console.log(currentCoordinates)

        let popup = L.popup();
        popup.setLatLng(currentCoordinates);
        popup.setContent(`YOU ARE HERE!`);
        popup.openOn(map);

        map.getBounds();

        let searchResults100 = document.querySelector("#lessThan100");
        let searchResults500 = document.querySelector("#lessThan500");
        let searchResults1000 = document.querySelector("#lessThan1000");

        let searchResultsCurrentCoordinates = L.latLng(currentCoordinates);

        for (let i of centreCodeWithCoordinates){
            if (searchResultsCurrentCoordinates.distanceTo(i.latlng)/1000 < 0.1){
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000
                searchResults100.innerHTML += `<li>
                <h6>${i.centreName}</h6>
                Distance from your location: ${distance.toFixed(1)}km</li>`

            } else if (searchResultsCurrentCoordinates.distanceTo(i.latlng)/1000 < 0.5){
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000
                searchResults500.innerHTML += `<li>
                <h6>${i.centreName}</h6>
                Distance from your location: ${distance.toFixed(1)}km</li>`

            } else if (searchResultsCurrentCoordinates.distanceTo(i.latlng)/1000 < 1){
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000
                searchResults1000.innerHTML += `<li>
                <h6>${i.centreName}</h6>
                Distance from your location: ${distance.toFixed(1)}km</li>`
            }
        }
    }) 
});