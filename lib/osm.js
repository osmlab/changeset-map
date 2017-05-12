import xhr from 'xhr';
import moment from 'moment';
import config from './config';

export function query(changesetID, callback) {
    var url = config.osmBase + 'changeset/' + changesetID;
    var xhrOptions = {
        responseType: 'document'
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
        var from = moment(cs.created_at.textContent, 'YYYY-MM-DDTHH:mm:ss\\Z')
            .subtract('seconds', 1)
            .format('YYYY-MM-DDTHH:mm:ss\\Z');
        var to = cs.closed_at ? cs.closed_at.textContent : null;
        var left = cs.min_lon ? cs.min_lon.textContent : -180;
        var bottom = cs.min_lat ? cs.min_lat.textContent : -90;
        var right = cs.max_lon ? cs.max_lon.textContent : 180;
        var top = cs.max_lat ? cs.max_lat.textContent : 90;
        var changeset = {
            id: changesetID,
            uid: uid,
            user: user,
            from: from,
            to: to,
            bbox: {
                left: left,
                bottom: bottom,
                right: right,
                top: top
            }
        };
        return callback(null, changeset);
    });
}
