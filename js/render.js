var mapboxgl = require('mapbox-gl');
var overpass = require('./overpass');
var propsDiff = require('./propsDiff');
var config = require('./config');
var moment = require('moment');

function render(hash, options) {
    debugger;
    var changesetId = hash.split('/')[0].replace('#', '');

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

    overpass.query(changesetId, function(err, result) {
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
        document.getElementById('layerSelector').style.display = 'block';
        document.getElementById('changeset').text = changesetId;
        document.getElementById('user').text = result.changeset.user;
        var time = result.changeset.to ? result.changeset.to : result.changeset.from;
        document.getElementById('time').textContent = moment(time).format('MMMM Do YYYY, h:mm a');
        document.getElementById('user').href = "https://openstreetmap.org/user/" + result.changeset.user;
        document.getElementById('changeset').href = "https://openstreetmap.org/changeset/" + changesetId;
        document.getElementById('sidebar').style.display = 'block';
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
                'line-width': 3
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
                'circle-radius': 4,
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
                'line-color': '#859900',
                'line-width': 2
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
                'circle-color': '#859900',
                'circle-radius': 3,
                'circle-blur': 1
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
                'line-color': '#fdf6e3',
                'line-width': 2
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
                'circle-color': '#fdf6e3',
                'circle-radius': 3,
                'circle-blur': 1
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
                'line-color': '#b58900',
                'line-width': 2
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
                'circle-color': '#b58900',
                'circle-radius': 3,
                'circle-blur': 1
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
                'line-color': '#dc322f',
                'line-width': 2
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
                'circle-color': '#dc322f',
                'circle-radius': 3,
                'circle-blur': 1
            },
            'filter': [
                '==', 'changeType', 'deleted'
            ]
        });

        map.on('click', function(e) {
            var x1y1 = [e.point.x - 5, e.point.y - 5];
            var x2y2 = [e.point.x + 5, e.point.y + 5];
            var features = map.queryRenderedFeatures([x1y1, x2y2], {
                'layers': [
                    'added-line',
                    'added-point',
                    'modified-old-line',
                    'modified-old-point',
                    'modified-new-line',
                    'modified-new-point',
                    'deleted-line',
                    'deleted-point'
                ]
            });

            if (features.length) {
                selectFeature(features[0], featureMap);
            } else {
                clearFeature();
            }
        });

        var bounds = [
            [bbox.left, bbox.top],
            [bbox.right, bbox.bottom]
        ];
        map.fitBounds(bounds);

        var layersKey = {
            'added': [
                'added-line',
                'added-point'
            ],
            'modified': [
                'modified-old-line',
                'modified-old-point',
                'modified-new-line',
                'modified-new-point'
            ],
            'deleted': [
                'deleted-line',
                'deleted-point'
            ]
        };
        var selectedLayers = [
            'added-line',
            'added-point',
            'modified-old-line',
            'modified-old-point',
            'modified-new-line',
            'modified-new-point',
            'deleted-line',
            'deleted-point'
        ];
        var layerSelector = document.getElementById('layerSelector');
        layerSelector.addEventListener('change', function(e) {
            var key = e.target.value;
            if (e.target.checked) {
                selectedLayers = selectedLayers.concat(layersKey[key]);
                layersKey[key].forEach(function(layer) {
                    map.setLayoutProperty(layer, 'visibility', 'visible');
                })
            } else {
                selectedLayers = selectedLayers.filter(function(layer) {
                    return !layer in layersKey[key];
                });
                layersKey[key].forEach(function(layer) {
                    map.setLayoutProperty(layer, 'visibility', 'none');
                });
            }
        });

        var [, geometryType, featureId] = hash.split('/');

        if (geometryType && featureId) {
            selectFeature(featureMap[featureId][0], featureMap);
        }
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
                    if (type == "added") {
                      var empty = document.createElement('td');
                      empty.classList.add('diff-property');
                      empty.classList.add(type);

                      tr.appendChild(empty);
                    }

                    var td = document.createElement('td');
                    td.classList.add('diff-property');
                    td.classList.add(type);

                    td.textContent = diff[prop][type];
                    tr.appendChild(td);

                    if (type == "deleted") {
                      var empty = document.createElement('td');
                      empty.classList.add('diff-property');
                      empty.classList.add(type);

                      tr.appendChild(empty);
                    }

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

    function highlightFeature(featureId) {
        map.setFilter('changeset-line', [
            '==', 'id', featureId
        ]);
        map.setFilter('changeset-point', [
            '==', 'id', featureId
        ]);
    }

    function clearHighlight() {
        map.setFilter('changeset-line', [
            '==', 'id', ''
        ]);
        map.setFilter('changeset-point', [
            '==', 'id', ''
        ]);
    }

    function updateHash(geometryType, featureId) {
      clearHash();

      location.hash += '/' + geometryType;
      location.hash += '/' + featureId;
    }

    function clearHash() {
      var changesetId = location.hash
        .split('/')[0]
        .replace('#', '');

      location.hash = changesetId;
    }

    function selectFeature(feature, featureMap) {
      var featureId = feature.properties.id;
      var geometryType = feature.geometry.type;

      highlightFeature(featureId);
      displayDiff(featureId, featureMap);
      updateHash(geometryType, featureId);
    }

    function clearFeature() {
      clearHighlight();
      clearDiff();
      clearHash();
    }
}


module.exports = render;
