import { parse, subSeconds } from 'date-fns';

export function query(changesetID, options) {
  const url = `${options.osmApiBase}/changeset/${changesetID}.json?include_discussion=true`;
  const meta = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  return fetch(url, meta)
    .then(r => r.json())
    .then(r => {
      const cs = r.changeset;
      return [
        {
          id: changesetID,
          uid: cs.uid,
          user: cs.user,
          from: subSeconds(
            parse(cs.created_at, 'yyyy-MM-dd\'T\'HH:mm:ssX', new Date()),
            1
          ).toISOString(),
          to: cs.closed_at || null,
          comments: cs.comments || [],
          bbox: {
            left: cs.min_lon || -180,
            bottom: cs.min_lat || -90,
            right: cs.max_lon || 180,
            top: cs.max_lat || 90
          }
        },
        options
      ];
    });
}
