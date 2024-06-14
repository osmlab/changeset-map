import React from 'react';
import PropTypes from 'prop-types';
import { config } from '../config';

export const DiffColumn = function({ diff, prop, type, propClass }) {
  return (
    <td className={propClass}>
      <DiffColumnContent diff={diff} prop={prop} type={type} />
    </td>
  );
};

const DiffColumnContent = function ({ diff, prop, type }) {
  let renderOutput;
  const value = diff[prop][type],
    propIsWikidata = typeof prop == 'string' && /wikidata$/.test(prop);
  if (prop === 'changeset' && type === 'modifiedOld') {
    // Link to the last changeset that affected the element before this
    renderOutput = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="cmap-changeset-link"
        href={`${config.osmchaBase}changesets/${value}`}
        title={`Go to changeset ${value}`}
      >
        {value}
      </a>
    );
  } else if (propIsWikidata && typeof value === 'string') {
    // The tag is a reference to Wikidata, transform the value into a link
    // https://wiki.openstreetmap.org/wiki/Wikidata
    const wikidataQIdArray = value.split(';'),
      renderArray = [];
    wikidataQIdArray.forEach((QId, index) => {
      const isValidWikidataQId = /^Q\d+$/.test(QId);

      if (index !== 0)
        renderArray.push(<span>;</span>);

      if (isValidWikidataQId) {
        renderArray.push(
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="cmap-wikidata-link"
            href={`https://www.wikidata.org/wiki/${QId}`}
            title={`Go to Wikidata entity ${QId}`}
          >
            {QId}
          </a>
        );
      } else {
        renderArray.push(<span>{QId}</span>);
      }
    });
    renderOutput = (<span>{renderArray}</span>);
  } else {
    // Standard tag, no processing needed
    renderOutput = (<span>{value}</span>);
  }
  return renderOutput;
};

DiffColumn.propTypes = {
  diff: PropTypes.object.isRequired,
  prop: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  propClass: PropTypes.string
};
