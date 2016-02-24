
function overpassToGeoJSON(overpassElements) {
    var features = [];
    overpassElements.forEach(function(el) {
        var geojson;
        if (el.type === 'node') {
            geojson = getNodeGeoJSON(el);
        } else {
            geojson = getWayGeoJSON(el);
        }
        features.push(geojson);
    });
    return {
        'type': 'FeatureCollection',
        'features': features
    };
}


function getProps(obj) {
    var props = obj.tags || {};
    props.changeset = obj.changeset;
    props.timestamp = obj.timestamp;
    props.version = obj.version;
    props.uid = obj.uid;
    props.user = obj.user;
    props.id = obj.id;
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
    return geom.map(function(pt) {
        return [pt.lon, pt.lat];
    });
}

// get geojson for a "way" - either line or polygon
function getWayGeoJSON(way) {
    var props = getProps(way);
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