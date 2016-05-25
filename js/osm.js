var xhr = require('xhr');
var moment = require('moment');
var config = require('./config');

var query = function(changesetID, callback) {
    var url = config.osmBase + 'changeset/' + changesetID;
    var xhrOptions = {
        'responseType': 'document'
    };
    xhr.get(url, xhrOptions, function(err, response) {
        if (err) {
            return callback(err, null);
        }
        var xml = response.body;
        var csFeature = xml.getElementsByTagName('changeset')[0];
        var cs = csFeature.attributes;
        var uid = cs.uid.textContent;
        var user = cs.user.textContent;
        var from = moment(cs.created_at.textContent, 'YYYY-MM-DDTHH:mm:ss\\Z').subtract('seconds', 1).format('YYYY-MM-DDTHH:mm:ss\\Z');
        var to = cs.closed_at.textContent;
        var left = cs.min_lon.textContent;
        var bottom = cs.min_lat.textContent;
        var right = cs.max_lon.textContent;
        var top = cs.max_lat.textContent;
        var changeset = {
            'id': changesetID,
            'uid': uid,
            'user': user,
            'from': from,
            'to': to,
            'bbox': {
                'left': left,
                'bottom': bottom,
                'right': right,
                'top': top
            }
        };
        callback(null, changeset);
    });
};

module.exports = {
    'query': query
};