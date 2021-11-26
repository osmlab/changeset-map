const DEFAULT_OSM_URL = 'https://www.openstreetmap.org';

export const config = {
  overpassBase: 'https://overpass.maptime.in/api/interpreter',
  osmchaBase: 'https://osmcha.org/',
  osmBase: DEFAULT_OSM_URL,
  osmApiBase: `${DEFAULT_OSM_URL}/api/0.6/`,
  mapboxAccessToken:
    'pk.eyJ1Ijoib3BlbnN0cmVldG1hcCIsImEiOiJjam10OXpmc2YwMXI5M3BqeTRiMDBqMHVyIn0.LIcIDe3TZLSDdTWDoojzNg',
  S3_URL: 'https://s3.amazonaws.com/mapbox/real-changesets/production/',
  isOSMApp: DEFAULT_OSM_URL === 'https://www.openstreetmap.org'
};
