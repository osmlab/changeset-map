'use strict';

function overpassToGeoJSON(overpassElements) {
    var NODES = getNodesById(overpassElements);

    var features = [];
    overpassElements.forEach(function (el) {
        var geojson;
        if (el.type === 'node') {
            geojson = getNodeGeoJSON(el);
        } else {
            geojson = getWayGeoJSON(el, NODES);
        }
        features.push(geojson);
    });
    return {
        'type': 'FeatureCollection',
        'features': features
    };
}

function getNodesById(overpassElements) {
    return overpassElements
      .filter(function (elt) { return elt.type === 'node'; })
      .reduce(function (nodes, node) {
          nodes[node.id] = nodes[node.id] || [];
          nodes[node.id].push({
              lat: node.lat,
              lon: node.lon,
              version: node.version
          });
          return nodes;
      }, {});
}

function getProps(obj) {
    var props = obj.tags || {};
    props.changeset = obj.changeset;
    props.timestamp = obj.timestamp;
    props.version = obj.version;
    props.uid = obj.uid;
    props.user = obj.user;
    props.id = obj.id;
    props.type = obj.type;
    return props;
}

// get geojson for a point type
function getNodeGeoJSON(node) {
    var props = getProps(node);
    return {
        'type': 'Feature',
        'properties': props,
        'geometry': {
            'type': 'Point',
            'coordinates': [node.lon, node.lat]
        }
    };
}

function getCoords(geom) {
    return geom.map(function (pt) {
        if (pt && pt.lon && pt.lat) {
            return [pt.lon, pt.lat];
        } else {
            return null;
        }
    }).filter(function (pt) {
        return !!pt;
    });
}

// get geojson for a "way" - either line or polygon
function getWayGeoJSON(way, NODES) {
    var props = getProps(way);

    // for some reason, Overpass sometime returns nodes in a geometry as null
    // since I don't know what else to do with them, let's just filter them out
    // along with their corresponding nodes
    for (var i = 0; i < way.geometry.length; i++) {
        if (way.geometry[i] === null) {
            way.geometry.splice(i, 1);
            way.nodes.splice(i, 1);
            i--;
        }
    }

    var nodeVersions = {};
    for (var i = 0; i < way.nodes.length; i++) {
        var id = way.nodes[i];
        var geometry = way.geometry[i];
        if (NODES[id]) {
            var node = NODES[id].filter(function (node) {
                return node.lat === geometry.lat &&
                       node.lon === geometry.lon;
            })[0];
            nodeVersions[id] = node.version;
        }
    }
    // add as a non-enumerable property, so that it doesn't
    // get picked up when generating the props table
    Object.defineProperty(props, '_nodeVersions', {
        enumerable: false,
        value: nodeVersions
    });

    var firstNode = way.geometry[0];
    var lastNode = way.geometry[way.geometry.length - 1];
    var geomType;
    if (firstNode.lat === lastNode.lat && firstNode.lon === lastNode.lon) {
        geomType = 'Polygon';
    } else {
        geomType = 'LineString';
    }
    var coords = getCoords(way.geometry);
    if (geomType === 'Polygon') {
        coords = [coords];
    }
    return {
        'type': 'Feature',
        'properties': props,
        'geometry': {
            'type': geomType,
            'coordinates': coords
        }
    };
}

module.exports = overpassToGeoJSON;
