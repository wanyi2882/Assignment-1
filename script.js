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
            'weekdayHours': weekdayHours,
            'saturdayHours': saturdayHours,
            'secondLanguages': secondLanguages
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
            choosenCentresCodes.splice(i,1)
        }
    }
})

document.querySelector("#remove-btn-two").addEventListener("click", function () {
    for (let i = 0; i < choosenCentres.length; i++) {
        if (choosenCentres[i] == document.querySelector("#preview-item-two-name").innerHTML) {
            document.querySelector("#preview-item-two-name").innerHTML = "";
            choosenCentres.splice(i, 1);
            choosenCentresCodes.splice(i,1)
        }
    }
})

//show comparision page when click on #compare-btn
document.querySelector("#compare-btn").addEventListener("click", async function () {

    if (choosenCentres.length < 2) {
        alert("Please add 2 centres for comparision")

    } else if (choosenCentres.length = 2) {
        let allPages = document.querySelectorAll('.page');
        for (let p of allPages) {
            p.classList.remove('show-page');
            p.classList.add('hidden-page');
        }

        //Show comparision page
        document.querySelector('#three').classList.add('show-page');

        //Comparison Page Table Function

        //Call merge function
        let compareTable = await merge();

        for (let i=0;  i < choosenCentresCodes.length; i++) {
            for (let x of compareTable) {
                if (choosenCentresCodes[i] == x.centreCode) {

                    //Centre name
                    document.querySelectorAll(".name-compare")[i].innerHTML = x.centreName

                    //Spark certification
                    if (x.sparkCertified == "Yes"){
                        document.querySelectorAll(".spark-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else{
                        document.querySelectorAll(".spark-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Distance
                    let searchTerms = document.querySelector("#postal-code").value;
                    document.querySelector("#distance-compare-header").innerHTML = `Distance from postal code ${searchTerms}`
                    document.querySelectorAll(".distance-compare")[i].innerHTML = `${(L.latLng(currentCoordinates).distanceTo(x.latlng)).toFixed(0)} Metres`
                    
                    //Operating Hours
                    if (x.weekdayHours == "na"){
                        document.querySelectorAll(".weekday-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on their weekday operating hours`
                    } else {
                        document.querySelectorAll(".weekday-compare")[i].innerHTML = x.weekdayHours
                    }

                    //Saturday Operating Hours
                    if (x.saturdayHours =="na"){
                        document.querySelectorAll(".saturday-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on their Saturday operating hours`
                    } else {
                        document.querySelectorAll(".saturday-compare")[i].innerHTML = x.saturdayHours
                    }

                    //Infant Vacancy
                    if (x.infantVacancy =="na"){
                        document.querySelectorAll(".infant-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".infant-compare")[i].innerHTML = x.infantVacancy
                    }

                    //Playgroup Vacancy
                    if (x.playGroupVacancy =="na"){
                        document.querySelectorAll(".playgroup-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".playgroup-compare")[i].innerHTML = x.playGroupVacancy
                    }

                    //Pre-Nursery Vacancy
                    if (x.n1Vacancy =="na"){
                        document.querySelectorAll(".n1-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".n1-compare")[i].innerHTML = x.n1Vacancy
                    }
                    
                    //Nursery Vacancy
                    if (x.n2Vacancy =="na"){
                        document.querySelectorAll(".n2-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".n2-compare")[i].innerHTML = x.n2Vacancy
                    }   

                    //Kindergarden One Vacancy
                    if (x.k1Vacancy =="na"){
                        document.querySelectorAll(".k1-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".k1-compare")[i].innerHTML = x.k1Vacancy
                    } 

                    //Kindergarden Two Vacancy
                    if (x.k2Vacancy =="na"){
                        document.querySelectorAll(".k2-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".k2-compare")[i].innerHTML = x.k2Vacancy
                    }
                    
                    //Halal
                    if (x.foodOffered.includes("with Certification from MUIS")){
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else if (x.foodOffered.includes("without Certification from MUIS but from Halal Sources")){
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `No Pork No Lard (without Certification from MUIS but from Halal Sources)`
                    } else if (x.foodOffered.includes("from Non-Halal Sources")){
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `No Pork No Lard (from Non-Halal Sources)`
                    } else {
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Vegeterian
                    if (x.foodOffered.includes("Vegetarian")){
                        document.querySelectorAll(".vegeterian-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".vegeterian-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Beef
                    if (x.foodOffered.includes("with Beef")){
                        document.querySelectorAll(".beef-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".beef-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Chinese
                    if (x.secondLanguages.includes("Chinese")){
                        document.querySelectorAll(".chinese-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".chinese-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Malay
                    if (x.secondLanguages.includes("Malay")){
                        document.querySelectorAll(".malay-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".malay-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }                    

                    //Tamil
                    if (x.secondLanguages.includes("Tamil")){
                        document.querySelectorAll(".tamil-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".tamil-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                }
            }
        }
    }
})

//Return to map page from comparison page when click on the close button
document.querySelector(".btn-close").addEventListener("click", function(){
    let allPages = document.querySelectorAll('.page');
    for (let p of allPages) {
        p.classList.remove('show-page');
        p.classList.add('hidden-page');
    }

    // only show map page
    document.querySelector('#two').classList.add('show-page');
})