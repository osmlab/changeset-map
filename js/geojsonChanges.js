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
    var version = parseInt(props.version);
    var hasNext = hasNextVersion(version, feature, features);
    if (hasNext) {
        return 'modifiedOld';
    }
    var hasPrev = hasPreviousVersion(version, feature, features);
    if (hasPrev) {
        return 'modifiedNew';
    }
    if (version === 1) {
        if (props.uid === parseInt(changeset.uid) && props.changeset === parseInt(changeset.id)) {
            return 'added';
        } else {
            return 'deleted';
        }
    }
    return 'deleted'; //this is possibly wrong.
}

function hasNextVersion(version, feature, features) {
    var id = feature.properties.id;
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        if (f.properties.version === (version +1)) {
            return f;
        }
    }
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        for (var nodeId in f.properties._nodeVersions) {
          var currentVersion = feature.properties._nodeVersions[nodeId];
          if (currentVersion < f.properties._nodeVersions[nodeId]) {
            return f;
          }
        }
    }
    return false;
}

function hasPreviousVersion(version, feature, features) {
    var id = feature.properties.id;
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        if (f.properties.version === (version - 1)) {
            return f;
        }
    }
    for (var i = 0; i < features[id].length; i++) {
        var f = features[id][i];
        for (var nodeId in f.properties._nodeVersions) {
          var currentVersion = feature.properties._nodeVersions[nodeId];
          if (currentVersion > f.properties._nodeVersions[nodeId]) {
            return f;
          }
        }
    }
    return false;
}

module.exports = getChanges;
