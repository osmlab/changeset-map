'use strict';

var xhr = require('xhr');
var osm = require('./osm');
var adiffParser = require('osm-adiff-parser-saxjs');
var jsonParser = require('real-changesets-parser');

var S3_URL = '//s3.amazonaws.com/mapbox/real-changesets/production/';

var getChangeset = function(changesetID, overpassBase, callback) {
    osm.query(changesetID, function(err, changeset) {
        if (err) {
            return callback({
                'msg': 'OSM Query failed. Are you sure you entered a valid changeset id?',
                'error': err
            }, null);
        }
        // Try real-changesets S3 bucket
        var url = S3_URL + changesetID + '.json';
        xhr.get(url, function(err, response) {
            if (err || response.statusCode === 403) {
              // Fallback to overpass
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
                    adiffParser(response.body, null, function(err, json) {
                        if (err) {
                            return callback({
                                'msg': 'Failed to parser adiff xml.',
                                'error': err
                            }, null);
                        }
                        var geojson = jsonParser({elements: json[changesetID]});
                        var featureMap = getFeatureMap(geojson);

                        var ret = {
                            'geojson': geojson,
                            'featureMap': featureMap,
                            'changeset': changeset
                        };
                        return callback(null, ret);
                    });
                });
            } else {
                var geojson = jsonParser(JSON.parse(response.body));
                var featureMap = getFeatureMap(geojson);

                var ret = {
                    'geojson': geojson,
                    'featureMap': featureMap,
                    'changeset': changeset
                };
                return callback(null, ret);
            }
        });
    });
};

function getDataParam(c) {
    return '[out:xml][adiff:%22' + c.from.toString()  + ',%22,%22' + c.to.toString() + '%22];(node(bbox)(changed);way(bbox)(changed););out%20meta%20geom(bbox);';
}

function getBboxParam(bbox) {
    return [bbox.left, bbox.bottom, bbox.right, bbox.top].join(',');
}

function getFeatureMap(geojson) {
    var features = geojson.features;
    var featureMap = {};

    for (var i = 0, len = features.length; i < len; i++) {
        var id = features[i].properties.id;
        featureMap[id] = featureMap[id] || [];
        featureMap[id].push(features[i]);
    }

    return featureMap;
}

module.exports = getChangeset;
