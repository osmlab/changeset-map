var render = require('./render');

var hash = location.hash.replace('#', '');
if (hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    render(hash, {});
}

document.getElementById('submitChangeset').addEventListener('click', function(e) {
    console.log('click fired');
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    location.hash = changesetID;
    render(changesetID, {});
});