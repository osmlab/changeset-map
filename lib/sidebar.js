import React from 'react';
import moment from 'moment';
import { getBounds } from './helpers';

export class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      actions: true,
      type: false,
      mapStyle: false,
      user: false
    };
    this.toggleUser = this.toggleUser.bind(this);
    this.toggleActions = this.toggleActions.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.toggleMapStyle = this.toggleMapStyle.bind(this);
  }
  toggleUser() {
    this.setState({
      user: !this.state.user
    });
  }
  toggleActions() {
    this.setState({
      actions: !this.state.actions
    });
  }
  toggleType() {
    this.setState({
      type: !this.state.type
    });
  }
  toggleMapStyle() {
    this.setState({
      mapStyle: !this.state.mapStyle
    });
  }
  render() {
    const result = this.props.result;
    const changesetId = this.props.changesetId;
    const filterLayers = this.props.filterLayers;
    var date = new Date(
      result.changeset.to ? result.changeset.to : result.changeset.from
    );

    var bbox = result.changeset.bbox;
    var bounds = getBounds(bbox);
    var center = bounds.getCenter();
    var userName = result.changeset.user;
    var userId = result.changeset.uid;
    return (
      <div className="cmap-sidebar">
        <section className="cmap-changeset-section cmap-fill-light cmap-pt3">
          <h6 className="cmap-heading">
            Changeset:
            <em className="cmap-changeset-id">{changesetId}</em>
            <small className="cmap-time" title={date}>
              ({moment(date).fromNow()})
            </small>
          </h6>
          <ul className="cmap-hlist">
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-osm"
                href={'https://openstreetmap.org/changeset/' + changesetId}
              >
                OSM
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-osmcha"
                href={'https://osmcha.mapbox.com/' + changesetId + '/'}
              >
                OSMCha
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-achavi"
                href={
                  'https://overpass-api.de/achavi/?changeset=' + changesetId
                }
              >
                Achavi
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-osmhv"
                href={
                  'http://osmhv.openstreetmap.de/changeset.jsp?id=' +
                  changesetId
                }
              >
                OSM HV
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-josm"
                href={
                  'http://127.0.0.1:8111/import?url=http://www.openstreetmap.org/api/0.6/changeset/' +
                  changesetId +
                  '/download'
                }
              >
                JOSM
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-c-link-id"
                href={
                  'http://preview.ideditor.com/release#map=15/' +
                  center.lat +
                  '/' +
                  center.lng
                }
              >
                iD
              </a>
            </li>
          </ul>
        </section>
        <section className="cmap-user-section cmap-fill-light cmap-pb3">
          <h6 className="cmap-heading" onClick={this.toggleUser}>
            {this.state.user ? '▼' : '▶'}
            User: <em className="cmap-user-id">{userName}</em>
          </h6>

          <ul
            className="cmap-hlist"
            style={{
              display: this.state.user ? 'block' : 'none'
            }}
          >
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-u-link-osm"
                href={'https://openstreetmap.org/user/' + userName}
              >
                OSM
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-u-link-hdyc"
                href={'http://hdyc.neis-one.org/?' + userName}
              >
                HDYC
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-u-link-disc"
                href={
                  'http://resultmaps.neis-one.org/osm-discussion-comments?uid=' +
                  userId
                }
              >
                Discussions
              </a>
            </li>
            <li>
              <a
                target="_blank"
                className="cmap-hlist-item cmap-noselect cmap-pointer cmap-u-link-comm"
                href={
                  'http://resultmaps.neis-one.org/osm-discussion-comments?uid=115894' +
                  userId +
                  '&commented'
                }
              >
                Comments
              </a>
            </li>
          </ul>
        </section>
        <section className="cmap-filter-action-section cmap-pt3">
          <h6 className="cmap-heading pointer" onClick={this.toggleActions}>
            {this.state.actions ? '▼' : '▶'}Filter by actions
          </h6>

          <ul
            style={{
              display: this.state.actions ? 'block' : 'none'
            }}
            className="cmap-hlist"
          >
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="added"
                  defaultChecked="true"
                  id="cmap-layer-selector-added"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Added</span>
                <span className="cmap-color-box cmap-color-added" />
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="modified"
                  defaultChecked="true"
                  id="cmap-layer-selector-modified"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Modified</span>
                <span className="cmap-color-box cmap-color-modified-old" />
                <span className="cmap-unicode">→</span>
                <span className="cmap-color-box cmap-color-modified-new" />
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="deleted"
                  defaultChecked="true"
                  id="cmap-layer-selector-deleted"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Deleted</span>
                <span className="cmap-color-box cmap-color-deleted" />
              </label>
            </li>
          </ul>
        </section>
        <section className="cmap-filter-type-section">
          <h6 className="cmap-heading pointer" onClick={this.toggleType}>
            {this.state.type ? '▼' : '▶'}Filter by type
          </h6>
          <ul
            className="cmap-hlist"
            style={{
              display: this.state.type ? 'block' : 'none'
            }}
          >
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="nodes"
                  defaultChecked="true"
                  id="cmap-type-selector-nodes"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Nodes</span>
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="ways"
                  defaultChecked="true"
                  id="cmap-type-selector-ways"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Ways</span>
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="checkbox"
                  value="relations"
                  defaultChecked="true"
                  id="cmap-type-selector-relations"
                  onChange={filterLayers}
                />
                <span className="cmap-label-text">Relations</span>
              </label>
            </li>
          </ul>
        </section>
        <section className="cmap-map-style-section cmap-pb3">
          <h6 className="cmap-heading pointer" onClick={this.toggleMapStyle}>
            {this.state.mapStyle ? '▼' : '▶'}Map style
          </h6>

          <ul
            className="cmap-hlist"
            style={{
              display: this.state.mapStyle ? 'block' : 'none'
            }}
          >
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="radio"
                  value="satellite"
                  defaultChecked="true"
                  name="baselayer"
                  id="cmap-baselayer-satellite"
                  onChange={this.props.toggleLayer}
                />
                <span className="cmap-label-text">Satellite</span>
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="radio"
                  value="streets"
                  name="baselayer"
                  id="cmap-baselayer-streets"
                  onChange={this.props.toggleLayer}
                />
                <span className="cmap-label-text">Streets</span>
              </label>
            </li>
            <li>
              <label className="cmap-hlist-item cmap-noselect cmap-pointer">
                <input
                  type="radio"
                  value="dark"
                  name="baselayer"
                  id="cmap-baselayer-dark"
                  onChange={this.props.toggleLayer}
                />
                <span className="cmap-label-text">Dark</span>
              </label>
            </li>
          </ul>
        </section>
      </div>
    );
  }
}
