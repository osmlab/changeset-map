import React from 'react';
import { render as reactDOM } from 'react-dom';
import PropTypes from 'prop-types';

import { propsDiff } from './propsDiff';
import { Dropdown } from './dropdown';
import { cmap } from './render';

//Calculates the difference in the selected features

export const displayDiff = function(
  id,
  featureMap,
  metadataContainer,
  tagsContainer,
  membersContainer
) {
  var featuresWithId = featureMap[id];

  reactDOM(
    <MetadataTable featuresWithId={featuresWithId} id={id} />,
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

const MetadataTable = function({ featuresWithId, id }) {
  const type = featuresWithId[0].properties.type;
  const metadataProps = featuresWithId.map(function(f) {
    var filteredProps = Object.assign({}, f.properties);
    delete filteredProps.tags;
    delete filteredProps.tagsCount;
    delete filteredProps.relations;
    delete filteredProps.action;
    return filteredProps;
  });

  const metadataHeader = (
    <div className="cmap-space-between">
      <span>
        {type.toUpperCase()}: {id}
      </span>
      <span>
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
            }
          ]}
        />
      </span>
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
  id: PropTypes.string.isRequired
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
      {header &&
        <thead>
          <tr>
            <td
              className="cmap-table-head"
              colSpan={isAddedFeature ? '2' : '3'}
            >
              {header}
            </td>
          </tr>
        </thead>}
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
          href={`//osmcha.org/changesets/${diff[prop][type]}`}
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
