var mapboxgl = require('mapbox-gl');
var overpass = require('./overpass');
var config = require('./config');

function render(id, options) {
    var options = options || {};
    var container = options.container || 'map';
    mapboxgl.accessToken = config.mapboxAccessToken;
    window.map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/planemad/cijcefp3q00elbskq4cgvcivf',
        //style: 'mapbox://styles/mapbox/streets-v8',
        center: [0, 0],
        zoom: 3
    });

    overpass.query(id, function(err, result) {
        // var layers = {
        //     'added': {
        //         'color': '#0f0'
        //     },
        //     'modifiedOld': {
        //         'color': '#888'
        //     },
        //     'modifiedNew': {
        //         'color': '#ff6'
        //     },
        //     'deleted': {
        //         'color': '#f00'
        //     }
        // };
        var bbox = result.changeset.bbox;
        console.log('doing map stuff', result.geojson);
        map.addSource('changeset', {
            'type': 'geojson',
            'data': result.geojson
        });
        map.addLayer({
            'id': 'changeset-line',
            'source': 'changeset',
            'type': 'line',
            'interactive': true,
            'layout': {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
            },
            'paint': {
                'line-color': '#fff',
                'line-width': 2
            },
            'filter': [
                '==', 'id', ''
            ]
        });
        map.addLayer({
            'id': 'changeset-point',
            'source': 'changeset',
            'type': 'circle',
            'interactive': true,
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fff'
            },
            'filter': [
                '==', 'id', ''
            ]
        });
        map.addLayer({
            'id': 'added-line',
            'source': 'changeset',
            'type': 'line',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'line-color': '#0f0',
                'line-width': 1
            },
            'filter': [
                '==', 'changeType', 'added'
            ]
        });
        map.addLayer({
            'id': 'added-point',
            'source': 'changeset',
            'type': 'circle',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 2,
                'circle-color': '#0f0'
            },
            'filter': [
                '==', 'changeType', 'added'
            ]
        });
        map.addLayer({
            'id': 'modified-old-line',
            'source': 'changeset',
            'type': 'line',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'line-color': '#ccc',
                'line-width': 1
            },
            'filter': [
                '==', 'changeType', 'modifiedOld'
            ]
        });
        map.addLayer({
            'id': 'modified-old-point',
            'source': 'changeset',
            'type': 'circle',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 2,
                'circle-color': '#fff'
            },
            'filter': [
                '==', 'changeType', 'modifiedOld'
            ]
        });
        map.addLayer({
            'id': 'modified-new-line',
            'source': 'changeset',
            'type': 'line',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'line-color': '#ff0',
                'line-width': 1
            },
            'filter': [
                '==', 'changeType', 'modifiedNew'
            ]
        });
        map.addLayer({
            'id': 'modified-new-point',
            'source': 'changeset',
            'type': 'circle',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 2,
                'circle-color': '#B0AD4D'
            },
            'filter': [
                '==', 'changeType', 'modifiedNew'
            ]
        });
        map.addLayer({
            'id': 'deleted-line',
            'source': 'changeset',
            'type': 'line',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'line-color': '#f00',
                'line-width': 1
            },
            'filter': [
                '==', 'changeType', 'deleted'
            ]
        });
        map.addLayer({
            'id': 'deleted-point',
            'source': 'changeset',
            'type': 'circle',
            'layout': {
                'visibility': 'visible'
            },
            'paint': {
                'circle-radius': 2,
                'circle-color': '#9E1010'
            },
            'filter': [
                '==', 'changeType', 'deleted'
            ]

            
        });
        map.on('mousemove', function(e) {
            console.log('mouse moved', e);
            map.featuresAt(e.point, {
                'radius': 5,
                'layer': [
                    'changeset-line',
                    'changeset-point'
                ]
            }, function(err, features) {
                console.log('featuresAt callback called', features);
                if (err) {
                    console.log('featuresAt error', err);
                }
                if (!err && features.length) {
                    console.log('features at', features);
                    map.setFilter('changeset-line', [
                        '==', 'id', features[0].properties.id
                    ]);
                    map.setFilter('changeset-point', [
                        '==', 'id', features[0].properties.id
                    ]);
                    displayProperties(features[0]);
                } else {
                    map.setFilter('changeset-line', [
                        '==', 'id', ''
                    ]);
                    map.setFilter('changeset-point', [
                        '==', 'id', ''
                    ]);
                    clearProperties();
                }
            });
        });
        // Object.keys(layers).forEach(function(layerName) {
        //     if (result[layerName].features.length > 0) {
        //         console.log('geojson', layerName, result[layerName]);
        //         map.addSource(layerName, {
        //             'type': 'geojson',
        //             'data': result[layerName]
        //         });
        //         map.addLayer({
        //             "id": layerName,
        //             "type": "line",
        //             "source": layerName,
        //             "layout": {
        //                 "line-join": "round",
        //                 "line-cap": "round",
        //                 "visibility": "visible"
        //             },
        //             "paint": {
        //                 "line-color": layers[layerName].color,
        //                 "line-width": 8
        //             }
        //         });
        //         addLayer(layerName, layerName);
        //     }
        // });
        var bounds = [
            [bbox.left, bbox.top],
            [bbox.right, bbox.bottom]
        ];
        map.fitBounds(bounds);
    });

    function displayProperties(feature) {
        var json = JSON.stringify(feature.properties, null, 2);
        document.getElementById('properties').innerHTML = json;
    }

    function clearProperties() {
        document.getElementById('properties').innerHTML = '';
    }

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