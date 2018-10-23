import React from 'react';
import PropTypes from 'prop-types';
import { Action, Panel } from '@deskpro/apps-components';

import CardListComponent from './CardListComponent';

const PageHome = ({ cards, onUnlinkCard, onSelectCard, loadBoards, history }) => {
  const openLink = () => {
    loadBoards().then(() => {
      history.push("link", null);
      history.go(1);
    });
  };

  const openCreate = () => {
    loadBoards().then(() => {
      history.push("create", null);
      history.go(1);
    });
  };

  return (
    <Panel title={"Linked cards"} border="none" className="dp-trello-container">
      <Action icon={"search"} label={"Find"} onClick={openLink}/>
      <Action icon={"add"} label={"Create"} onClick={openCreate}/>
      <CardListComponent cards={cards} onUnlinkCard={onUnlinkCard} onSelectCard={onSelectCard} />
    </Panel>
  )};

PageHome.propTypes = {
  cards: PropTypes.array.isRequired,
  onUnlinkCard: PropTypes.func,
  onSelectCard: PropTypes.func,
  loadBoards:   PropTypes.func,
};
export default PageHome;

