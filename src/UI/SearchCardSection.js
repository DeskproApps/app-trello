import React from 'react';
import PropTypes from 'prop-types';

import { Button, Panel } from '@deskpro/apps-components';

import CardsListComponent from './CardListComponent';
import SearchInputComponent from './SearchInputComponent';

const SearchCardSection = ({ onSelectCard, onGotoCard, onCancel, onSearchChange, cards, ...otherProps }) => {

  let searchInput;
  const onChange = value => { searchInput = value; };
  const onSearchButtonClick = () => { if (searchInput) { onSearchChange(searchInput); };  };

  return (
    <Panel title={"Search for card"}>
      <div className="dp-form-group">
        <SearchInputComponent
          placeholder   ="Enter text or paste URL..."
          minCharacters ={3}
          onSearch      ={onSearchChange}
          onChange      ={onChange}
        />
      </div>

      <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} onGotoCard={onGotoCard} showBorder={true} />

      <div className="dp-form-group dp-form-controls">
        <Button onClick={onSearchButtonClick} className={"dp-form-control dp-Button--wide"}>Search</Button>
        <Button type="secondary" onClick={onCancel} className={"dp-form-control dp-Button--wide"}>Cancel</Button>
      </div>
    </Panel>
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
