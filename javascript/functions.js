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
        centreName = csvCentreData.centre_name.toUpperCase();
        sparkCertified = csvCentreData.spark_certified;
        centreAddress = csvCentreData.centre_address.toUpperCase();
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
            ...centreCodeWithCoordinates[i],
            ...(centreCodeWithInformation.find((itemInner) => itemInner.centreCode === centreCodeWithCoordinates[i].centreCode))
        })
    }
    return mergedDataSet;
}