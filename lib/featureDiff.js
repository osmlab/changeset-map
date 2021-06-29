import React from 'react';
import { render as reactDOM } from 'react-dom';
import PropTypes from 'prop-types';

import { propsDiff } from './propsDiff';
import { Dropdown } from './dropdown';
import { cmap } from './render';
import { config } from './config';

//Calculates the difference in the selected features

export const displayDiff = function(
  id,
  featureMap,
  changesetId,
  metadataContainer,
  tagsContainer,
  membersContainer
) {
  var featuresWithId = featureMap[id];

  reactDOM(
    <MetadataTable
      featuresWithId={featuresWithId}
      id={id}
      changesetId={changesetId}
    />,
    metadataContainer
  );
  reactDOM(<TagsTable featuresWithId={featuresWithId} />, tagsContainer);
  if (featuresWithId[0].properties.type === 'relation') {
    document.querySelector('.cmap-diff-members').style.display = 'block';
    reactDOM(
      <RelationMembersTable featuresWithId={featuresWithId} />,
      membersContainer
    );
  }
};

class FlagButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      flagState: null
    };
  }
  flagAsBad() {
    fetch(
      `${config.osmchaBase}api/v1/changesets/${this.props.changesetId}/review-feature/${this.props.type}-${this.props.id}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.props.token}`
        }
      }
    )
      .then(() => this.setState({ flagState: 'success' }))
      .catch(() => this.setState({ flagState: 'error' }));
  }

  removeFlag() {
    fetch(
      `${config.osmchaBase}api/v1/changesets/${this.props.changesetId}/review-feature/${this.props.type}-${this.props.id}/`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.props.token}`
        }
      }
    ).then(() => this.setState({ flagState: null }));
  }

  render() {
    return (
      <span>
        {this.state.flagState === null && (
          <button
            className="cmap-btn cmap-noselect cmap-pointer cmap-c-link-osm"
            onClick={() => this.flagAsBad()}
          >
            Add to flagged
          </button>
        )}
        {this.state.flagState === 'success' && (
          <button
            className="cmap-btn cmap-noselect cmap-pointer cmap-c-link-osm b--red bg-white"
            onClick={() => this.removeFlag()}
          >
            <ThumbsDownIcon style={{ verticalAlign: 'middle' }} />
            <span className="pl6">Flagged</span>
            <i className="gg-close"></i>
          </button>
        )}
        {this.state.flagState === 'error' && <span> Failed</span>}
      </span>
    );
  }
}

FlagButton.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  changesetId: PropTypes.number.isRequired
};

const MetadataTable = function({ featuresWithId, id, changesetId }) {
  const type = featuresWithId[0].properties.type;
  const metadataProps = featuresWithId.map(function(f) {
    var filteredProps = Object.assign({}, f.properties);
    delete filteredProps.tags;
    delete filteredProps.tagsCount;
    delete filteredProps.relations;
    delete filteredProps.action;
    return filteredProps;
  });
  const token = localStorage.getItem('token');

  const metadataHeader = (
    <div className="cmap-space-between">
      <div className="cmap-block">
        <span>
          {type.toUpperCase()}: {id}
        </span>
      </div>
      <div id="cmap-feature-btns">
        <Dropdown
          display="History"
          options={[
            {
              label: 'OSM',
              href: `https://www.openstreetmap.org/${type}/${id}/history`
            },
            {
              label: 'Deep History',
              href: `https://osmlab.github.io/osm-deep-history/#/${type}/${id}`
            },
            {
              label: 'PeWu',
              href: `https://pewu.github.io/osm-history/#/${type}/${id}`
            }
          ]}
        />
        <Dropdown
          display="Open feature"
          options={[
            {
              label: 'OSM',
              href: `https://www.openstreetmap.org/${type}/${id}`
            },
            {
              label: 'iD',
              href: `https://www.openstreetmap.org/edit?editor=id&${type}=${id}`
            },
            {
              label: 'JOSM',
              href: `http://127.0.0.1:8111/load_object?new_layer=true&objects=${type[0]}${id}`
            },
            {
              label: 'Level0',
              href: `http://level0.osmz.ru/?url=${type}/${id}`
            },
            {
              label: 'RapiD',
              href: ` https://mapwith.ai/rapid#id=${type[0]}${id}`
            }
          ]}
        />
        {token && (
          <FlagButton
            token={token}
            type={type}
            id={id}
            changesetId={changesetId}
          />
        )}
      </div>
    </div>
  );
  return (
    <DiffTable
      diff={propsDiff(metadataProps)}
      ignoreList={['id', 'type', 'changeType']}
      header={metadataHeader}
    />
  );
};
MetadataTable.propTypes = {
  featuresWithId: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  changesetId: PropTypes.number.isRequired
};

const TagsTable = function({ featuresWithId }) {
  const tagProps = featuresWithId.map(function(f) {
    const filteredProps = Object.assign({}, f.properties.tags);
    filteredProps.changeType = f.properties.changeType;
    return filteredProps;
  });

  const tagHeader = (
    <span className="cmap-inline-block">{'Tag details'.toUpperCase()}</span>
  );

  return (
    <DiffTable
      diff={propsDiff(tagProps)}
      ignoreList={['id', 'changeType']}
      header={tagHeader}
    />
  );
};
TagsTable.propTypes = {
  featuresWithId: PropTypes.array.isRequired
};

const RelationMembersTable = function({ featuresWithId }) {
  return (
    <table
      className="cmap-diff-table"
      style={
        featuresWithId[0].properties.changeType === 'added' ?
          { width: '350px' } :
          undefined
      }
    >
      <thead>
        <tr>
          <td className="cmap-table-head" colSpan="2">
            <span className="cmap-strong">MEMBERS</span> (click to highlight)
          </td>
        </tr>
      </thead>
      <tbody>
        {featuresWithId[0].properties.relations.map((i, n) => (
          <tr
            key={n}
            onClick={() => cmap.emit('selectMember', i.properties.ref)}
          >
            <th className="cmap-strong cmap-pointer">
              {`${i.properties.ref} (${i.properties.type.toUpperCase()})`}
            </th>
            <td className="diff-property cmap-scroll-styled cmap-pointer">
              {i.properties.role}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
RelationMembersTable.propTypes = {
  featuresWithId: PropTypes.array.isRequired
};

//Renders the markup for a table
const DiffTable = function({ diff, ignoreList, header }) {
  var isAddedFeature = diff['changeType'].added === 'added';
  var types = ['added', 'deleted', 'modifiedOld', 'modifiedNew', 'unchanged'];
  var sortedProps = Object.keys(diff).sort(function(keyA, keyB) {
    var indexA = types.indexOf(Object.keys(diff[keyA])[0]);
    var indexB = types.indexOf(Object.keys(diff[keyB])[0]);
    return indexA - indexB;
  });

  return (
    <table
      className="cmap-diff-table"
      style={isAddedFeature ? { width: '350px' } : undefined}
    >
      {header && (
        <thead>
          <tr>
            <td
              className="cmap-table-head"
              colSpan={isAddedFeature ? '2' : '3'}
            >
              {header}
            </td>
          </tr>
        </thead>
      )}
      <DiffRows
        diff={diff}
        sortedProps={sortedProps}
        types={types}
        isAddedFeature={isAddedFeature}
        ignoreList={ignoreList}
      />
    </table>
  );
};
DiffTable.propTypes = {
  diff: PropTypes.object.isRequired,
  ignoreList: PropTypes.array,
  header: PropTypes.node
};
DiffTable.defaultProps = {
  ignoreList: []
};

const DiffRows = function({
  diff,
  sortedProps,
  types,
  isAddedFeature,
  ignoreList
}) {
  const rows = [];
  sortedProps.forEach(function(prop) {
    if (ignoreList.indexOf(prop) !== -1) {
      return;
    }

    const columns = [];
    types.forEach(function(type) {
      if (diff[prop].hasOwnProperty(type)) {
        const propClass = `diff-property cmap-scroll-styled props-diff-${type}`;
        if (type === 'added' && !isAddedFeature) {
          columns.push(<td key={`${prop}-${type}-1`} className={propClass} />);
        }

        columns.push(
          <DiffColumn
            key={`${prop}-${type}-2`}
            diff={diff}
            prop={prop}
            type={type}
            propClass={propClass}
          />
        );

        if (type === 'deleted') {
          columns.push(<td key={`${prop}-${type}-3`} className={propClass} />);
        } else if (type === 'unchanged') {
          columns.push(
            <DiffColumn
              key={`${prop}-${type}-3`}
              diff={diff}
              prop={prop}
              type={type}
              propClass={propClass}
            />
          );
        }
      }
    });

    rows.push(
      <tr key={`${prop}-row`}>
        <th key={`${prop}-header`} title={prop} className="cmap-strong">
          {prop}
        </th>
        {columns}
      </tr>
    );
  });

  return <tbody>{rows}</tbody>;
};
DiffRows.propTypes = {
  diff: PropTypes.object.isRequired,
  sortedProps: PropTypes.array.isRequired,
  types: PropTypes.array.isRequired,
  isAddedFeature: PropTypes.bool,
  ignoreList: PropTypes.array
};
DiffRows.defaultProps = {
  isAddedFeature: false,
  ignoreList: []
};

const DiffColumn = function({ diff, prop, type, propClass }) {
  if (prop === 'changeset' && type === 'modifiedOld') {
    return (
      <td className={propClass}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="cmap-changeset-link"
          href={`${config.osmchaBase}changesets/${diff[prop][type]}`}
        >
          {diff[prop][type]}
        </a>
      </td>
    );
  } else {
    return <td className={propClass}>{diff[prop][type]}</td>;
  }
};
DiffColumn.propTypes = {
  diff: PropTypes.object.isRequired,
  prop: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  propClass: PropTypes.string
};

const ThumbsDownIcon = props => (
  <svg width="14px" height="14px" viewBox="0 0 100 99" {...props}>
    <g
      id="Symbols"
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
    >
      <g id="icons/Thumbs-down-trans" fill="#CC2C47">
        <g
          id="Thumbs-up"
          transform="translate(50.000000, 49.500000) rotate(-180.000000) translate(-50.000000, -49.500000) "
        >
          <path
            d="M41.8167977,42 L8.65058811,42 L8.65058811,42 C8.15292909,42 7.65635568,42.0464369 7.16732524,42.1387068 C2.82565287,42.9578902 -0.0298885833,47.1415905 0.789294882,51.4832629 L7.77042696,88.4832629 C8.483559,92.2628627 11.7854321,95 15.6317202,95 L15.6317202,95 L92,95 C96.418278,95 100,91.418278 100,87 L100,87 L100,50 C100,45.581722 96.418278,42 92,42 L64.8136835,42 C64.848108,41.339148 64.8257549,40.6662103 64.7423209,39.9866948 L61.0862406,10.2103103 C60.3122149,3.90637709 54.5743956,-0.576498687 48.2704624,0.197526982 L48.2704624,0.197526982 L48.2704624,0.197526982 C41.9665292,0.97155265 37.4836534,6.70937199 38.2576791,13.0133052 L38.2576791,13.0133052 L41.8167977,42 Z"
            id="Combined-Shape"
            fillOpacity="0.3"
          ></path>
          <rect
            id="Rectangle-7"
            fillOpacity="0.9"
            x="76"
            y="37"
            width="24"
            height="62"
            rx="8"
          ></rect>
        </g>
      </g>
    </g>
  </svg>
);
