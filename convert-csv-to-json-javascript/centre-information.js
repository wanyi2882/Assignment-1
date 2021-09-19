async function loadCentresData(){
    let centreResponse = await axios.get("csv-data/listing-of-centres.csv");
    let csvCentreData = centreResponse.data;
    let centreJson = await csv().fromString(csvCentreData);
    return centreJson;
}
