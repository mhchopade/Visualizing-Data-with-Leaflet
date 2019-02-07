// API endpoints for earthquake and tectonic data
var earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Makes the API call for earthquakeData
d3.json(earthquakeData, function(data) {
  // Collects data.features and runs in createFeatures function
  createFeatures(data.features);
});

/* Goal of this function is to parse out from earthquakeData information regarding each earthquake including description, magnitude, location, and markers */
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    // Creates the earthquake layer for the map with popup 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><h3>Magnitude: " + feature.properties.mag + "</h3><h3>Date: " + new Date(feature.properties.time) + "</h3>");
    },
    
    /* I would never have gotten this without reference to this StackOverflow entry: https://stackoverflow.com/questions/24343341/leaflet-js-which-method-to-be-used-for-adding-markers-from-geojson */
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.5,
        color: "#000",
        stroke: true,
        weight: 1.0
    })}}
    );
  
  // Putting earthquakes layer into createMap
  createMap(earthquakes);
}


function createMap(earthquakes) {
    // Creates the outdoor and satellite layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });
  
    // baseMaps
    var baseMaps = {
      "Light": light,
      "Satellite": satellite,
    };

    // Tectonic plate layer
    var tectonicPlates = new L.LayerGroup();

    // Overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Creates map and default view + layers
    var myMap = L.map("map", {
      center: [40, 0],
      zoom: 1.5,
      layers: [light, earthquakes, tectonicPlates]
    }); 

    // Add faults to tectonic layer
    d3.json(tectonicData, function(plateData) {
      L.geoJson(plateData, {
        color: "#ff0000",
        weight: 1
      })
      .addTo(tectonicPlates);
  });
  
    // Layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  /* Idea adapted from TomBerton, Leaflet documentation, and StackOverflow */
  //Legend
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;
  };
  legend.addTo(myMap);
}

  // Defines our magnitude colors 
  function getColor(d){
    return d > 5 ? "#ff0000":
    d  > 4 ? "#ffa500":
    d > 3 ? "#ffff00":
    d > 2 ? "#00ff00":
    d > 1 ? "#0000ff":
             "#ee82ee";
  }

  // Multiplies maginutde by a factor of 30,000
  function getRadius(value){
    return value*30000
  }