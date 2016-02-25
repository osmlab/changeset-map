
function getChanges(geojson, changeset) {
    var changeObj = {
        'added': getEmptyFeatureCollection(),
        'modifiedOld': getEmptyFeatureCollection(),
        'modifiedNew': getEmptyFeatureCollection(),
        'deleted': getEmptyFeatureCollection()
    };
    
    var features = geojson.features;

    features.forEach(function(feature) {
        var type = getChangeType(feature, features, changeset);
        changeObj[type].features.push(feature);
    });

    return changeObj;
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
        if (props.uid === parseInt(changeset.uid)) {
            return 'added';
        } else {
            return 'deleted';
        }
    }
    return 'deleted'; //this is possibly wrong.
}

function hasNextVersion(version, feature, features) {
    for (var i = 0; i < features.length; i++) {
        var f = features[i].properties;
        if (f.id === feature.properties.id && f.version === (version + 1)) {
            return f;
        }
    }
    return false;
}

function hasPreviousVersion(version, feature, features) {
    if (version === 1) {
        return false;
    }
    for (var i = 0; i < features.length; i++) {
        var f = features[i].properties;
        if (f.id === feature.properties.id && f.version === (version - 1)) {
            return f;
        }
    }
    return false;
}

function getEmptyFeatureCollection() {
    return {
        'type': 'FeatureCollection',
        'features': []
    };
}

module.exports = getChanges;