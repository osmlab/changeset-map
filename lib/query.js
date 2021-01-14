import moment from 'moment';
import { config } from './config';

export function query(changesetID) {
  var url = `${config.osmBase}changeset/${changesetID}.json`;
  var options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  return fetch(url, options)
    .then(r => r.json())
    .then(r => {
      const cs = r.elements[0];
      return {
        id: changesetID,
        uid: cs.uid,
        user: cs.user,
        from: moment(cs.created_at, 'YYYY-MM-DDTHH:mm:ss\\Z')
          .subtract(1, 'seconds')
          .format('YYYY-MM-DDTHH:mm:ss\\Z'),
        to: cs.closed_at || null,
        bbox: {
          left: cs.minlon || -180,
          bottom: cs.minlat || -90,
          right: cs.maxlon || 180,
          top: cs.maxlat || 90
        }
      };
    });
}
