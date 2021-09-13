async function loadCentresData(){
    let centreResponse = await axios.get("listing-of-centres.csv");
    let csvCentreData = centreResponse.data;
    let centreJson = await csv().fromString(csvCentreData);
    return centreJson;
}
