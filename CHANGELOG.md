# Change Log

Log of changes since the 1.1.0 version

#### 1.12.0
- Make app configurable through OSMCha

#### 1.11.0
- Refator lib/featureDiff (#245)
- Improve responsiveness (#245)
- Update node version and documentation (#244)

#### 1.10.0

- Add the possibility to flag a feature to OSMCha (#236)
- Replace moment by date-fns (#238)
- Update Mapbox-GL and Turf (#238)

#### 1.9.4

- Update y18n (#231)
- Remove unneeded sax and xhr dependencies

#### 1.9.3

- Fetch OSM api with include_discussion=true and pass data to render function (#229)

#### 1.9.2

- Fallback to overpass if the elements field of real-changesets is empty (#228)

#### 1.9.1

- Fetch OSM API with json format (#226)
- Update @turfjs libs (#227)

#### 1.9.0

- Add option to load selected feature on OSM website (#224)
- Fix problems on plugin build system (#225)

#### 1.8.2

- Add createBbox function to the named exports

#### 1.8.1

- Update real-changesets-parser to 1.3.0
- Fix problems on map attribution control

#### 1.8.0

- Update mapbox-gl-js to 1.13.0

#### 1.6.1

- Improve rollup config with node polyfills

#### 1.6.0

- Update babel, rollup and its plugins
- Make it compatible with modern node versions, like 12.x and 14.x

#### 1.5.0

* Enable visualization of ways that had dragged nodes

#### 1.4.5

* Add link to open feature on Level0 editor

#### 1.4.4

* Exclude relation members with invalid coordinates from the map visualization

#### 1.4.3

* Add zoom controls if device is touchscreen and without mouse

#### 1.4.2

* Update URLs to osmcha.org
* Zoom to feature when selecting it from the sidebar

#### 1.4.1

* Fix bug when switching from one changeset to another in OSMCha

#### 1.4.0

* Enable visualization or relation members

#### 1.3.10

* Auto select element if it's the only one + adjust spacing on tablehead

#### 1.3.9

* Add more object history options and open feature on iD/JOSM

#### 1.3.1

* Change OSM link on feature sidebar, making it link to OSM feature page, not to history page

#### 1.3.0

* Update mapbox-gl-js to 0.4.3
* Update @turf/helpers and @turf/bbox-polygon to 5.1.5

#### 1.2.0

* Link the id of the old version changeset to OSMCha
* Add section 'Tags added, updated, deleted'
