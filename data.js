async function loadCentresData(){
    let centreResponse = await axios.get("listing-of-centres.csv");
    let csvCentreData = centreResponse.data;
    let centreJson = await csv().fromString(csvCentreData);
    return centreJson;
}

// function transformData(rawData) {
//     let a = rawData.filter(function(n){
//         return n;
//     })
//     console.log(a)
// }

// //console.log(loadCentresData())

// for (let current of loadCentresData()){
//     let card = document.createElement('div');
//     card.className = "card";
//     card.style.width = "18rem";
//     card.innerHTML = `
//     <div class="card-body">
//     <h5 class="card-title">${current.centre_name}</h5>
//     <p class="card-text">${current.centre_name}</p>
//     `
//     let productDiv = document.querySelector("#details");
//     productDiv.appendChild(card);
// }
