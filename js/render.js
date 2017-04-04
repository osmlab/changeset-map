'use strict';

var mapboxgl = require('mapbox-gl');
var getChangeset = require('./getChangeset');
var propsDiff = require('./propsDiff');
var config = require('./config');
var moment = require('moment');
var events = require('events').EventEmitter;
var turfBboxPolygon = require('@turf/bbox-polygon');
var featureCollection = require('@turf/helpers').featureCollection;
var cmap, map;

function render(container, id, options) {
    var changesetId = id;
    cmap = new events();

    container.style.width = options.width || '1000px';
    container.style.height = options.height || '500px';
    renderHTML(container);

    options = options || {};
    options.overpassBase = options.overpassBase || config.overpassBase;
    mapboxgl.accessToken = config.mapboxAccessToken;

    container.classList.add('cmap-loading');
    getChangeset(changesetId, options.overpassBase, function(err, result) {
        container.classList.remove('cmap-loading');
        if (err) return errorMessage(err.msg);

        // Add `tagsCount` to feature properties
        result.geojson.features.forEach(function(feature) {
            var tags = feature.properties.tags || {};
            feature.properties.tagsCount = Object.keys(tags).length;
        });

        document.querySelector('.cmap-layer-selector').style.display = 'block';
        document.querySelector('.cmap-layer-selector').style.display = 'block';
        document.querySelector('.cmap-sidebar-changeset').text = 'Changeset - ' + changesetId;
        document.querySelector('.cmap-sidebar-user').text = 'User - ' + result.changeset.user;
        var time = result.changeset.to ? result.changeset.to : result.changeset.from;
        document.querySelector('.cmap-sidebar-time').textContent = moment(time).format('MMMM Do YYYY, h:mm a');
        document.querySelector('.cmap-sidebar-user').href = 'https://openstreetmap.org/user/' + result.changeset.user;
        document.querySelector('.cmap-sidebar-changeset').href = 'https://openstreetmap.org/changeset/' + changesetId;
        document.querySelector('.cmap-sidebar').style.display = 'block';
        var bbox = result.changeset.bbox;
        var featureMap = result.featureMap;

        renderMap(false, result);

        var layerSelector = document.querySelector('.cmap-layer-selector');
        var typeSelector = document.querySelector('.cmap-type-selector');
        layerSelector.addEventListener('change', filterLayers);
        typeSelector.addEventListener('change', filterLayers);

        var baseLayerSelector = document.querySelector('.cmap-baselayer-selector');
        baseLayerSelector.addEventListener('change', function(e) {
            var layer = e.target.value;
            if (layer === 'satellite') {
                renderMap('mapbox://styles/rasagy/cizp6lsah00ct2snu6gi3p16q', result);
            }

            if (layer === 'dark') {
                renderMap('mapbox://styles/mapbox/dark-v9', result);
            }

            if (layer === 'streets') {
                renderMap('mapbox://styles/mapbox/streets-v9', result);
            }
        });

        cmap.on('selectFeature', function (geometryType, featureId) {
            if (geometryType && featureId) {
                selectFeature(map, featureMap[featureId][0], featureMap);
            }
        });

        cmap.on('clearFeature', function () {
            clearFeature(map);
        });
    });

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
        if (typeof child == 'string')
            child = document.createTextNode(child);
        node.appendChild(child);
    }
    return node;
}

function renderHTML(container) {
    container.classList.add('cmap-container');

    var mapContainer = elt('div', {class: 'cmap-map'});
    container.appendChild(mapContainer);

    var diffMetadata = elt('div', {class: 'cmap-diff-metadata cmap-scroll-styled', style: 'display: none'});
    var diffTags = elt('div', {class: 'cmap-diff-tags cmap-scroll-styled', style: 'display: none'});
    var diff = elt('div', {class: 'cmap-diff', style: 'display: none'}, diffMetadata, diffTags);
    container.appendChild(diff);

    var sidebar = elt('div', {class: 'cmap-sidebar cmap-pad1', style: 'display: none'});
    sidebar.appendChild(
    elt('div', {class: 'cmap-fill-grey cmap-info'},
      elt('a', {class: 'cmap-sidebar-changeset'}),
      elt('br'),
      elt('a', {class: 'cmap-sidebar-user icon account'}),
      elt('br'),
      elt('span', {class: 'cmap-sidebar-time icon time'})
      )
    );
    sidebar.appendChild(
    elt('div', {class: 'cmap-layer-selector cmap-info cmap-fill-grey'},
      elt('ul', {},
        elt('li', {},
          elt('label', {for: 'cmap-layer-selector-added', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'added', checked: true, id: 'cmap-layer-selector-added'}),
            'Added features',
            elt('span', {class: 'cmap-fr'},
              elt('span', {class: 'cmap-color-box added'}))
            )
          ),

        elt('li', {},
          elt('label', {for: 'cmap-layer-selector-modified', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'modified', checked: true, id: 'cmap-layer-selector-modified'}),
            'Modified features',
            elt('span', {class: 'cmap-fr'},
              elt('span', {class: 'cmap-color-box modified-old'}),
              '→',
              elt('span', {class: 'cmap-color-box modified-new'})
              )
            )
          ),

        elt('li', {},
          elt('label', {for: 'cmap-layer-selector-deleted', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'deleted', checked: true, id: 'cmap-layer-selector-deleted'}),
            'Deleted features',
            elt('span', {class: 'cmap-fr'},
              elt('span', {class: 'cmap-color-box deleted'}))
            )
          )
        )
      )
    );

    sidebar.appendChild(
    elt('div', {class: 'cmap-type-selector cmap-info cmap-fill-grey'},
      elt('ul', {},
        elt('li', {},
          elt('label', {for: 'cmap-type-selector-nodes', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'nodes', checked: true, id: 'cmap-type-selector-nodes'}),
            'Nodes')
          ),

        elt('li', {},
          elt('label', {for: 'cmap-type-selector-ways', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'ways', checked: true, id: 'cmap-type-selector-ways'}),
            'Ways')
          ),

        elt('li', {},
          elt('label', {for: 'cmap-type-selector-relations', class: 'cmap-noselect cmap-pointer'},
            elt('input', {type: 'checkbox', value: 'relations', checked: true, id: 'cmap-type-selector-relations'}),
            'Relations')
          )
        )
      )
    );

    sidebar.appendChild(
    elt('div', {class: 'cmap-info cmap-baselayer-selector cmap-fill-grey'},
        elt('form', {},
          elt('input', {type: 'radio', value: 'satellite', checked: true, name: 'baselayer', id: 'cmap-baselayer-satellite'}),
          elt('label', {for: 'cmap-baselayer-satellite', class: 'cmap-noselect cmap-pointer'}, 'Satellite'),
          elt('input', {type: 'radio', value: 'streets', name: 'baselayer', id: 'cmap-baselayer-streets'}),
          elt('label', {for: 'cmap-baselayer-streets', class: 'cmap-noselect cmap-pointer'}, 'Streets'),
          elt('input', {type: 'radio', value: 'dark', name: 'baselayer', id: 'cmap-baselayer-dark'}),
          elt('label', {for: 'cmap-baselayer-dark', class: 'cmap-noselect cmap-pointer'}, 'Dark')
          )
        )
    );

    container.appendChild(sidebar);
}

function addMapLayers(baseLayer, result, bounds) {

    map.addSource('changeset', {
        'type': 'geojson',
        'data': result.geojson
    });

    map.addSource('bbox', {
        'type': 'geojson',
        'data': getBoundingBox(bounds)
    });

    map.addLayer({
        'id': 'bbox-line',
        'type': 'line',
        'source': 'bbox',
        'paint': {
            'line-color': '#A58CF2',
            'line-opacity': 0.75,
            'line-width': 2
        }
    });

    map.addLayer({
        'id': 'bg-line',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': 'hsl(0, 0%, 15%)',
            'line-width': 12,
            'line-blur': 0.2,
            'line-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        12,
                        0.5
                    ],
                    [
                        18,
                        0.2
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', 'type', 'way']
        ]
    });

    map.addLayer({
        'id': 'bg-point',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': 'hsl(0, 0%, 15%)',
            'circle-blur': 0.2,
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        12,
                        0.5
                    ],
                    [
                        18,
                        0.2
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        12
                    ],
                    [
                        16,
                        10
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', '$type', 'Point'],
        ]
    });

    map.addLayer({
        'id': 'highlight-line',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'hsl(0, 0%, 75%)',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        10,
                        15
                    ],
                    [
                        16,
                        10
                    ]
                ]
            },
            'line-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        12,
                        0.75
                    ],
                    [
                        18,
                        0.75
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', 'id', ''],
            ['==', '$type', 'LineString'],
        ]
    });

    map.addLayer({
        'id': 'highlight-point',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': 'hsl(0, 0%, 75%)',
            'circle-radius': {
                'base': 1,
                'stops': [
                    [
                        10,
                        9
                    ],
                    [
                        16,
                        10
                    ]
                ]
            },
            'circle-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'id', ''],
            ['==', '$type', 'Point'],
        ]
    });

// Relations

    map.addLayer({
        'id': 'deleted-relation',
        'source': 'changeset',
        'type': 'line',
        'paint': {
            'line-color': '#CC2C47',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1.5
                    ],
                    [
                        12,
                        1.5
                    ]
                ]
            },
            'line-dasharray': [
                0.1,
                0.1
            ],
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'relation'],
            ['==', 'changeType', 'deletedNew']
        ]
    });

    map.addLayer({
        'id': 'modified-old-relation',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#DB950A',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1.75
                    ],
                    [
                        12,
                        1.75
                    ]
                ]
            },
            'line-blur': 0.25,
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'relation'],
            ['==', 'changeType', 'modifiedOld']
        ]
    });

    map.addLayer({
        'id': 'modified-new-relation',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#E8E845',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1.25
                    ],
                    [
                        12,
                        1.25
                    ]
                ]
            },
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'relation'],
            ['==', 'changeType', 'modifiedNew']
        ]
    });

    map.addLayer({
        'id': 'added-relation',
        'source': 'changeset',
        'type': 'line',
        'interactive': true,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#39DBC0',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1
                    ],
                    [
                        12,
                        1
                    ]
                ]
            },
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'relation'],
            ['==', 'changeType', 'added']
        ]
    });

    map.addLayer({
        'id': 'deleted-line',
        'source': 'changeset',
        'type': 'line',
        'paint': {
            'line-color': '#CC2C47',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        3
                    ],
                    [
                        12,
                        5
                    ]
                ]
            },
            'line-dasharray': [
                0.1,
                0.25
            ],
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'way'],
            ['==', 'changeType', 'deletedNew']
        ]
    });

    map.addLayer({
        'id': 'modified-old-point-on-way',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#DB950A',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.5
                    ]
                ]
            },
            'circle-blur': 0.25,
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        2.5
                    ],
                    [
                        16,
                        3.5
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', '$type', 'LineString'],
            ['==', 'changeType', 'modifiedOld']
        ]
    });

    map.addLayer({
        'id': 'modified-old-line',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#DB950A',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        3
                    ],
                    [
                        12,
                        6
                    ]
                ]
            },
            'line-blur': {
                'base': 1,
                'stops': [
                    [
                        8,
                        0.25
                    ],
                    [
                        12,
                        0.5
                    ]
                ]
            },
            'line-opacity': 0.6
        },
        'filter': [
            'all',
            ['==', 'type', 'way'],
            ['==', 'changeType', 'modifiedOld']
        ]
    });

    map.addLayer({
        'id': 'modified-new-point-on-way',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#E8E845',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.25
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        1.25
                    ],
                    [
                        16,
                        2.25
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', '$type', 'LineString'],
            ['==', 'changeType', 'modifiedNew']
        ]
    });

    map.addLayer({
        'id': 'modified-new-line',
        'source': 'changeset',
        'type': 'line',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#E8E845',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1
                    ],
                    [
                        12,
                        2
                    ]
                ]
            },
            'line-opacity': 0.6
        },
        'filter': [
            'all',
            ['==', 'type', 'way'],
            ['==', 'changeType', 'modifiedNew']
        ]
    });

    map.addLayer({
        'id': 'added-line',
        'source': 'changeset',
        'type': 'line',
        'interactive': true,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#39DBC0',
            'line-width': {
                'base': 1,
                'stops': [
                    [
                        8,
                        1
                    ],
                    [
                        12,
                        1.5
                    ]
                ]
            },
            'line-opacity': 0.8
        },
        'filter': [
            'all',
            ['==', 'type', 'way'],
            ['==', 'changeType', 'added']
        ]
    });

    map.addLayer({
        'id': 'deleted-point-untagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#CC2C47',
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        2
                    ],
                    [
                        16,
                        3
                    ]
                ]
            },
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.5
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', 'changeType', 'deletedOld'],
            [
                'any',
                ['==', 'tagsCount', 0],
                ['==', '$type', 'LineString']
            ]
        ]
    });

    map.addLayer({
        'id': 'modified-old-point-untagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#DB950A',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.5
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        1.75
                    ],
                    [
                        16,
                        3
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#DB950A'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'modifiedOld'],
            ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'modified-new-point-untagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#E8E845',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.5
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.75
                    ],
                    [
                        16,
                        2
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#E8E845'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'modifiedNew'],
            ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'added-point-untagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#39DBC0',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.3
                    ],
                    [
                        14,
                        0.75
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        1.25
                    ],
                    [
                        16,
                        1.9
                    ]
                ]
            }
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'added'],
            ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'deleted-point-tagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#CC2C47',
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        4
                    ],
                    [
                        16,
                        14
                    ]
                ]
            },
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.5
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.75,
            'circle-stroke-color': '#CC2C47'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'deletedOld'],
            ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'modified-old-point-tagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#DB950A',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.75
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        2.5
                    ],
                    [
                        16,
                        9
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#DB950A'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'modifiedOld'],
            ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'modified-new-point-tagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#E8E845',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.25
                    ],
                    [
                        14,
                        0.75
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        2
                    ],
                    [
                        16,
                        7
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#E8E845'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'modifiedNew'],
            ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        'id': 'added-point-tagged',
        'source': 'changeset',
        'type': 'circle',
        'paint': {
            'circle-color': '#39DBC0',
            'circle-opacity': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        0.3
                    ],
                    [
                        14,
                        0.75
                    ]
                ]
            },
            'circle-radius': {
                'base': 1.5,
                'stops': [
                    [
                        10,
                        1
                    ],
                    [
                        16,
                        5
                    ]
                ]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#39DBC0'
        },
        'filter': [
            'all',
            ['==', 'type', 'node'],
            ['==', 'changeType', 'added'],
            ['!=', 'tagsCount', 0]
        ]
    });

    map.on('click', function(e) {
        var x1y1 = [e.point.x - 5, e.point.y - 5];
        var x2y2 = [e.point.x + 5, e.point.y + 5];
        var features = map.queryRenderedFeatures([x1y1, x2y2], {
            'layers': [
                'added-line',
                'added-point-tagged',
                'modified-old-line',
                'modified-old-point-tagged',
                'modified-old-point-untagged',
                'modified-new-line',
                'modified-new-point-tagged',
                'modified-new-point-untagged',
                'deleted-line',
                'deleted-point-tagged',
                'added-relation',
                'modified-old-relation',
                'modified-new-relation',
                'deleted-relation'
            ]
        });

        if (features.length) {
            selectFeature(map, features[0], result.featureMap);
        } else {
            clearFeature(map);
        }
    });
}

function errorMessage(message) {
    message = message || 'An unexpected error occured';
    document.querySelector('.cmap-info').innerHTML = message;
    document.querySelector('.cmap-sidebar').style.display = 'block';
    document.querySelector('.cmap-layer-selector').style.display = 'none';
    document.querySelector('.cmap-type-selector').style.display = 'none';
}

function displayDiff(id, featureMap) {
    var featuresWithId = featureMap[id];
    var metadataProps = featuresWithId.map(function(f) {
        var props = Object.assign({}, f.properties);
        delete props.tags;
        delete props.tagsCount;
        delete props.relations;
        delete props.action;
        return props;
    });
    var tagProps = featuresWithId.map(function(f) {
        var props = Object.assign({}, f.properties.tags);
        props.changeType = f.properties.changeType;
        return props;
    });

    var type = featuresWithId[0].properties.type;
    var metadataHeader = elt('a', { href: '//www.openstreetmap.org/' + type + '/' + id + '/history', target: '_blank' }, capitalize(type) + ': ' + id);
    var metadataHTML = getDiffHTML(propsDiff(metadataProps), ['id', 'type', 'changeType'], metadataHeader);
    var tagHeader = elt('span', {}, 'Tag details');
    var tagHTML = getDiffHTML(propsDiff(tagProps), ['id', 'changeType'], tagHeader);

    document.querySelector('.cmap-diff').style.display = 'block';

    document.querySelector('.cmap-diff-metadata').innerHTML = '';
    document.querySelector('.cmap-diff-metadata').appendChild(metadataHTML);
    document.querySelector('.cmap-diff-metadata').style.display = 'block';

    document.querySelector('.cmap-diff-tags').innerHTML = '';
    document.querySelector('.cmap-diff-tags').appendChild(tagHTML);
    document.querySelector('.cmap-diff-tags').style.display = 'block';
}

function clearDiff() {
    document.querySelector('.cmap-diff').style.display = 'none';

    document.querySelector('.cmap-diff-metadata').innerHTML = '';
    document.querySelector('.cmap-diff-metadata').style.display = 'none';

    document.querySelector('.cmap-diff-tags').innerHTML = '';
    document.querySelector('.cmap-diff-tags').style.display = 'none';
}

function getDiffHTML(diff, ignoreList, header) {
    var isAddedFeature = diff['changeType'].added === 'added';

    var root = elt('table', { class: 'cmap-diff-table' });
    if (isAddedFeature) {
        root.style.width = '300px';
    }

    if (header) {
        root.appendChild(
            elt('thead', {},
                elt('tr', {},
                    elt('td', { colspan: isAddedFeature ? '2' : '3', class: 'cmap-table-head'}, header)
                )
            )
        )
    }

    var tbody = elt('tbody');

    var types = ['added', 'deleted', 'modifiedOld', 'modifiedNew', 'unchanged'];
    var sortedProps = Object.keys(diff).sort(function(keyA, keyB) {
        var indexA = types.indexOf(Object.keys(diff[keyA])[0]);
        var indexB = types.indexOf(Object.keys(diff[keyB])[0]);
        return (indexA - indexB);
    });

    sortedProps.forEach(function(prop) {
        if (ignoreList.indexOf(prop) === -1) {
            var tr = elt('tr');

            var th = elt('th', { title: prop, class: 'cmap-strong' }, prop);
            tr.appendChild(th);

            types.forEach(function(type) {
                if (diff[prop].hasOwnProperty(type)) {
                    var propClass = 'diff-property cmap-scroll-styled props-diff-' + type;
                    if (type == 'added' && !isAddedFeature) {
                        var empty = elt('td', { class: propClass });
                        tr.appendChild(empty);
                    }

                    var td = elt('td', { class: propClass }, diff[prop][type]);
                    tr.appendChild(td);

                    if (type == 'deleted') {
                        var empty = elt('td', { class: propClass });
                        tr.appendChild(empty);
                    }

                    if (type == 'unchanged') {
                        tr.appendChild(td.cloneNode(true));
                    }
                }
            });

            tbody.appendChild(tr);
        }
    });

    root.appendChild(tbody);

    return root;
}

function highlightFeature(map, featureId) {
    map.setFilter('highlight-line', [
        '==', 'id', featureId
    ]);
    map.setFilter('highlight-point', [
        '==', 'id', featureId
    ]);
}

function clearHighlight(map) {
    map.setFilter('highlight-line', [
        '==', 'id', ''
    ]);
    map.setFilter('highlight-point', [
        '==', 'id', ''
    ]);
}

function selectFeature(map, feature, featureMap) {
    var featureId = feature.properties.id;
    var osmType = feature.properties.type;

    highlightFeature(map, featureId);
    displayDiff(featureId, featureMap);
    cmap.emit('featureChange', osmType, featureId);
}

function clearFeature(map) {
    clearHighlight(map);
    clearDiff();
    cmap.emit('featureChange', null, null);
}

function renderMap(baseLayer, result) {
    if (map) {
        map.remove();
    }

    var bounds = getBounds(result.changeset.bbox);

    map = new mapboxgl.Map({
        container: document.querySelector('.cmap-map'),
        style: baseLayer || 'mapbox://styles/rasagy/cizp6lsah00ct2snu6gi3p16q',
        center: bounds.getCenter(),
        zoom: 14,
        dragRotate: false,
        touchZoomRotate: false
    });

    map.on('load', function() {
        map.fitBounds(bounds, {'linear': true, padding: 200});
        addMapLayers(map, result, bounds);
        cmap.emit('load');
    });
}

function getBounds(bbox) {
    var left = +bbox.left,
        right = +bbox.right,
        top = +bbox.top,
        bottom = +bbox.bottom;

    return new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(left, bottom),
      new mapboxgl.LngLat(right, top)
  );
}

function getBoundingBox(bounds) {
    var left = bounds.getWest(),
        right = bounds.getEast(),
        top = bounds.getNorth(),
        bottom = bounds.getSouth();

    var padX = 0;
    var padY = 0;
    if (!(left === -180 && right === 180 && top === 90 && bottom === -90)) {
        padX = Math.max((right - left) / 5, 0.0001);
        padY = Math.max((top - bottom) / 5, 0.0001);
    }

    var bboxPolygon = turfBboxPolygon([
        left - padX,
        bottom - padY,
        right + padX,
        top + padY
    ]);

    return featureCollection([bboxPolygon]);
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


function filterLayers() {
    var layersKey = {
        'added-line': { 'added': true, 'ways': true },
        'added-point-tagged': { 'added': true, 'nodes': true },
        'added-point-untagged': { 'added': true, 'nodes': true },
        'added-relation': { 'added': true, 'relations': true },
        'modified-old-line': { 'modified': true, 'ways': true },
        'modified-old-point-tagged': { 'modified': true, 'nodes': true },
        'modified-old-point-untagged': { 'modified': true, 'nodes': true },
        'modified-old-point-on-way': { 'modified': true, 'nodes': true },
        'modified-new-line': { 'modified': true, 'ways': true },
        'modified-old-relation': { 'modified': true, 'relations': true },
        'modified-new-point-tagged': { 'modified': true, 'nodes': true },
        'modified-new-point-untagged': { 'modified': true, 'nodes': true },
        'modified-new-point-on-way': { 'modified': true, 'nodes': true },
        'modified-new-relation': { 'modified': true, 'relations': true },
        'deleted-line': { 'deleted': true, 'ways': true },
        'deleted-point-tagged': { 'deleted': true, 'nodes': true },
        'deleted-point-untagged': { 'deleted': true, 'nodes': true },
        'deleted-relation': { 'deleted': true, 'relations': true }
    };

  var selectedActions = [];
  var selectedTypes = [];

  document.querySelectorAll('.cmap-layer-selector input:checked')
  .forEach(function(checkedElement) {
      selectedActions.push(checkedElement.value);
  });

  document.querySelectorAll('.cmap-type-selector input:checked')
  .forEach(function(checkedElement) {
      selectedTypes.push(checkedElement.value);
  });

  var layers = Object.keys(layersKey);
  layers.forEach(function(layer) {
     var isSelectedAction = selectedActions.reduce(function(accum, action) { return layersKey[layer][action] || accum }, false);
     var isSelectedType = selectedTypes.reduce(function(accum, type) { return layersKey[layer][type] || accum }, false);

     if (isSelectedAction && isSelectedType) {
         map.setLayoutProperty(layer, 'visibility', 'visible');
     } else {
         map.setLayoutProperty(layer, 'visibility', 'none');
     }

     if (selectedActions.length === 0 || selectedTypes.length === 0) {
         map.setLayoutProperty('bg-point', 'visibility', 'none');
         map.setLayoutProperty('bg-line', 'visibility', 'none');
     } else {
         map.setLayoutProperty('bg-point', 'visibility', 'visible');
         map.setLayoutProperty('bg-line', 'visibility', 'visible');
     }
  });
}

window.changesetMap = module.exports = render;
