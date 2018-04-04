import React from 'react';
import PropTypes from 'prop-types';
import { Container, Heading, Button, Group } from '@deskpro/react-components';

const LinkToCardSection = ({ onCreate, onPick, onSearch }) => {
  return (

    <div className="dp-trello-main-nav">
      <Heading size={3}>Link a card</Heading>

      <div className="dp-form-group">
        <Button onClick={onSearch}>Search for card</Button>
      </div>

      <div className="dp-form-group">
        <Button onClick={onPick}>Pick card</Button>
      </div>

      <div className="dp-form-group">
        <Button onClick={onCreate}>Create new card</Button>
      </div>

    </div>
  )};

LinkToCardSection.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onPick: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};
export default LinkToCardSection;
