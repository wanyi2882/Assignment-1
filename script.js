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
        infantVacancy = csvCentreData.infant_vacancy;
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
            'infantVacancy': infantVacancy,
            'playGroupVacancy': playGroupVacancy,
            'n1Vacancy': n1Vacancy,
            'n2Vacancy': n2Vacancy,
            'k1Vacancy': k1Vacancy,
            'k2Vacancy': k2Vacancy,
            'foodOffered': foodOffered,
            'weekdayHours': weekdayHours
        })
    }
    return centreCodeWithInformation;
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

let currentCoordinates = []

//Results function
document.querySelector("#submit-btn").addEventListener('click', async function () {

    let allPages = document.querySelectorAll('.page');
    for (let p of allPages) {
        p.classList.remove('show-page');
        p.classList.add('hidden-page');
    }

    // only show map page
    document.querySelector('#two').classList.add('show-page');

    //Search by postal code
    let searchTerms = document.querySelector("#postal-code").value;
    let response = await axios.get("https://geocode.xyz/" + searchTerms + "?json=1");
    let currentLat = response.data.latt;
    let currentLng = response.data.longt;
    currentCoordinates = [currentLat, currentLng];
    map.flyTo(currentCoordinates, 17);

    let popup = L.popup();
    popup.setLatLng(currentCoordinates);
    popup.setContent(`YOU ARE HERE!`);
    popup.openOn(map);

    let searchResultsCurrentCoordinates = L.latLng(currentCoordinates);

    let levelAll = document.querySelectorAll(".level:checked")
    let vacancyAll = document.querySelectorAll(".vacancy:checked")

    //Call merge function

    let searchResults = await merge();

    for (let x of searchResults) {

        //popup content
        let popupDiv = document.createElement("div");
        popupDiv.className = "popup"
        popupDiv.innerHTML += `Centre Name: ${x.centreName}
        Spark Certified: ${x.sparkCertified}
        Address: ${x.address}`

        let compareButton = document.createElement("button")
        compareButton.className = "add-to-compare-btn"
        compareButton.innerHTML = "Add to Compare"

        L.DomEvent.on(compareButton, 'click', () => {
            if (choosenCentres.length < 1) {
                choosenCentres.push(x.centreName);
                choosenCentresCodes.push(x.centreCode);

                document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
            } else if (choosenCentres.length < 2) {
                choosenCentres.push(x.centreName);
                choosenCentresCodes.push(x.centreCode);

                document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
                document.querySelector("#preview-item-two-name").innerHTML = choosenCentres[1];
            } else {
                alert("You can only add a max of 2 centres")
            }
        })

        let popupContent = document.createElement("div")
        popupContent.appendChild(popupDiv)
        popupContent.appendChild(compareButton)


        let popupOptions =
            { 'minWidth': '500' }

        //Add all Markers
        L.marker(x.latlng).addTo(baseClustersGroup).bindPopup(popupContent, popupOptions);

        //Get Lat Lng by search criteria
        if (x[levelAll[0].value] == vacancyAll[0].value) {
            L.marker(x.latlng).addTo(searchClusterGroup).bindPopup(popupContent, popupOptions);
        }

        //Distance markers
        if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.1) {
            L.marker(x.latlng).addTo(distance100ClusterLayer).bindPopup(popupContent, popupOptions);
        } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.5) {
            L.marker(x.latlng).addTo(distance500ClusterLayer).bindPopup(popupContent, popupOptions);
        } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 1) {
            L.marker(x.latlng).addTo(distance1000ClusterLayer).bindPopup(popupContent, popupOptions);
        }

        //Spark Markers
        if (x.sparkCertified == "Yes") {
            let sparkIcon = L.icon({
                iconUrl: '../images/spark-logo.jpeg',
                iconSize: [38, 38]
            })

            L.marker(x.latlng, { icon: sparkIcon }).addTo(sparkGroup).bindPopup(popupContent, popupOptions);
        }
    }
})

//Create map layers and clusters
let sparkGroup = L.layerGroup();
let baseClustersGroup = L.markerClusterGroup();
let searchClusterGroup = L.markerClusterGroup();
let distance100ClusterLayer = L.markerClusterGroup();
let distance500ClusterLayer = L.markerClusterGroup();
let distance1000ClusterLayer = L.markerClusterGroup();

baseClustersGroup.addTo(map);

//create map controls
let baseLayers = {
    'Searched': searchClusterGroup,
    'SPARK Certified': sparkGroup
}

let overlayLayer = {
    'All Centres': baseClustersGroup,
    'Within 100m': distance100ClusterLayer,
    'From 100m - 500m': distance500ClusterLayer,
    'From 500m - 1Km': distance1000ClusterLayer
}

L.control.layers(baseLayers, overlayLayer).addTo(map)

let choosenCentres = []
let choosenCentresCodes = []

//preview div remove buttons
document.querySelector("#remove-btn-one").addEventListener("click", function () {
    for (let i = 0; i < choosenCentres.length; i++) {
        if (choosenCentres[i] == document.querySelector("#preview-item-one-name").innerHTML) {
            document.querySelector("#preview-item-one-name").innerHTML = "";
            choosenCentres.splice(i, 1);
        }
    }
})

document.querySelector("#remove-btn-two").addEventListener("click", function () {
    for (let i = 0; i < choosenCentres.length; i++) {
        if (choosenCentres[i] == document.querySelector("#preview-item-two-name").innerHTML) {
            document.querySelector("#preview-item-two-name").innerHTML = "";
            choosenCentres.splice(i, 1);
        }
    }
})

//show comparision page when click on #compare-btn
document.querySelector("#compare-btn").addEventListener("click", async function () {

    if (choosenCentres.length < 1) {
        alert("Please add 2 centres for comparision")

    } else if (choosenCentres.length = 2) {
        let allPages = document.querySelectorAll('.page');
        for (let p of allPages) {
            p.classList.remove('show-page');
            p.classList.add('hidden-page');
        }

        // show comparision page
        document.querySelector('#three').classList.add('show-page');

        //Comparison Page Table Function

        //Call merge function
        let compareTable = await merge();

        for (let i of choosenCentresCodes) {
            for (let x of compareTable) {
                if (i == x.centreCode) {

                    let columnOne = document.createElement("div");
                    columnOne.className = "col-4"
                    columnOne.style = "margin-left:20px"

                    //Centre name
                    let nameDiv = document.createElement("div");
                    nameDiv.className = "row"
                    nameDiv.innerHTML = x.centreName

                    //Spark certification
                    let sparkDiv = document.createElement("div");
                    if (x.sparkCertified == "Yes"){
                        sparkDiv.className = "row fas fa-check"
                    } else{
                        sparkDiv.className = "row fas fa-times"
                    }

                    //Distance
                    let distanceDiv = document.createElement("div");
                    distanceDiv.innerHTML = `${(L.latLng(currentCoordinates).distanceTo(x.latlng)).toFixed(0)} Metres`
                    
                    //Operating Hours
                    let weekdayDiv = document.createElement("div");
                    if (x.weekdayHours == "na"){
                        weekdayDiv.innerHTML = `Please contact the centre at ${x.contact} for more information on their weekday operating hours`
                    } else {
                        weekdayDiv.innerHTML = x.weekdayHours
                    }
                    let mainTable = document.querySelector("#three");

                    mainTable.appendChild(columnOne)
                    columnOne.appendChild(nameDiv)
                    columnOne.appendChild(sparkDiv)
                    columnOne.appendChild(distanceDiv)
                    columnOne.appendChild(weekdayDiv)

                }
            }
        }
    }
})

