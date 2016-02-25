var mapboxgl = require('mapbox-gl');
var overpass = require('./overpass');
var config = require('./config');

function render(id, options) {
    var options = options || {};
    var container = options.container || 'map';
    mapboxgl.accessToken = config.mapboxAccessToken;
    var map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v8',
        center: [0, 0],
        zoom: 3
    });

    overpass.query(id, function(err, result) {
        var layers = {
            'added': {
                'color': '#0f0'
            },
            'modifiedOld': {
                'color': '#888'
            },
            'modifiedNew': {
                'color': '#ff6'
            },
            'deleted': {
                'color': '#f00'
            }
        };
        var bbox = result.changeset.bbox;
        console.log('doing map stuff');

        Object.keys(layers).forEach(function(layerName) {
            console.log('geojson', layerName, result[layerName]);
            map.addSource(layerName, {
                'type': 'geojson',
                'data': result[layerName]
            });
            map.addLayer({
                "id": layerName,
                "type": "line",
                "source": layerName,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round",
                    "visibility": "visible"
                },
                "paint": {
                    "line-color": layers[layerName].color,
                    "line-width": 8
                }
            });
            addLayer(layerName, layerName);
        });
        var bounds = [
            [bbox.left, bbox.top],
            [bbox.right, bbox.bottom]
        ];
        map.fitBounds(bounds);
    });

    function addLayer(name, id) {
        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = name;

        link.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();

            var visibility = map.getLayoutProperty(id, 'visibility');

            if (visibility === 'visible') {
                map.setLayoutProperty(id, 'visibility', 'none');
                this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(id, 'visibility', 'visible');
            }
        };

        var layers = document.getElementById('menu');
        layers.appendChild(link);
    }

}


module.exports = render;