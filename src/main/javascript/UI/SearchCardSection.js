import React from 'react';
import PropTypes from 'prop-types';

import { Heading, Button, Container, Group } from '@deskpro/react-components';

import CardsListComponent from './CardListComponent';
import SearchInputComponent from './SearchInputComponent';

const SearchCardSection = ({ onSelectCard, onGotoCard, onCancel, onSearchChange, cards, ...otherProps }) => {

  let searchInput;
  const onChange = value => { searchInput = value; };
  const onSearchButtonClick = () => { if (searchInput) { onSearchChange(searchInput); };  };

  return (
    <Container className="dp-trello-container">
      <Heading size={3}>Search for card</Heading>
      <SearchInputComponent
        placeholder="Enter text or paste URL..."
        minCharacters={3}
        onSearch={onSearchChange}
        onChange={onChange}
      />

      <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} onGotoCard={onGotoCard} showBorder={true} />

      <div className="dp-trello-form-buttons dp-form-group">
        <Button onClick={onSearchButtonClick}>Search</Button>
        <Button type="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </Container>
  );
};


SearchCardSection.propTypes = {
  cards: PropTypes.array,
  onCancel: PropTypes.func,
  onSearchChange: PropTypes.func,
  onSelectCard: PropTypes.func,
  onGotoCard: PropTypes.func
};

export default SearchCardSection;
