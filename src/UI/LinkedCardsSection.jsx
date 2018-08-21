import React from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from '@deskpro/apps-components';

import CardListComponent from './CardListComponent';

const LinkedCardsSection = ({ cards, onGotoCard, onUnlinkCard, onSelectCard }) => {
  if (!cards || !cards.length) {
    return null;
  }

  return (
    <Panel title={"Linked cards"} className="dp-trello-container">
      <CardListComponent cards={cards} onGotoCard={onGotoCard} onUnlinkCard={onUnlinkCard} onSelectCard={onSelectCard} />
    </Panel>
  )};

LinkedCardsSection.propTypes = {
  cards: PropTypes.array.isRequired,
  onGotoCard: PropTypes.func,
  onUnlinkCard: PropTypes.func,
  onSelectCard: PropTypes.func
};
export default LinkedCardsSection;

