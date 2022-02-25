//declare map variable globally so all functions have access
var map;

//function to instantiate the Leaflet map
function createMap(){

    //create the map
    map = L.map('mapid', {
        center: [0, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYW5iZWNrIiwiYSI6ImNrenk4bHFlZzA2a28yb3A2ZTd3bDVjam0ifQ.xFoQ7_j1nY-jkBADN3p7dw'
    }).addTo(map);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
function getData(){
    fetch("data/MegaCities.geojson")
		.then(function(response){
			return response.json();
		})
		.then(function(json){
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded',createMap)