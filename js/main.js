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
    
    function calcMinValue(data){
        //create empty array to store all data values
        var allValues = [];
        //loop through each city
        for(var country of data.features){
            //loop through each year
            for(var year = 1850; year <= 2020; year+=25){
                  //get population for current year
                  var value = country.properties["TCO_"+ String(year)];
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
    
    //function to convert markers to circle markers and add popups
    function pointToLayer(feature, latlng, attributes){
        //Determine which attribute to visualize with proportional symbols
        var attribute = attributes[0];
    
        //create marker options
        var options = {
            fillColor: "#636363",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    
        //For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties[attribute]);
    
        //Give each feature's circle marker a radius based on its attribute value
        options.radius = calcPropRadius(attValue);
    
        //create circle marker layer
        var layer = L.circleMarker(latlng, options);
    
        //build popup content string starting with city...Example 2.1 line 24
        var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";
    
        //add formatted attribute to popup content string
        var year = attribute.split("_")[1];
        popupContent += "<p><b>Carbon Dioxide emissions in " + year + ":</b> " + feature.properties[attribute] + " tons</p>";
    
        //bind the popup to the circle marker
        layer.bindPopup(popupContent, {
              offset: new L.Point(0,-options.radius)
          });
    
        //return the circle marker to the L.geoJson pointToLayer option
        return layer;
    };
    
    function createPropSymbols(data, attributes){
        //create a leaflet geojson layer and add it to the map
        L.geoJson(data, {
            pointToLayer: function(feature, latlng){
                return pointToLayer(feature, latlng, attributes);
            }
        }).addTo(map);
    };

    function updatePropSymbols(attribute){
        map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attribute]){
              //access feature properties
               var props = layer.feature.properties;
    
               //update each feature's radius based on new attribute values
               var radius = calcPropRadius(props[attribute]);
               layer.setRadius(radius);
    
               //add city to popup content string
               var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";
    
               //add formatted attribute to panel content string
               var year = attribute.split("_")[1];
               popupContent += "<p><b>Carbon Dioxide emissions in " + year + ":</b> " + props[attribute] + " tons</p>";
    
               //update popup with new content
               popup = layer.getPopup();
               popup.setContent(popupContent).update();
    
            };
        });
    };

    function processData(data){
        //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("TCO") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

    
    function createSequenceControls(attributes){
        //create range input element (slider)
        var slider = "<input class='range-slider' type='range'></input>";
        document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
        
        //set slider attributes
        document.querySelector(".range-slider").max = 9;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;
        
        //add step buttons
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
        document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
    
        //replace button content with images
        document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/l arrow.png'>")
        document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/R arrow.png'>")

        document.querySelectorAll('.step').forEach(function(step){
            step.addEventListener("click", function(){
                var index = document.querySelector('.range-slider').value;
                //Step 6: increment or decrement depending on button clicked
                if (step.id == 'forward'){
                    index++;
                    //Step 7: if past the last attribute, wrap around to first attribute
                    index = index > 9 ? 0 : index;
                } else if (step.id == 'reverse'){
                    index--;
                    //Step 7: if past the first attribute, wrap around to last attribute
                    index = index < 0 ? 9 : index;
                };
    
                //Step 8: update slider
                document.querySelector('.range-slider').value = index;
    
                //Step 9: pass new attribute to update symbols
                updatePropSymbols(attributes[index]);
            })
        })
        document.querySelector('.range-slider').addEventListener('input', function(){
            var index = this.value;

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
        })
    };
    
    function getData(map){
        //load the data
        fetch("data/co2.geojson")
            .then(function(response){
                return response.json();
            })
            .then(function(json){
                var attributes = processData(json);
                //calculate minimum data value
                minValue = calcMinValue(json);
                //call function to create proportional symbols
                createPropSymbols(json, attributes);
                createSequenceControls(attributes);
            })
    };
    
    document.addEventListener('DOMContentLoaded',createMap)