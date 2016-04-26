var mapboxgl = require('mapbox-gl');
var overpass = require('./overpass');
var propsDiff = require('./propsDiff');
var config = require('./config');

function render(id, options) {
    document.getElementById('loading').style.display = 'block';
    options = options || {};
    var container = options.container || 'map';
    mapboxgl.accessToken = config.mapboxAccessToken;

    window.map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/planemad/cijcefp3q00elbskq4cgvcivf',
        center: [0, 0],
        zoom: 3
    });

    overpass.query(id, function(err, result) {
        if (err) {
            if (err.msg) {
                alert(err.msg);
                console.log(err.error);
            } else {
                alert("An unexpected error occured");
                console.log(err);
            }
            return;
        }
        document.getElementById('loading').style.display = 'none';
        var bbox = result.changeset.bbox;
        var featureMap = result.featureMap;
        map.addSource('changeset', {
            'type': 'geojson',
            'data': result.geojson
        });
        map.addLayer({
            'id': 'changeset-line',
            'source': 'changeset',
            'type': 'line',
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
            'interactive': true,
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
        map.on('click', function(e) {
            map.featuresAt(e.point, {
                'radius': 5,
                'layer': [
                    'added-line',
                    'added-point',
                    'modified-old-line',
                    'modified-old-point',
                    'modified-new-line',
                    'modified-new-point',
                    'deleted-line',
                    'deleted-point'
                ]
            }, function(err, features) {
                if (err) {
                    throw err;
                    return;
                }
                if (features.length) {
                    map.setFilter('changeset-line', [
                        '==', 'id', features[0].properties.id
                    ]);
                    map.setFilter('changeset-point', [
                        '==', 'id', features[0].properties.id
                    ]);
                    displayDiff(features[0].properties.id, featureMap);
                } else {
                    map.setFilter('changeset-line', [
                        '==', 'id', ''
                    ]);
                    map.setFilter('changeset-point', [
                        '==', 'id', ''
                    ]);
                    clearDiff();
                }
            });
        });
        var bounds = [
            [bbox.left, bbox.top],
            [bbox.right, bbox.bottom]
        ];
        map.fitBounds(bounds);
    });

    function displayDiff(id, featureMap) {
        var featuresWithId = featureMap[id];
        var propsArray = featuresWithId.map(function(f) {
            return f.properties;
        });

        var diff = propsDiff(propsArray);
        var diffHTML = getDiffHTML(diff);

        document.getElementById('diff').innerHTML = '';
        document.getElementById('diff').appendChild(diffHTML);
        document.getElementById('diff').style.display = 'block';
    }

    function clearDiff() {
        document.getElementById('diff').innerHTML = '';
        document.getElementById('diff').style.display = 'none';
    }

    function getDiffHTML(diff) {
        var root = document.createElement('table');
        root.classList.add('diff-table');

        var types = ['added', 'unchanged', 'deleted', 'modifiedOld', 'modifiedNew'];
        for (var prop in diff) {
            var tr = document.createElement('tr');

            var th = document.createElement('th');
            th.textContent = prop;
            tr.appendChild(th);

            types.forEach(function(type) {
                if (diff[prop].hasOwnProperty(type)) {
                    var td = document.createElement('td');
                    td.classList.add('diff-property');
                    td.classList.add(type);

                    td.textContent = diff[prop][type];
                    tr.appendChild(td);

                    if (type == "unchanged") {
                        tr.appendChild(td.cloneNode(true));
                    }
                }
            });

            root.appendChild(tr);
        }
        return root;
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