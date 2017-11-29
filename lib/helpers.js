import mapboxgl from 'mapbox-gl';
import turfHelpers from '@turf/helpers';
import turfBboxPolygon from '@turf/bbox-polygon';

const featureCollection = turfHelpers.featureCollection;

export function getBounds(bbox) {
  var left = +bbox.left,
    right = +bbox.right,
    top = +bbox.top,
    bottom = +bbox.bottom;

  return new mapboxgl.LngLatBounds(
    new mapboxgl.LngLat(left, bottom),
    new mapboxgl.LngLat(right, top)
  );
}

export function getBoundingBox(bounds) {
  var left = bounds.getWest(),
    right = bounds.getEast(),
    top = bounds.getNorth(),
    bottom = bounds.getSouth();

  var padX = 0;
  var padY = 0;
  if (!(left === -180 && right === 180 && top === 90 && bottom === -90)) {
    padX = Math.max((right - left) / 5, 0.0001);
    padY = Math.max((top - bottom) / 5, 0.0001);
  }

  var bboxPolygon = turfBboxPolygon([
    left - padX,
    bottom - padY,
    right + padX,
    top + padY
  ]);

  return featureCollection([bboxPolygon]);
}
