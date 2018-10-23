import React from 'react';
import PropTypes from 'prop-types';
import SearchCardSection from "./SearchCardSection";
import PickCardSection from "./PickCardSection";
import { Separator } from '@deskpro/apps-components';

const PageLink = ({ pickCards, searchCards, onSelectCard, onSearchChange, onChange, pickCardModel, boards, lists, history }) => {
  return [
    <SearchCardSection
      cards={searchCards}
      onSelectCard={onSelectCard}
      onSearchChange={onSearchChange}
      history={history}
    />,
    <Separator title="or" />,
    <PickCardSection
      onSelectCard={onSelectCard}
      onChange={onChange}
      model={pickCardModel}
      boards={boards || []}
      lists={lists || []}
      cards={pickCards}
      history={history}
    />
  ];
};

PageLink.propTypes = {
  pickCards: PropTypes.array.isRequired,
  searchCards: PropTypes.array.isRequired,
  onSelectCard: PropTypes.func,
  model: PropTypes.object,
  boards: PropTypes.array,
  lists: PropTypes.array,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onSearchChange: PropTypes.func,
};
export default PageLink;

