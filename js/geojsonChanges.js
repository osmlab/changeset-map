
function getChanges(geojson, changeset) {
    var changeObj = {
        'added': getEmptyFeatureCollection(),
        'modifiedOld': getEmptyFeatureCollection(),
        'modifiedNew': getEmptyFeatureCollection(),
        'deleted': getEmptyFeatureCollection()
    };
    
    var features = geojson.features;
    //WIP!
    features.forEach(function(feature) {
        var type = getChangeType(feature, features, changeset);
        changeObj[type].features.push(feature);
    });
    //WIP!
    return geojson;
}

function getChangeType(feature, features, changeset) {
    var props = feature.properties;
    var version = props.version;
    if (version === 1) {
        if (props.uid === parseInt(changeset.uid)) {
            return 'added';
        } else {
            return 'deleted';
        }
    }


}

function getEmptyFeatureCollection() {
    return {
        'type': 'FeatureCollection',
        'features': []
    }
}

module.exports = getChanges;