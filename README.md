### OSM Changeset Viewer on a GL Map

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)

![](https://cloud.githubusercontent.com/assets/126868/24163445/a88728d4-0e90-11e7-9d02-d755b7845c00.png)

`changeset-map` is a JavaScript library and application which displays OpenStreetMap [changesets](https://wiki.openstreetmap.org/wiki/Changeset) in a web browser. Pass in a changeset ID, and it will render a map visualization of what was edited in that changeset. Things that were added are shown in green, deletions in red, and things that were modified are yellow, similar to a code diff.

This library was originally a core component of [OSMCha](https://osmcha.org), the OpenStreetMap changeset review and validation tool. It is no longer used in OSMCha (having been replaced by [maplibre-adiff-viewer](https://github.com/OSMCha/maplibre-adiff-viewer)), but can still be used as a standalone application at [osmlab.github.io/changeset-map](http://osmlab.github.io/changeset-map/). ([Example](https://osmlab.github.io/changeset-map/#110574164))

Heavily inspired by the [Achavi Changeset Viewer](https://overpass-api.de/achavi/). ([Example](https://overpass-api.de/achavi/?changeset=110574164), [Github](https://github.com/nrenner/achavi)).

### Use as a module

Create a container div to hold the UI.

```html
<div id='container'></div>
```

```js
// es6 modules
import {getChangeset, query, propsDiff, render} from 'changeset-map';

// commonjs
var changesetMap = require('changeset-map');
var render = changesetMap.render;

var container = document.getElementById('container');
var changesetMapControl = render(container, changesetID, { width: '1000px', height: '1000px' });

// binding events
changesetMapControl.on('load', function () {
    changesetMapControl.emit('selectFeature', 'node|way', featureId);
    changesetMapControl.emit('clearFeature');
    changesetMapControl.on('hashchange', function(geometryType, featureId) {
        // update hash.
    });
})
```

For a custom overpass instance, set a `overpassBase` key in the options object. Default instance is https://overpass.osmcha.org/api/interpreter.

### Build

 - Build the plugin by `npm run build`.
 - Build the website by `npm run build:website`, the websites html can be found in `public` folder. The javascript code to run changeset map can be found in `www` folder.

### Development

 - Install [asdf version manager](https://asdf-vm.com/guide/getting-started.html#getting-started)
 - `asdf install` # To install the required tools from [.tool-versions](./.tool-versions)
 - `yarn add react react-dom` # Install those packages manually
 - `yarn install` # Install packages
 - `yarn start` # To get going …
