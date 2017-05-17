import mapboxgl from 'mapbox-gl';
import { EventEmitter as events } from 'events';
import { render as reactDOM } from 'react-dom';
import React from 'react';

import { getChangeset } from './getChangeset';
import { Sidebar } from './sidebar';
import { Map as GlMap } from './map';
//filterLayers, renderMap, selectFeature, clearFeature
import { config } from './config';

export const cmap = new events();

let map;

window.cmap = cmap;

export function render(container, changesetId, options) {
    console.log('called bhidu');

    console.log(container);
    container.style.width = options.width || '1000px';
    container.style.height = options.height || '500px';

    options = options || {};
    options.overpassBase = options.overpassBase || config.overpassBase;
    mapboxgl.accessToken = config.mapboxAccessToken;
    container.classList.add('cmap-loading');
    if (!map) {
        map = new GlMap();
    }

    if (options.data) {
        _render(container, changesetId, options.data);
    } else {
        getChangeset(changesetId, options.overpassBase)
      .then(result => _render(container, changesetId, result))
      .catch(err => {
          errorMessage(err.msg);
      });
    }

    return cmap;
}

function _render(container, changesetId, result) {
    renderHTML(container, changesetId, result);

    container.classList.remove('cmap-loading');

    map.renderMap(false, result);

    var featureMap = result.featureMap;

    cmap.removeAllListeners();
    cmap.on('remove', () => {
        console.log('removing map');
        map.remove();
    });

    cmap.on('selectFeature', (geometryType, featureId) => {
        if (geometryType && featureId) {
            map.selectFeature(featureMap[featureId][0], featureMap);
        }
    });

    cmap.on('clearFeature', () => {
        map.clearFeature();
    });
}

// Sets initial markup for info box and map container
function renderHTML(container, changesetId, result) {
    var info;
    if (document.getElementById('seat')) {
        info = document.getElementById('seat');
    } else {
        info = document.createElement('div');
        info.id = 'seat';
        container.appendChild(info);
    }
    container.classList.add('cmap-container');

  // Add `tagsCount` to feature properties
    result.geojson.features.forEach(feature => {
        var tags = feature.properties.tags || {};
        feature.properties.tagsCount = Object.keys(tags).length;
    });

    reactDOM(
    <div>
      <div className="cmap-map" />

      <div className="cmap-diff" style={{ display: 'none' }}>
        <div
          className="cmap-diff-metadata cmap-scroll-styled"
          style={{ display: 'none' }}
        />
        <div
          className="cmap-diff-tags cmap-scroll-styled"
          style={{ display: 'none' }}
        />
      </div>
      <Sidebar
        result={result}
        changesetId={changesetId}
        filterLayers={map.filterLayers}
        toggleLayer={function(e) {
            var layer = e.target.value;
            if (layer === 'satellite') {
                map.renderMap(
              'mapbox://styles/rasagy/cizp6lsah00ct2snu6gi3p16q',
              result
            );
            }

            if (layer === 'dark') {
                map.renderMap('mapbox://styles/mapbox/dark-v9', result);
            }

            if (layer === 'streets') {
                map.renderMap('mapbox://styles/mapbox/streets-v9', result);
            }
        }}
      />
    </div>,
    info
  );
}

function errorMessage(message) {
    message = message || 'An unexpected error occured';
    document.querySelector('.cmap-info').innerHTML = message;
    document.querySelector('.cmap-sidebar').style.display = 'block';
    document.querySelector('.cmap-layer-selector').style.display = 'none';
    document.querySelector('.cmap-type-selector').style.display = 'none';
}
