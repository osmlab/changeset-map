var render = require('./render');

var hash = location.hash.replace('#', '');
if (hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    render(hash, {});
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    render(changesetID, {});
});