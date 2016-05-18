### OSM Changeset Viewer on a GL Map

Very experimental work in progress. The idea being that you can pass a changeset id and a container HTML element where you want the map rendered, and this plugin should render details of changes made by that changeset in the specified HTML element on a MapboxGL map.

Heavily inspired by the ACHAVI Changeset Viewer: http://wiki.openstreetmap.org/wiki/Achavi

### Setup

 Install dependencies using `npm install`.

### Test Locally

Run `npm run start` to start a server and `watchify` process to watch for changes to your files and re-build. Go to the browser at the port where the webserver is running. eg. `http://localhost:8080`

### Build

To build files, run `npm run build`.