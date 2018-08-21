import React from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from '@deskpro/apps-components';

const LinkToCardSection = ({ onCreate, onPick, onSearch }) => {
  return (

    <Panel border="none" title={"Link a card"} className="dp-trello-main-nav">

      <Button onClick={onSearch} className={"dp-Button--wide"}>Search</Button>

      <Button onClick={onPick} className={"dp-Button--wide"}>Pick</Button>

      <Button onClick={onCreate} className={"dp-Button--wide"}>Create</Button>

    </Panel>
  )};

LinkToCardSection.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onPick: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};
export default LinkToCardSection;
