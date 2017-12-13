import React from 'react';
import { Section } from '@deskpro/react-components';

import CardListComponent from './CardListComponent';

const LinkedCardsSection = ({ cards, onGotoCard, onUnlinkCard, onSelectCard }) => {
  if (!cards || !cards.length) {
    return null;
  }

  return (
    <Section title="LINKED CARDS">
      <CardListComponent cards={cards} onGotoCard={onGotoCard} onUnlinkCard={onUnlinkCard} onSelectCard={onSelectCard} />
    </Section>
  )};

LinkedCardsSection.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onGotoCard: React.PropTypes.func,
  onUnlinkCard: React.PropTypes.func,
  onSelectCard: React.PropTypes.func
};
export default LinkedCardsSection;

