var mapboxgl = require('mapbox-gl');
var overpass = require('./overpass');
var propsDiff = require('./propsDiff');
var config = require('./config');
var moment = require('moment');
var events = require('events').EventEmitter;

function render(container, id, options) {
    var changesetId = id;
    var cmap = new events();

    container.style.width = options.width || '1000px';
    container.style.height = options.height || '500px';
    renderHTML(container);

    options = options || {};
    options.overpassBase = options.overpassBase || config.overpassBase;
    mapboxgl.accessToken = config.mapboxAccessToken;

    var map = new mapboxgl.Map({
        container: document.querySelector('.cmap-map'),
        style: 'mapbox://styles/planemad/cijcefp3q00elbskq4cgvcivf',
        center: [0, 0],
        zoom: 3
    });
    container.classList.add('cmap-loading');
    map.on('load', function () {
        overpass.query(changesetId, options.overpassBase, function(err, result) {
            container.classList.remove('cmap-loading');
            if (err) return errorMessage(err.msg);

            document.querySelector('.cmap-layer-selector').style.display = 'block';
            document.querySelector('.cmap-sidebar-changeset').text = 'Changeset - ' + changesetId;
            document.querySelector('.cmap-sidebar-user').text = 'User - ' + result.changeset.user;
            var time = result.changeset.to ? result.changeset.to : result.changeset.from;
            document.querySelector('.cmap-sidebar-time').textContent = moment(time).format('MMMM Do YYYY, h:mm a');
            document.querySelector('.cmap-sidebar-user').href = "https://openstreetmap.org/user/" + result.changeset.user;
            document.querySelector('.cmap-sidebar-changeset').href = "https://openstreetmap.org/changeset/" + changesetId;
            document.querySelector('.cmap-sidebar').style.display = 'block';
            var bbox = result.changeset.bbox;
            var featureMap = result.featureMap;

                console.log('loaded');
                map.addSource('changeset', {
                    'type': 'geojson',
                    'data': result.geojson
                });


            // bbox.* are strings, use +var to coerce to number
            var left   = +bbox.left,
                right  = +bbox.right,
                top    = +bbox.top,
                bottom = +bbox.bottom;

            // Special case: If a single node was changed, then
            //    bbox.left == bbox.right, and
            //    bbox.top == bbox.bottom
            // In this case, add a little padding to avoid breaking fitBounds
            
            // w,s,e,n
            // left, bottom, right, top

            // s, w, n, e
            // bottom, left, top, right
            // if (left == right) {
            //     left  = left - 0.1;
            //     right = right + 0.1;
            // }
            // if (top == bottom) {
            //     top    = top - 0.1;
            //     bottom = bottom + 0.1;
            // }

            console.log([
                [ bottom, left ],
                [ top, right ]
            ]);

            window.bbox = bbox;
            map.fitBounds([
                [ left, bottom ],
                [ right, top ]
            ]);

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
            var layerSelector = document.querySelector('.cmap-layer-selector');
            layerSelector.addEventListener('change', function(e) {
                var key = e.target.value;
                if (e.target.checked) {
                    selectedLayers = selectedLayers.concat(layersKey[key]);
                    layersKey[key].forEach(function(layer) {
                        map.setLayoutProperty(layer, 'visibility', 'visible');
                    });
                } else {
                    selectedLayers = selectedLayers.filter(function(layer) {
                        return !layer in layersKey[key];
                    });
                    layersKey[key].forEach(function(layer) {
                        map.setLayoutProperty(layer, 'visibility', 'none');
                    });
                }
            });

            cmap.on('selectFeature', function (geometryType, featureId) {
                if (geometryType && featureId) {
                    selectFeature(featureMap[featureId][0], featureMap);
                }
            });

            cmap.on('clearFeature', function () {
                clearFeature();
            });

            cmap.emit('load');
        });
    });

    function errorMessage(message) {
        message = message || 'An unexpected error occured';
        document.querySelector('.cmap-info').innerHTML = message;
        document.querySelector('.cmap-sidebar').style.display = 'block';
        document.querySelector('.cmap-layer-selector').style.display = 'none';

    }

    function displayDiff(id, featureMap) {
        var featuresWithId = featureMap[id];
        var propsArray = featuresWithId.map(function(f) {
            return f.properties;
        });

        var diff = propsDiff(propsArray);
        var diffHTML = getDiffHTML(diff);

        document.querySelector('.cmap-diff').innerHTML = '';
        document.querySelector('.cmap-diff').appendChild(diffHTML);
        document.querySelector('.cmap-diff').style.display = 'block';
    }

    function clearDiff() {
        document.querySelector('.cmap-diff').innerHTML = '';
        document.querySelector('.cmap-diff').style.display = 'none';
    }

    function getDiffHTML(diff) {
        var root = document.createElement('table');
        root.classList.add('cmap-diff-table');

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

    function highlightFeature(featureId) {
        map.setFilter('highlight-line', [
            '==', 'id', featureId
        ]);
        map.setFilter('highlight-point', [
            '==', 'id', featureId
        ]);
    }

    function clearHighlight() {
        map.setFilter('highlight-line', [
            '==', 'id', ''
        ]);
        map.setFilter('highlight-point', [
            '==', 'id', ''
        ]);
    }

    function selectFeature(feature, featureMap) {
      var featureId = feature.properties.id;
      var osmType = feature.properties.type;

      highlightFeature(featureId);
      displayDiff(featureId, featureMap);
      cmap.emit('featureChange', osmType, featureId);
    }

    function clearFeature() {
      clearHighlight();
      clearDiff();
      cmap.emit('featureChange', null, null);
    }

    return cmap;
}

function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

function renderHTML(container) {
  container.classList.add('cmap-container');

  var mapContainer = elt('div', { class: 'cmap-map' });
  container.appendChild(mapContainer);

  var diff = elt('div', { class: 'cmap-diff', style: 'display: none' });
  container.appendChild(diff);

  var sidebar = elt('div', { class: 'cmap-sidebar cmap-pad1', style: 'display: none'});
  sidebar.appendChild(
    elt('div', { class: 'cmap-fill-grey cmap-info'},
      elt('a', { class: 'cmap-sidebar-changeset' }),
      elt('br'),
      elt('a', { class: 'cmap-sidebar-user icon account' }),
      elt('br'),
      elt('span', { class: 'cmap-sidebar-time icon time'})
    )
  );
  sidebar.appendChild(
    elt('div', { class: 'cmap-layer-selector cmap-info cmap-fill-grey'},
      elt('ul', {},
        elt('li', {},
          elt('input', { type: 'checkbox', value: 'added', checked: true }),
          'Added features',
          elt('span', { class: 'cmap-fr'},
            elt('span', { class: 'cmap-color-box added'}))
        ),

        elt('li', {},
          elt('input', { type: 'checkbox', value: 'modified', checked: true }),
          'Modified features',
          elt('span', { class: 'cmap-fr'},
            elt('span', { class: 'cmap-color-box modified-old'}),
            '→',
            elt('span', { class: 'cmap-color-box modified-new'})
          )
        ),

        elt('li', {},
          elt('input', { type: 'checkbox', value: 'deleted', checked: true }),
          'Deleted features',
          elt('span', { class: 'cmap-fr'},
            elt('span', { class: 'cmap-color-box deleted'}))
        )
      )
    )
  );
  container.appendChild(sidebar);
}

function addMapLayers(map, baseLayer) {

    if (baseLayer) {
        map.setStyle(baseLayer, {'diff': true});
    }

    map.addLayer({
        'id': 'highlight-point',
        'source': 'changeset',
        'type': 'circle',
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'circle-radius': 8,
            'circle-color': '#268bd2',
            'circle-opacity': 1
        },
        'filter': [
        '==', 'id', ''
        ]
    });
    map.addLayer({
        'id': 'highlight-line',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'visible'
        },
        'paint': {
            'line-color': '#268bd2',
            'line-width': 8,
            'line-opacity': 1
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
            'line-width': 6,
            'line-opacity': 0.5
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
}

window.changesetMap = module.exports = render;
