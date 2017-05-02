import React from 'react';
import { Button } from 'semantic-ui-react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';
import CardsListComponent from './CardListComponent';
import SearchInputComponent from './SearchInputComponent';

const SearchCardSection = ({ onSelectCard, onGotoCard, onCancel, onSearchChange, cards, ...otherProps }) => {
  return (
    <Layout.Section title="SEARCH FOR A CARD">
      <Layout.Block>
        <SearchInputComponent
          fluid
          placeholder="Search card or paste URL..."
          minCharacters={3}
          onChange={onSearchChange}
        />
      </Layout.Block>

      <Layout.Block>
        <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} onGotoCard={onGotoCard} />
      </Layout.Block>

      <Layout.Block>
        <Button onClick={onCancel}>Cancel</Button>
      </Layout.Block>

    </Layout.Section>
  );
};


SearchCardSection.propTypes = {
  cards: React.PropTypes.array,
  onCancel: React.PropTypes.func,
  onSearchChange: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onGotoCard: React.PropTypes.func
};

export default SearchCardSection;
