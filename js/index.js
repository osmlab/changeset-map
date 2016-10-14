var render = require('./render');
var changesetMap;

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    var id = location.hash.split('/')[0].replace('#', '');
    changesetMap = render(id, {hash: location.hash});
    changesetMap.emit('selectFeature');
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    changesetMap = render(changesetID, {hash: location.hash});
    // node/4445490608
    console.log(changesetMap);
    changesetMap.emit('selectFeature', 'node', 4445490608);
});
