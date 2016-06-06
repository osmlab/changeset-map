var render = require('./render');

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    render(location.hash, {});
}

document.getElementById('changesetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = '/' + changesetID;
    render(changesetID, {});
});
