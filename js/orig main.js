//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//Step 1. Create the Leaflet map--already done in createMap()
//Step 2. Import GeoJSON data--already done in getData()
//Step 3. Add circle markers for point features to the map--already done in AJAX callback
//Step 4. Determine the attribute for scaling the proportional symbols
//Step 5. For each feature, determine its value for the selected attribute
//Step 6. Give each feature's circle marker a radius based on its attribute value
/*var map;

//function to instantiate the Leaflet map
function createMap(){

    //create the map
    map = L.map('mapid', {
        center: [0, 0],
        zoom: 2
    });*/

var map = L.map('mapid').setView([20, 0], 2);
var minValue;

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYW5iZWNrIiwiYSI6ImNrenk4bHFlZzA2a28yb3A2ZTd3bDVjam0ifQ.xFoQ7_j1nY-jkBADN3p7dw'
}).addTo(map);

getData();

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1850; year <= 2020; year+=25){
              //get population for current year
              var value = city.properties["Pop_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

function createPropSymbols(data){
    var attribute = "TCO_1850";
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);

        //examine the attribute value to check that it is correct
        console.log(feature.properties, attValue);

        //create circle markers
        return L.circleMarker(latlng, geojsonMarkerOptions);
            
        }, 
    onEachFeature: onEachFeature
    }).addTo(map);
}


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

function getData(){
    fetch("data/co2.geojson")
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        //calculate minimum data value
        minValue = calculateMinValue(json);
        //call function to create proportional symbols
        createPropSymbols(json);
    })
};

document.addEventListener('DOMContentLoaded',createMap)
    
