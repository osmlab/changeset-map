var render = require('./render');
var changesetMap;

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    var id = location.hash.split('/')[0].replace('#', '');
    changesetMap = render(id, {});
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    changesetMap = render(changesetID, {});
});
