

    var map = L.map('map', {center: [39.981192, -75.155399], zoom: 10});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    map.doubleClickZoom.disable();     
    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVua2F0YTEyMyIsImEiOiJjbG83c2E4YWgwODBkMmxyOHRtam80bmxjIn0.q7ipu_JOxH1OyW7ZZoqGgw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
    streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

    var baseMaps = {
    "grayscale": grayscale,
    "streets": streets
    };
    // create a polygon of Philadelphia metro
    var myArea = L.polygon([[40.134261, -75.270050],
                             [40.138132, -74.888837],
                             [39.873212, -74.988837],
                             [39.859046, -75.377775]
                             ],
                    {color: 'blue', weight: 1}).addTo(map);

    var temple = L.marker([39.981192, -75.155399]);
    var drexel = L.marker([39.957352834066796, -75.18939693143933]);
    var penn = L.marker([39.95285548473699, -75.19309508637147]);

    var universities = L.layerGroup([temple, drexel, penn]);
    var universityLayer = {
    "Phily University": universities
    };
    // Bind popup to area object
    myArea.bindPopup("Philadelphia metro");
                 
    // Create an Empty Popup
    var popup = L.popup();
    // Write function to set Properties of the Popup
    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }

    // Listen for a click event on the Map element
    map.on('click', onMapClick);

    // load GeoJSON from an external file
    var neighborhoodsLayer = null;
    $.getJSON("data/blood_lead.geojson",function(data){
        neighborhoodsLayer = L.geoJson(data, {
            style: styleFunc,
            onEachFeature: onEachFeatureFunc
        }).addTo(map);
        var overlayLayer = {
            "blood_lead_level": neighborhoodsLayer,
            "Phily University": universities
        };
        
        L.control.layers(baseMaps, overlayLayer).addTo(map);
    
    });
    // Set style function that sets fill color property equal to blood lead
    function styleFunc(feature) {
            return {
                fillColor: setColorFunc(feature.properties.num_bll_5p),
                fillOpacity: 0.9,
                weight: 1,
                opacity: 1,
                color: '#ffffff',
                dashArray: '3'
                };
            }
    // Set function for color ramp, you can use a better palette
    function setColorFunc(density){
            return density > 80 ? '#253494' :
                   density > 60 ? '#2c7fb8' :
                   density > 40 ? '#41b6c4' :
                   density > 20 ? '#7fcdbb' :
                   density > 0 ?  '#c7e9b4' :
                                  '#deebf7';
            };        
            
    // Now we’ll use the onEachFeature option to add the listeners on our state layers:
    function onEachFeatureFunc(feature, layer){
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomFeature
        });
        layer.bindPopup('Blood lead level: '+feature.properties.num_bll_5p);
    }
    // Highlight feature on mouseover
    function highlightFeature(e){
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
        }
    }
    // Define what happens on mouseout:
    function resetHighlight(e) {
         neighborhoodsLayer.resetStyle(e.target);
    } 
    // As an additional touch, let’s define a click listener that zooms to the state: 
    function zoomFeature(e){
        console.log(e.target.getBounds());
        map.fitBounds(e.target.getBounds().pad(1.5));
    } 
    // Add Scale Bar to Map
    L.control.scale({position: 'bottomleft'}).addTo(map);
    // Create Leaflet Control Object for Legend
    var legend = L.control({position: 'bottomright'});

    // Function that runs when legend is added to map
    legend.onAdd = function (map) {
        // Create Div Element and Populate it with HTML
        var div = L.DomUtil.create('div', 'legend');            
        div.innerHTML += '<b>Blood lead level</b><br />';
        div.innerHTML += 'by census tract<br />';
        div.innerHTML += 'of num_bll_5p<br />';
        div.innerHTML += '<br>';
        div.innerHTML += '<i style="background: #253494"></i><p>80+</p>';
        div.innerHTML += '<i style="background: #2c7fb8"></i><p>60-80</p>';
        div.innerHTML += '<i style="background: #41b6c4"></i><p>40-60</p>';
        div.innerHTML += '<i style="background: #7fcdbb"></i><p>20-40</p>';
        div.innerHTML += '<i style="background: #c7e9b4"></i><p>0-20</p>';
        div.innerHTML += '<hr>';
        div.innerHTML += '<i style="background: #deebf7"></i><p>No Data</p>';

    // Return the Legend div containing the HTML content
        return div;
    };

    // Add Legend to Map
    legend.addTo(map);