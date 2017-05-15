import mapboxgl from 'mapbox-gl';

import { getBoundingBox, getBounds } from './helpers';
import { cmap } from './render';
import { propsDiff } from './propsDiff';

let map;

export function unset() {
    console.debug('unsetting map');
    map.remove();
    map = undefined;
}

export function getMapInstance() {
    return map;
}

export function filterLayers() {
    var layersKey = {
        'added-line': { added: true, ways: true },
        'added-point-tagged': { added: true, nodes: true },
        'added-point-untagged': { added: true, nodes: true },
        'added-relation': { added: true, relations: true },
        'modified-old-line': { modified: true, ways: true },
        'modified-old-point-tagged': { modified: true, nodes: true },
        'modified-old-point-untagged': { modified: true, nodes: true },
        'modified-old-point-on-way': { modified: true, nodes: true },
        'modified-new-line': { modified: true, ways: true },
        'modified-old-relation': { modified: true, relations: true },
        'modified-new-point-tagged': { modified: true, nodes: true },
        'modified-new-point-untagged': { modified: true, nodes: true },
        'modified-new-point-on-way': { modified: true, nodes: true },
        'modified-new-relation': { modified: true, relations: true },
        'deleted-line': { deleted: true, ways: true },
        'deleted-point-tagged': { deleted: true, nodes: true },
        'deleted-point-untagged': { deleted: true, nodes: true },
        'deleted-relation': { deleted: true, relations: true }
    };

    var selectedActions = [];
    var selectedTypes = [];

    document
    .querySelectorAll('.cmap-filter-action-section input:checked')
    .forEach(function(checkedElement) {
        selectedActions.push(checkedElement.value);
    });

    document
    .querySelectorAll('.cmap-filter-type-section input:checked')
    .forEach(function(checkedElement) {
        selectedTypes.push(checkedElement.value);
    });

    var layers = Object.keys(layersKey);
    layers.forEach(function(layer) {
        var isSelectedAction = selectedActions.reduce(function(accum, action) {
            return layersKey[layer][action] || accum;
        }, false);
        var isSelectedType = selectedTypes.reduce(function(accum, type) {
            return layersKey[layer][type] || accum;
        }, false);

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

function addMapSource(result, bounds) {
    if (map.getSource('changeset')) {
        map.getSource('changeset').setData(result.geojson);
    } else {
        map.addSource('changeset', {
            type: 'geojson',
            data: result.geojson
        });
    }

    if (map.getSource('bbox')) {
        map.getSource('bbox').setData(getBoundingBox(bounds));
    } else {
        map.addSource('bbox', {
            type: 'geojson',
            data: getBoundingBox(bounds)
        });
    }
}

function addMapLayers() {
    map.addLayer({
        id: 'bbox-line',
        type: 'line',
        source: 'bbox',
        paint: {
            'line-color': '#A58CF2',
            'line-opacity': 0.75,
            'line-width': 2
        }
    });

    map.addLayer({
        id: 'bg-line',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': 'hsl(0, 0%, 15%)',
            'line-width': 12,
            'line-blur': 0.2,
            'line-opacity': {
                base: 1.5,
                stops: [[12, 0.5], [18, 0.2]]
            }
        },
        filter: ['all', ['==', 'type', 'way']]
    });

    map.addLayer({
        id: 'bg-point',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': 'hsl(0, 0%, 15%)',
            'circle-blur': 0.2,
            'circle-opacity': {
                base: 1.5,
                stops: [[12, 0.5], [18, 0.2]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 12], [16, 10]]
            }
        },
        filter: ['all', ['==', '$type', 'Point']]
    });

    map.addLayer({
        id: 'highlight-line',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': 'hsl(0, 0%, 75%)',
            'line-width': {
                base: 1,
                stops: [[10, 15], [16, 10]]
            },
            'line-opacity': {
                base: 1.5,
                stops: [[12, 0.75], [18, 0.75]]
            }
        },
        filter: ['all', ['==', 'id', ''], ['==', '$type', 'LineString']]
    });

    map.addLayer({
        id: 'highlight-point',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': 'hsl(0, 0%, 75%)',
            'circle-radius': {
                base: 1,
                stops: [[10, 10], [16, 11]]
            },
            'circle-opacity': 0.8
        },
        filter: ['all', ['==', 'id', ''], ['==', '$type', 'Point']]
    });

  // Relations

    map.addLayer({
        id: 'deleted-relation',
        source: 'changeset',
        type: 'line',
        paint: {
            'line-color': '#CC2C47',
            'line-width': {
                base: 1,
                stops: [[8, 1.5], [12, 1.5]]
            },
            'line-dasharray': [0.1, 0.1],
            'line-opacity': 0.8
        },
        filter: [
            'all',
      ['==', 'type', 'relation'],
      ['==', 'changeType', 'deletedNew']
        ]
    });

    map.addLayer({
        id: 'modified-old-relation',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#DB950A',
            'line-width': {
                base: 1,
                stops: [[8, 1.75], [12, 1.75]]
            },
            'line-blur': 0.25,
            'line-opacity': 0.8
        },
        filter: [
            'all',
      ['==', 'type', 'relation'],
      ['==', 'changeType', 'modifiedOld']
        ]
    });

    map.addLayer({
        id: 'modified-new-relation',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#E8E845',
            'line-width': {
                base: 1,
                stops: [[8, 1.25], [12, 1.25]]
            },
            'line-opacity': 0.8
        },
        filter: [
            'all',
      ['==', 'type', 'relation'],
      ['==', 'changeType', 'modifiedNew']
        ]
    });

    map.addLayer({
        id: 'added-relation',
        source: 'changeset',
        type: 'line',
        interactive: true,
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#39DBC0',
            'line-width': {
                base: 1,
                stops: [[8, 1], [12, 1]]
            },
            'line-opacity': 0.8
        },
        filter: ['all', ['==', 'type', 'relation'], ['==', 'changeType', 'added']]
    });

    map.addLayer({
        id: 'deleted-line',
        source: 'changeset',
        type: 'line',
        paint: {
            'line-color': '#CC2C47',
            'line-width': {
                base: 1,
                stops: [[8, 3], [12, 5]]
            },
            'line-dasharray': [0.1, 0.25],
            'line-opacity': 0.8
        },
        filter: ['all', ['==', 'type', 'way'], ['==', 'changeType', 'deletedNew']]
    });

    map.addLayer({
        id: 'modified-old-point-on-way',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#DB950A',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.5]]
            },
            'circle-blur': 0.25,
            'circle-radius': {
                base: 1.5,
                stops: [[10, 2.5], [16, 3.5]]
            }
        },
        filter: [
            'all',
      ['==', '$type', 'LineString'],
      ['==', 'changeType', 'modifiedOld']
        ]
    });

    map.addLayer({
        id: 'modified-old-line',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#DB950A',
            'line-width': {
                base: 1,
                stops: [[8, 3], [12, 6]]
            },
            'line-blur': {
                base: 1,
                stops: [[8, 0.25], [12, 0.5]]
            },
            'line-opacity': 0.6
        },
        filter: ['all', ['==', 'type', 'way'], ['==', 'changeType', 'modifiedOld']]
    });

    map.addLayer({
        id: 'modified-new-point-on-way',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#E8E845',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.25]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 1.25], [16, 2.25]]
            }
        },
        filter: [
            'all',
      ['==', '$type', 'LineString'],
      ['==', 'changeType', 'modifiedNew']
        ]
    });

    map.addLayer({
        id: 'modified-new-line',
        source: 'changeset',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#E8E845',
            'line-width': {
                base: 1,
                stops: [[8, 1], [12, 2]]
            },
            'line-opacity': 0.6
        },
        filter: ['all', ['==', 'type', 'way'], ['==', 'changeType', 'modifiedNew']]
    });

    map.addLayer({
        id: 'added-line',
        source: 'changeset',
        type: 'line',
        interactive: true,
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#39DBC0',
            'line-width': {
                base: 1,
                stops: [[8, 1], [12, 1.5]]
            },
            'line-opacity': 0.8
        },
        filter: ['all', ['==', 'type', 'way'], ['==', 'changeType', 'added']]
    });

    map.addLayer({
        id: 'deleted-point-untagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#CC2C47',
            'circle-radius': {
                base: 1.5,
                stops: [[10, 2], [16, 3]]
            },
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.5]]
            }
        },
        filter: [
            'all',
      ['==', 'changeType', 'deletedOld'],
      ['any', ['==', 'tagsCount', 0], ['==', '$type', 'LineString']]
        ]
    });

    map.addLayer({
        id: 'modified-old-point-untagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#DB950A',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.5]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 1.75], [16, 3]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#DB950A'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'modifiedOld'],
      ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'modified-new-point-untagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#E8E845',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.5]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 0.75], [16, 2]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#E8E845'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'modifiedNew'],
      ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'added-point-untagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#39DBC0',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.3], [14, 0.75]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 1.25], [16, 1.9]]
            }
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'added'],
      ['==', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'deleted-point-tagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#CC2C47',
            'circle-radius': {
                base: 1.5,
                stops: [[10, 4], [16, 7]]
            },
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.5]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.75,
            'circle-stroke-color': '#CC2C47'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'deletedOld'],
      ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'modified-old-point-tagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#DB950A',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.75]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 2.5], [16, 9]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#DB950A'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'modifiedOld'],
      ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'modified-new-point-tagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#E8E845',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.25], [14, 0.75]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 2], [16, 7]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#E8E845'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'modifiedNew'],
      ['!=', 'tagsCount', 0]
        ]
    });

    map.addLayer({
        id: 'added-point-tagged',
        source: 'changeset',
        type: 'circle',
        paint: {
            'circle-color': '#39DBC0',
            'circle-opacity': {
                base: 1.5,
                stops: [[10, 0.3], [14, 0.75]]
            },
            'circle-radius': {
                base: 1.5,
                stops: [[10, 1], [16, 5]]
            },
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
            'circle-stroke-color': '#39DBC0'
        },
        filter: [
            'all',
      ['==', 'type', 'node'],
      ['==', 'changeType', 'added'],
      ['!=', 'tagsCount', 0]
        ]
    });
}

export function renderMap(baseLayer, result) {
    var bounds = getBounds(result.changeset.bbox);
    console.log('here bab');
    if (map) {
    // map.remove();
        addMapSource(result, bounds);
        console.log(map);
        map.fitBounds(bounds, { linear: true, padding: 200 });
        return;
    }

    map = new mapboxgl.Map({
        container: document.querySelector('.cmap-map'),
        style: baseLayer || 'mapbox://styles/rasagy/cizp6lsah00ct2snu6gi3p16q',
        center: bounds.getCenter(),
        zoom: 14,
        dragRotate: false,
        touchZoomRotate: false
    });

    map.on('load', function() {
        map.fitBounds(bounds, { linear: true, padding: 200 });
        addMapSource(result, bounds);
        addMapLayers();
        cmap.emit('load');
    });

    map.on('click', function(e) {
        var x1y1 = [e.point.x - 5, e.point.y - 5];
        var x2y2 = [e.point.x + 5, e.point.y + 5];
        var features = map.queryRenderedFeatures([x1y1, x2y2], {
            layers: [
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
            selectFeature(features[0], result.featureMap);
        } else {
            clearFeature();
        }
    });
}

export function selectFeature(feature, featureMap) {
    var featureId = feature.properties.id;
    var osmType = feature.properties.type;

    highlightFeature(featureId);
    displayDiff(featureId, featureMap);
    cmap.emit('featureChange', osmType, featureId);
}

function highlightFeature(featureId) {
    map.setFilter('highlight-line', ['==', 'id', featureId]);
    map.setFilter('highlight-point', ['==', 'id', featureId]);
}

function clearHighlight() {
    map.setFilter('highlight-line', ['==', 'id', '']);
    map.setFilter('highlight-point', ['==', 'id', '']);
}

export function clearFeature() {
    clearHighlight();
    clearDiff();
    cmap.emit('featureChange', null, null);
}

//Calculates the difference in the selected features

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

  // Sets headers for two tables

    var type = featuresWithId[0].properties.type;
    var metadataHeader = elt(
    'div',
    {},
    elt('span', { class: 'cmap-inline-block' }, type.toUpperCase() + ': ' + id),
    elt(
      'ul',
      { class: 'cmap-hlist cmap-inline-block cmap-fr' },
      elt(
        'li',
        {},
        elt(
          'a',
            {
                target: '_blank',
                class: 'cmap-hlist-item cmap-pointer cmap-noselect',
                href: '//www.openstreetmap.org/' + type + '/' + id + '/history'
            },
          'OSM'
        )
      ),
      elt(
        'li',
        {},
        elt(
          'a',
            {
                target: '_blank',
                class: 'cmap-hlist-item cmap-pointer cmap-noselect',
                href: '//osmlab.github.io/osm-deep-history/#/' + type + '/' + id
            },
          'Deep History'
        )
      )
    )
  );
    var metadataHTML = getDiffHTML(
    propsDiff(metadataProps),
    ['id', 'type', 'changeType'],
    metadataHeader
  );
    var tagHeader = elt(
    'span',
    { class: 'cmap-inline-block' },
    'Tag details'.toUpperCase()
  );
    var tagHTML = getDiffHTML(
    propsDiff(tagProps),
    ['id', 'changeType'],
    tagHeader
  );

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

//Renders the markup for a table
function getDiffHTML(diff, ignoreList, header) {
    var isAddedFeature = diff['changeType'].added === 'added';

    var root = elt('table', { class: 'cmap-diff-table' });
    if (isAddedFeature) {
        root.style.width = '300px';
    }

    if (header) {
        root.appendChild(
      elt(
        'thead',
        {},
        elt(
          'tr',
          {},
          elt(
            'td',
              {
                  colspan: isAddedFeature ? '2' : '3',
                  class: 'cmap-table-head'
              },
            header
          )
        )
      )
    );
    }

    var tbody = elt('tbody');

    var types = ['added', 'deleted', 'modifiedOld', 'modifiedNew', 'unchanged'];
    var sortedProps = Object.keys(diff).sort(function(keyA, keyB) {
        var indexA = types.indexOf(Object.keys(diff[keyA])[0]);
        var indexB = types.indexOf(Object.keys(diff[keyB])[0]);
        return indexA - indexB;
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

// Recursively adds html elements
function elt(name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
        for (var attr in attributes)
            if (attributes.hasOwnProperty(attr))
                node.setAttribute(attr, attributes[attr]);
    }
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (typeof child == 'string') child = document.createTextNode(child);
        node.appendChild(child);
    }
    return node;
}
