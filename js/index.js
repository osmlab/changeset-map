var render = require('./render');
var changesetMap;

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    var id = location.hash.split('/')[0].replace('#', '');
    var [, geometryType, featureId] = location.hash.split('/');
    changesetMap = render(id, {});
    console.log(changesetMap);
    changesetMap.on('load', function () {
        changesetMap.emit('selectFeature', geometryType, featureId);
        // changesetMap.emit('clearFeature');
    });
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    changesetMap = render(changesetID, {hash: location.hash});
});

changesetMap.on('hashchange', function (geometryType, featureId) {
    clearHash();
    if (geometryType && featureId) {
        updateHash(geometryType, featureId);
    }
});

function updateHash(osmType, featureId) {
  clearHash();

  location.hash += '/' + osmType;
  location.hash += '/' + featureId;
}

function clearHash() {
  var changesetId = location.hash
    .split('/')[0]
    .replace('#', '');

  location.hash = changesetId;
}