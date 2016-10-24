var render = require('./render');
var changesetMap;

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    var id = location.hash.split('/')[0].replace('#', '');
    var [, geometryType, featureId] = location.hash.split('/');
    changesetMap = render(document.getElementById('container'), id, {width: window.innerWidth + 'px', height: window.innerHeight + 'px'});
    changesetMap.on('load', function () {
        changesetMap.emit('selectFeature', geometryType, featureId);
    });
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    changesetMap = render(document.getElementById('container'), changesetID, {hash: location.hash});
});

changesetMap.on('featureChange', function (geometryType, featureId) {
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
