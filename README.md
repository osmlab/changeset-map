### OSM Changeset Viewer on a GL Map

Very experimental work in progress. The idea being that you can pass a changeset id and a container HTML element where you want the map rendered, and this plugin should render details of changes made by that changeset in the specified HTML element on a MapboxGL map.

Heavily inspired by the ACHAVI Changeset Viewer: http://wiki.openstreetmap.org/wiki/Achavi

### Setup

 - `npm install`
 - `npm install -g watchify`
 - `npm install -g browserify`

 ### Test Locally

 Run `npm start` to start the `watchify` process to watch for changes to your files and re-build.
 In another terminal, use your favourite way to serve a local directory - eg. `serve` or `python -m SimpleHTTPServer`. Go to the browser at the port where your local webserver is running. eg. `http://localhost:3000`

 ### Build

 To build files, run `npm build`.