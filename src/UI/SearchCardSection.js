import React from 'react';
import PropTypes from 'prop-types';

import { Action, ActionBar, Panel } from '@deskpro/apps-components';
import debounce from '@deskpro/js-utils/dist/debounce';

import CardsListComponent from './CardListComponent';
import SearchInputComponent from './SearchInputComponent';

const SearchCardSection = ({ onSelectCard, onSearchChange, cards, history }) => {
  const debouncedSearch = debounce(onSearchChange, 500);

  const onChange = value => {
    debouncedSearch(value);
  };

  const onCancel = () => {
    history.push("ticket-loaded", null);
    history.go(1);
  };

  return (
    <Panel>
      <ActionBar title="Search for card">
        <Action icon="close" onClick={onCancel} />
      </ActionBar>
      <div className="dp-form-group">
        <SearchInputComponent
          placeholder   ="Enter text or paste URL..."
          minCharacters ={3}
          onSearch      ={onSearchChange}
          onChange      ={onChange}
        />
      </div>

      <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} showBorder={true} />
    </Panel>
  );
};


SearchCardSection.propTypes = {
  cards: PropTypes.array,
  onSearchChange: PropTypes.func,
  onSelectCard: PropTypes.func,
};

export default SearchCardSection;
