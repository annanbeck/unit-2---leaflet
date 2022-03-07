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

    var map = L.map('map').setView([20, 0], 2);
    var minValue;
    var dataStats = {};

     function PopupContent(properties, attribute){
        this.properties = properties;
        this.attribute = attribute;
        this.year = attribute.split("_")[1];
        this.tco = this.properties[attribute];
        this.formatted = "<p><b> " + this.properties.Country + " emitted " + this.tco + " tons of Carbon Dioxide in " + this.year + ".</b></p>";
    };

    
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYW5iZWNrIiwiYSI6ImNrenk4bHFlZzA2a28yb3A2ZTd3bDVjam0ifQ.xFoQ7_j1nY-jkBADN3p7dw'
    }).addTo(map);
    
    getData();

    function calcStats(data) {
        //create empty array to store all data values
        var allValues = [];
        //loop through each city
        for (var country of data.features) {
          //loop through each year
          for (var year = 1850; year <= 2020; year+=25) {
            //get population for current year
            var value = country.properties["TCO_" + String(year)];
            //add value to array
            allValues.push(value);
          }
        }
        //get min, max, mean stats for our array
        dataStats.min = Math.min(...allValues);
        dataStats.max = Math.max(...allValues);
        //calculate meanValue
        var sum = allValues.reduce(function (a, b) {
          return a + b;
        });
        dataStats.mean = sum / allValues.length;
      }

    
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
                  if (value > .01){
                    allValues.push(value)
             };
            }
        }
        //get minimum value of our array
        var minValue = Math.min(...allValues)
    
        return minValue;
    }
    
    //calculate the radius of each proportional symbol
    function calcPropRadius(attValue) {
        //constant factor adjusts symbol sizes evenly
        var minRadius = .5;
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
    
        //create new popup content...Example 1.4 line 1
        var popup = new PopupContent(feature.properties, attribute);

        layer.bindPopup(popup.formatted, {
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

    function getCircleValues(attribute) {
        //start with min at highest possible and max at lowest possible number
        var min = Infinity,
          max = -Infinity;
      
        map.eachLayer(function (layer) {
          //get the attribute value
          if (layer.feature) {
            var attributeValue = Number(layer.feature.properties[attribute]);
      
            //test for min
            if (attributeValue < min) {
              min = attributeValue;
            }
      
            //test for max
            if (attributeValue > max) {
              max = attributeValue;
            }
          }
        });
      
        //set mean
        var mean = (max + min) / 2;
      
        //return values as an object
        return {
          max: max,
          mean: mean,
          min: min,
        };
      }
      
      function updateLegend(attribute) {
        //create content for legend
        var year = attribute.split("_")[1];
        //replace legend content
        document.querySelector("span.year").innerHTML = year;
      
        //get the max, mean, and min values as an object
        var circleValues = getCircleValues(attribute);
      
        for (var key in circleValues) {
          //get the radius
          var radius = calcPropRadius(circleValues[key]);
      
          document.querySelector("#" + key).setAttribute("cy", 59 - radius);
          document.querySelector("#" + key).setAttribute("r", radius)
      
          document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + " tons";
      
        }
      }
      

    function updatePropSymbols(attribute){
        map.eachLayer(function(layer){
            if (layer.feature && layer.feature.properties[attribute]){
              //access feature properties
               var props = layer.feature.properties;
    
               //update each feature's radius based on new attribute values
               var radius = calcPropRadius(props[attribute]);
               layer.setRadius(radius);
    
               var popupContent = new PopupContent(props, attribute);

               //update popup with new content
               var popup = layer.getPopup();
               popup.setContent(popupContent.formatted).update();
    
            };
        });
        updateLegend(attribute);
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

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            container.innerHTML = '<p class="temporalLegend">Tons of Carbon Dioxide in <span class="year">1850</span></p>';
                 //Step 1: start attribute legend svg string
                 var svg = '<svg id="attribute-legend" width="160px" height="60px">';

                 //add attribute legend svg to container
                 container.innerHTML += svg;

                 //Example 3.5 line 15...Step 1: start attribute legend svg string
        var svg = '<svg id="attribute-legend" width="130px" height="130px">';

        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];

        //Step 2: loop to add each circle and text to svg string
        for (var i=0; i<circles.length; i++){
            //circle string
            svg += '<circle class="legend-circle" id="' + circles[i] + 
            '" fill="#636464" fill-opacity="0.8" stroke="#000000" cx="30"/>';
        };

      //array of circle names to base loop on  
      var circles = ["max", "mean", "min"]; 
  
      //Step 2: loop to add each circle and text to svg string  
      for (var i=0; i<circles.length; i++){  

          //Step 3: assign the r and cy attributes  
          var radius = calcPropRadius(dataStats[circles[i]]);  
          var cy = 59 - radius;  

          //circle string  
          svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#636464" fill-opacity="0.8" stroke="#000000" cx="30"/>';    

        //evenly space out labels            
        var textY = i * 20 + 20;            
            
        //text string            
        svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " tons" + '</text>';
    
      };
      //close svg string  
      svg += "</svg>"; 

       //add attribute legend svg to container
       container.insertAdjacentHTML('beforeend',svg);
     
                 return container;
             }
         });
     
         map.addControl(new LegendControl());
     
     };

    
    function createSequenceControls(attributes){
        //create range input element (slider)
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
    
            onAdd: function () {
                // create the control container div with a particular class name
                var container = L.DomUtil.create('div', 'sequence-control-container');
    
                //create range input element (slider)
                container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range"></input>')
              //add skip buttons
                 container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/l arrow.png"></button>'); 
                container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/R arrow.png"></button>'); 
    
              //disable any mouse event listeners for the container
              L.DomEvent.disableClickPropagation(container);
    
    
              return container;
                
            }
            
        });map.addControl(new SequenceControl());

        //var slider = "<input class='range-slider' type='range'></input>";
        //document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
        
        //set slider attributes
        document.querySelector(".range-slider").max = 8;
        document.querySelector(".range-slider").min = 0;
        document.querySelector(".range-slider").value = 0;
        document.querySelector(".range-slider").step = 1;
   
        
        document.querySelectorAll('.step').forEach(function(step){
            step.addEventListener("click", function(){
                var index = document.querySelector('.range-slider').value;
                //Step 6: increment or decrement depending on button clicked
                if (step.id == 'forward'){
                    index++;
                    //Step 7: if past the last attribute, wrap around to first attribute
                    index = index > 8 ? 0 : index;
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
                calcStats(json);
                //call function to create proportional symbols
                createPropSymbols(json, attributes);
                createSequenceControls(attributes);
                createLegend(attributes);
            })
    };
    
    //document.addEventListener('DOMContentLoaded',createMap)