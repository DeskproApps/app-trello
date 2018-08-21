import React from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, Icon, Level, Action, ActionBar } from '@deskpro/apps-components';


/**
 * @param {TrelloCard} card
 * @param cardIndex
 * @param {{icon, name, handler}} cardAction
 * @return {XML}
 */
function renderCardAction(card, cardIndex, cardAction) {
  const { icon, label, handler } = cardAction;

  return <Action labelDisplay={"onHover"} label={label} icon={icon} onClick={() => handler(card)} />
}

/**
 * @param {Object} renderOptions
 * @param {TrelloCard} card
 * @param {Number} cardIndex
 * @param {Array} cardActions
 */
function renderCard(renderOptions, card, cardIndex, cardActions) {
  return (
    <ListItem onMouseOver={() => alert('sss')}>

      <ActionBar title={card.name}>
        { cardActions.map(action => renderCardAction(card, cardIndex, action)) }
      </ActionBar>

      {
        renderOptions.showCardLocation &&
        <Level>
          <Level align={"left"}>
            <b>Board</b>
          </Level>
          <Level align={"right"}>
            <span>{ card.board && card.board.name ? card.board.name : "" }</span>
          </Level>
        </Level>
      }

      {
        renderOptions.showCardLocation &&
        <Level>
          <Level align={"left"}>
            <b>List</b>
          </Level>
          <Level align={"right"}>
            <span>{ card.list && card.list.name ? card.list.name : "" }</span>
          </Level>
        </Level>
      }


    </ListItem>
  );
}



const CardListComponent = ({ cards, showCardLocation, showBorder, onGotoCard, onUnlinkCard, onSelectCard }) => {

  if (! cards.length) {
    return <noscript/>;
  }

  const cardActions = [];
  const renderOptions = { showCardLocation: true, showBorder };

  if (onGotoCard) {
    cardActions.push({
      icon:     "open",
      label:     "Open",
      handler:   onGotoCard
    });
  }

  if (onSelectCard) {
    cardActions.push({
      icon:     "link",
      label:     "Link",
      handler:   onSelectCard
    });
  }

  if (onUnlinkCard) {
    cardActions.push({
      icon:     "unlink",
      label:     "Unlink",
      handler:   onUnlinkCard
    });
  }


  return (
    <List className="dp-form-group dp-trello-card-list">
      {cards.map((card, cardIndex) => renderCard(renderOptions, card, cardIndex, cardActions))}
    </List>
  );
};

CardListComponent.propTypes = {
  cards: PropTypes.array.isRequired,
  showCardLocation: PropTypes.bool,
  showBorder: PropTypes.bool,
  onGotoCard: PropTypes.func,
  onUnlinkCard: PropTypes.func,
  onSelectCard: PropTypes.func,
};

CardListComponent.defaultProps = {
  showCardLocation: true,
  showBorder: false
};
export default CardListComponent;
