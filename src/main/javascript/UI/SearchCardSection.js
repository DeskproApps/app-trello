import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';
import { Divider } from 'semantic-ui-react';
import CardsListComponent from './CardListComponent';
import SearchInputComponent from './SearchInputComponent';

const SearchCardSection = ({ onSelectCard, onGotoCard, onCancel, onSearchChange, cards, ...otherProps }) => {

  let searchInput;
  const onChange = value => { searchInput = value; };
  const onSearchButtonClick = () => { if (searchInput) { onSearchChange(searchInput); };  };

  return (
    <Layout.Section title="SEARCH FOR A CARD">
      <Layout.Block>
        <SearchInputComponent
          fluid
          placeholder="Search card or paste URL..."
          minCharacters={3}
          onSearch={onSearchChange}
          onChange={onChange}
        />
      </Layout.Block>

      <Layout.Block>
        <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} onGotoCard={onGotoCard} showBorder={true} />
      </Layout.Block>

      <Layout.Block>
        <Layout.Button onClick={onSearchButtonClick}>Search</Layout.Button>
        <Divider hidden />
        <Layout.Button onClick={onCancel}>Cancel</Layout.Button>
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
