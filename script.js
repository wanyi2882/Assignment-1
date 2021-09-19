//functions

//Latlng function and array of centreCodeWithCoordinates
async function getLatLng() {
    //load locations.geojson
    let response = await axios.get('locations.geojson');
    let centreCodeWithCoordinates = []
    let features = response.data.features;

    for (let feature of features) {
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let locations = [lat, lng];

        let popupDiv = document.createElement('div')
        popupDiv.innerHTML = feature.properties.Description;
        let centreCode = popupDiv.querySelectorAll('td')[1].innerHTML;

        centreCodeWithCoordinates.push({
            'centreCode': centreCode,
            'latlng': locations,
        })
    }
    return centreCodeWithCoordinates
}

//Array of centreInformation
async function centreInformation() {
    //load CSV data on centre information
    let rawCentreData = await loadCentresData();
    let centreCodeWithInformation = [];

    for (let csvCentreData of rawCentreData) {
        centreCode = csvCentreData.centre_code;
        centreName = csvCentreData.centre_name;
        sparkCertified = csvCentreData.spark_certified;
        centreAddress = csvCentreData.centre_address;
        contact = csvCentreData.centre_contact_no;
        email = csvCentreData.centre_email_address;
        website = csvCentreData.centre_website;
        infantVancancy = csvCentreData.infant_vacancy;
        playGroupVacancy = csvCentreData.pg_vacancy;
        n1Vacancy = csvCentreData.n1_vacancy;
        n2Vacancy = csvCentreData.n2_vacancy;
        k1Vacancy = csvCentreData.k1_vacancy;
        k2Vacancy = csvCentreData.k2_vacancy;
        foodOffered = csvCentreData.food_offered;
        secondLanguages = csvCentreData.second_languages_offered;
        weekdayHours = csvCentreData.weekday_full_day;
        saturdayHours = csvCentreData.saturday;
        extendedHours = csvCentreData.extended_operating_hours;
        transportProvided = csvCentreData.provision_of_transport;
        govtSubsidy = csvCentreData.government_subsidy;

        centreCodeWithInformation.push({
            'centreCode': centreCode,
            'centreName': centreName,
            'sparkCertified': sparkCertified,
            'address': centreAddress,
            'contact': contact,
            'email': email,
            'website': website,
        })
    }
    return centreCodeWithInformation;
}

//Array of services and prices
async function serviceAndPrice(){

    //load CSV data on centre services
    let rawServicesData = await loadServicesData();

    return rawServicesData;   
}

//merge two data set
async function merge() {
    let centreCodeWithCoordinates = await getLatLng();
    let centreCodeWithInformation = await centreInformation();
    let mergedDataSet = [];
    for (i = 0; i < centreCodeWithCoordinates.length; i++) {
        mergedDataSet.push({
            ...centreCodeWithCoordinates[i], ...(centreCodeWithInformation.find((itemInner) => itemInner.centreCode === centreCodeWithCoordinates[i].centreCode))
        })
    }
    return mergedDataSet;
}

//All markers and popup functions
async function markers() {
    let markers = await merge();
    for (let x of markers) {
        let marker = L.marker(x.latlng).addTo(baseGroup);

        let popupContent = `
        Centre Name: ${x.centreName} <br>
        spark_certified: ${x.sparkCertified}<br>
        Address: ${x.address}`;

        let popupOptions =
            { 'minWidth': '500' }

        marker.bindPopup(popupContent, popupOptions);
    }
}

//spark certified markers and popup functions
async function sparkMarkers() {
    let markers = await merge();
    for (let x of markers) {
        if (x.sparkCertified == "Yes") {
            let marker = x.latlng
            let sparkIcon = L.icon({
                iconUrl: '../images/spark-logo.jpeg',
                iconSize: [38, 38]
            })

            let sparkMarker = L.marker(marker, { icon: sparkIcon }).addTo(sparkGroup);

            let popupContent = `
                Centre Name: ${x.centreName} <br>
                spark_certified: ${x.sparkCertified}<br>
                Address: ${x.address}`;

            let popupOptions =
                { 'minWidth': '500' }

            sparkMarker.bindPopup(popupContent, popupOptions);
        }
    }
}

//show hide div
function ShowHideDiv() {
    if (document.querySelector("#level-infant").checked){
        document.querySelector("#infantTypeID").style.display = "block"
    }else {document.querySelector("#infantTypeID").style.display ="none";
    }
}

//Results function
document.querySelector("#submit-btn").addEventListener('click', async function () {

    let allPages = document.querySelectorAll('.page');
    for (let p of allPages) {
        p.classList.remove('show-page');
        p.classList.add('hidden-page');
    }

    // only show map page
    document.querySelector('#two').classList.add('show-page');

    let searchTerms = document.querySelector("#postal-code").value;
    let response = await axios.get("https://geocode.xyz/" + searchTerms + "?json=1");
    let currentLat = response.data.latt;
    let currentLng = response.data.longt;
    let currentCoordinates = [currentLat, currentLng];
    map.flyTo(currentCoordinates, 17);

    let popup = L.popup();
    popup.setLatLng(currentCoordinates);
    popup.setContent(`YOU ARE HERE!`);
    popup.openOn(map);

    let searchTermsResults = document.querySelector("#searchTermsResults")
    let searchResults100 = document.querySelector("#lessThan100");
    let searchResults500 = document.querySelector("#lessThan500");
    let searchResults1000 = document.querySelector("#lessThan1000");

    let searchResultsCurrentCoordinates = L.latLng(currentCoordinates);

    let searchResults = await merge();
    let q = await serviceAndPrice();


    let selectedLevelButton = document.querySelector('.level:checked');
    let selectedCitizenshipButton = document.querySelector('.citizenship:checked');
    let infantTypeButton = document.querySelector('.infantTypeClass:checked');

    searchTermsResults.innerHTML += `
    You have choosen ${selectedLevelButton.value} on ${infantTypeButton.value} basis for ${selectedCitizenshipButton.value}
    `
          
    for (let x of q){
        for (let i of searchResults) {

            if (searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000 < 0.1 && i.centreCode == x.centre_code && selectedLevelButton.value == x.levels_offered && selectedCitizenshipButton.value == x.type_of_citizenship && x.type_of_service.includes(infantTypeButton.value)) {
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000;
                searchResults100.innerHTML += `<li>
                    Centre Name: ${x.centre_name}<br>
                    Fees: $${x.fees} / month<br>
                    Distance from your location: ${distance.toFixed(1)}km
                    </li>`
    
            } else if (searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000 < 0.5 && i.centreCode == x.centre_code && selectedLevelButton.value == x.levels_offered && selectedCitizenshipButton.value == x.type_of_citizenship && x.type_of_service.includes(infantTypeButton.value)) {
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000
                searchResults500.innerHTML += `<li>
                    Centre Name: ${x.centre_name}<br>
                    Fees: $${x.fees} / month<br>
                    Distance from your location: ${distance.toFixed(1)}km</li>`
    
            } else if (searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000 < 1 && i.centreCode == x.centre_code && selectedLevelButton.value == x.levels_offered && selectedCitizenshipButton.value == x.type_of_citizenship && x.type_of_service.includes(infantTypeButton.value)) {
                let distance = searchResultsCurrentCoordinates.distanceTo(i.latlng) / 1000
                searchResults1000.innerHTML += `<li>
                    Centre Name: ${x.centre_name}<br>
                    Fees: $${x.fees} / month<br>
                    Distance from your location: ${distance.toFixed(1)}km</li>`
            } 
        }
    }
})


//start of script

//Create map layers and clusters
let sparkGroup = L.layerGroup();
let baseGroup = L.layerGroup();

let clusters = L.markerClusterGroup();
clusters.addTo(map);

//Add all markers
markers()

//Add markers to spark certified centres
sparkMarkers()

//create map controls
let baseLayers = {
    'All Centres': baseGroup,
    'SPARK Certified': sparkGroup
}

let overlayLayer = {
}
baseGroup.addTo(map)
L.control.layers(baseLayers, overlayLayer).addTo(map)


