import moment from 'moment';
import { config } from './config';
import React from 'react';
export function query(changesetID) {
    var url = config.osmBase + 'changeset/' + changesetID;
    var options = {
        'Response-Type': 'document'
    };
    return fetch(url, options)
    .then(r => r.text())
    .then(r => {
        const parser = new DOMParser();
        let xml;
        try {
            xml = parser.parseFromString(r, 'text/xml');
        } catch (e) {
            throw e;
        }
        var csFeature = xml.getElementsByTagName('changeset')[0];
        var cs = csFeature.attributes;
        var uid = cs.uid.textContent;
        var user = cs.user.textContent;
        var from = moment(cs.created_at.textContent, 'YYYY-MM-DDTHH:mm:ss\\Z')
        .subtract(1, 'seconds')
        .format('YYYY-MM-DDTHH:mm:ss\\Z');
        var to = cs.closed_at ? cs.closed_at.textContent : null;
        var left = cs.min_lon ? cs.min_lon.textContent : -180;
        var bottom = cs.min_lat ? cs.min_lat.textContent : -90;
        var right = cs.max_lon ? cs.max_lon.textContent : 180;
        var top = cs.max_lat ? cs.max_lat.textContent : 90;
        return {
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
    });
}

var x = (
  <section className="cmap-filter-type-section">
    <h6 className="cmap-heading">Filter by type</h6>
    <ul className="cmap-hlist">
      <li>
        <label className="cmap-hlist-item cmap-noselect cmap-pointer">
          <className
            type="checkbox"
            value="nodes"
            checked="true"
            id="cmap-type-selector-nodes"
          />
          <span className="cmap-label-text">Nodes</span>
        </label>
      </li>
      <li>
        <label className="cmap-hlist-item cmap-noselect cmap-pointer">
          <className
            type="checkbox"
            value="ways"
            checked="true"
            id="cmap-type-selector-ways"
          />
          <span className="cmap-label-text">Ways</span>
        </label>
      </li>
      <li>
        <label className="cmap-hlist-item cmap-noselect cmap-pointer">
          <className
            type="checkbox"
            value="relations"
            checked="true"
            id="cmap-type-selector-relations"
          />
          <span className="cmap-label-text">Relations</span>
        </label>
      </li>
    </ul>
  </section>
);
