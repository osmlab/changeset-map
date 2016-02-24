var overpass = require('./overpass');

function render(id, options) {
    var overpassData = overpass.query(id, function(err, geojson) {
        console.log(JSON.stringify(geojson));
    });
}

module.exports = render;