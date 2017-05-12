import React from 'react';
import { render } from 'react-dom';

import { render as changesetMap } from '../js/render';

render(
    <div>
        <h1 />
    </div>,
    document.getElementById('root')
);

var cMap;

var containerWidth = window.innerWidth + 'px';
var containerHeight = window.innerHeight + 'px';

if (location.hash !== '') {
    document.getElementById('formContainer').style.display = 'none';
    var id = location.hash.split('/')[0].replace('#', '');
    var [, geometryType, featureId] = location.hash.split('/');
    cMap = changesetMap(document.getElementById('container'), id, {
        width: containerWidth,
        height: containerHeight
    });
    cMap.on('load', function() {
        cMap.emit('selectFeature', geometryType, featureId);
    });
}

document
    .getElementById('changesetForm')
    .addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('formContainer').style.display = 'none';
        var changesetID = document.getElementById('changesetInput').value;
        location.hash = changesetID;
        cMap = changesetMap(document.getElementById('container'), changesetID, {
            hash: location.hash,
            width: containerWidth,
            height: containerHeight
        });
    });

cMap.on('featureChange', function(geometryType, featureId) {
    clearHash();
    if (geometryType && featureId) {
        updateHash(geometryType, featureId);
    }
});

function updateHash(osmType, featureId) {
    clearHash();

    location.hash += '/' + osmType;
    location.hash += '/' + featureId;
}

function clearHash() {
    var changesetId = location.hash.split('/')[0].replace('#', '');

    location.hash = changesetId;
}
