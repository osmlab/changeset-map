const DEFAULT_OSM_URL = 'https://www.openstreetmap.org';

export const config = {
  overpassBase: 'https://overpass.osmcha.org/api/interpreter',
  osmchaBase: 'https://osmcha.org/',
  osmBase: DEFAULT_OSM_URL,
  osmApiBase: `${DEFAULT_OSM_URL}/api/0.6`,
  mapboxAccessToken:
    'pk.eyJ1Ijoib3BlbnN0cmVldG1hcCIsImEiOiJjam10OXpmc2YwMXI5M3BqeTRiMDBqMHVyIn0.LIcIDe3TZLSDdTWDoojzNg',
  S3_URL: 'https://real-changesets.s3.us-west-2.amazonaws.com/',
  enableRealChangesets: true,
  isOSMApp: DEFAULT_OSM_URL === 'https://www.openstreetmap.org'
};
