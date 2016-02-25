var render = require('./render');

document.getElementById('submitChangeset').addEventListener('click', function(e) {
    console.log('click fired');
    document.getElementById('formContainer').style.display = 'none';
    var changesetID = document.getElementById('changesetInput').value;
    render(changesetID, {});
});