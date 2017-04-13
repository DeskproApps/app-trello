import React from 'react';
import { Header, Segment, Button, List, Container, Divider } from 'semantic-ui-react';
import { Layout } from 'deskproapps-sdk-react';

import CardListComponent from './CardListComponent';

const LinkedCardsSection = ({ cards, onGotoCard, onUnlinkCard, onSelectCard }) => {
  if (!cards || !cards.length) {
    return null;
  }

  return (
    <Layout.Section title="LINKED CARDS">
      <CardListComponent cards={cards} onGotoCard={onGotoCard} onUnlinkCard={onUnlinkCard} onSelectCard={onSelectCard} />
    </Layout.Section>
  )};

LinkedCardsSection.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onGotoCard: React.PropTypes.func,
  onUnlinkCard: React.PropTypes.func,
  onSelectCard: React.PropTypes.func
};
export default LinkedCardsSection;

