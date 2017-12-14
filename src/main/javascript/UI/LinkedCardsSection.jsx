import React from 'react';
import { Container, Heading } from '@deskpro/react-components';

import CardListComponent from './CardListComponent';

const LinkedCardsSection = ({ cards, onGotoCard, onUnlinkCard, onSelectCard }) => {
  if (!cards || !cards.length) {
    return null;
  }

  return (
    <Container className="dp-trello-container">
      <Heading size={3}>Linked cards</Heading>

      <CardListComponent cards={cards} onGotoCard={onGotoCard} onUnlinkCard={onUnlinkCard} onSelectCard={onSelectCard} />
    </Container>
  )};

LinkedCardsSection.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onGotoCard: React.PropTypes.func,
  onUnlinkCard: React.PropTypes.func,
  onSelectCard: React.PropTypes.func
};
export default LinkedCardsSection;

