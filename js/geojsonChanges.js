var moment = require('moment');

function getChanges(geojson, changeset) {
    var features = geojson.features;
    var featureMap = {};
    var changeGeoJSON = {
        'type': 'FeatureCollection',
        'features': []
    };
    for (var i = 0, len = features.length; i < len; i++) {
        var id = features[i].properties.id;
        featureMap[id] = featureMap[id] || [];
        featureMap[id].push(features[i]);
    }

    for (var osmID in featureMap) {
        for (var j = 0; j < featureMap[osmID].length; j++) {
            var f = featureMap[osmID][j];
            var type = getChangeType(f, featureMap, changeset);
            f.properties.changeType = type;
            changeGeoJSON.features.push(f);
        }
    }

    return {
        'featureMap': featureMap,
        'geojson': changeGeoJSON
    };
}

function getChangeType(feature, features, changeset) {
    var props = feature.properties;
    var version = parseInt(feature.properties.version);
    switch(props.action) {
        case 'create':
            return 'added';
        case 'delete':
            return 'deleted';
        case 'modify':
            if (hasPreviousVersion(version, feature, features))
                return 'modifiedOld';
            if (hasNextVersion(version, feature, features))
                return 'modifiedNew';
    }
}

function hasNextVersion(version, feature, features) {
    var id = feature.properties.id;
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        if (parseInt(f.properties.version) === (version + 1)) {
            return f;
        }
    }
    return false;
}

function hasPreviousVersion(version, feature, features) {
    var id = feature.properties.id;
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        if (parseInt(f.properties.version) === (version - 1)) {
            return f;
        }
    }
    return false;
}

module.exports = getChanges;
