var xhr = require('xhr');
var osm = require('./osm');
var adiffParser = require('osm-adiff-parser-saxjs');
var jsonParser = require('real-changesets-parser');
var geojsonChanges = require('./geojsonChanges');

var query = function(changesetID, overpassBase, callback) {
    osm.query(changesetID, function(err, changeset) {
        if (err) {
            callback({
                'msg': 'OSM Query failed. Are you sure you entered a valid changeset id?',
                'error': err
            }, null);
        }
        var data = getDataParam(changeset);
        var bbox = getBboxParam(changeset.bbox);
        var url = overpassBase + '?data=' + data + '&bbox=' + bbox;
        var xhrOptions = {
            'responseType': 'application/osm3s+xml'
        };
        xhr.get(url, xhrOptions, function(err, response) {
            if (err) {
                return callback({
                    'msg': 'Overpass query failed.',
                    'error': err
                }, null);
            }
            adiffParser(response.body, [changesetID], function(err, json) {
                if (err) {
                    return callback({
                        'msg': 'Failed to parser adiff xml.',
                        'error': err
                    }, null);
                }
                var geojson = jsonParser({ elements: json[changesetID] });
                var changes = geojsonChanges(geojson, changeset);

                var ret = {
                    'geojson': changes.geojson,
                    'featureMap': changes.featureMap,
                    'changeset': changeset
                };
                return callback(null, ret);
            });
        });
    });
};

function getDataParam(c) {
    return '[out:xml][adiff:%22' + c.from.toString()  + ',%22,%22' + c.to.toString() + '%22];(node(bbox)(changed);way(bbox)(changed););out%20meta%20geom(bbox);';
}

function getBboxParam(bbox) {
    return [bbox.left, bbox.bottom, bbox.right, bbox.top].join(',');
}

module.exports = {
    'query': query
};
