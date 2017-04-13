import React from 'react';
import { Segment, Divider, Icon } from 'semantic-ui-react';


const labelStyle = {
  border: 0,
  padding: 0
};

class CardCommand {
  /**
   * @param {String} name
   * @param {function} handler
   */
  constructor(name, handler) {
    this.name = name;
    this.handler = handler;
  }

  /**
   * @param {TrelloCard} card
   */
  handle(card) {
    this.handler(card);
  }
}

class CardOption {
  /**
   * @param {String} iconName
   * @param {CardCommand} command
   */
  constructor(iconName, command) {
    this.iconName = iconName;
    this.command = command;
  }
}

/**
 * @param {Array<TrelloCard>}cardList
 * @param {Array<CardCommand>} commands
 * @return {function(SyntheticEvent)}
 */
function createOnClickHandler(cardList, commands) {
  const commandNames = commands.map(command => command.name);

  const handleCommand = (commandString) => {
    const commandParts = commandString.split(':');

    let commandName = null;
    let cardIndex = null;
    if (commandParts instanceof Array && commandParts.length === 2) {
      commandName = commandParts[0];
      cardIndex = parseInt(commandParts[1], 10);
    }

    if (
      commandNames.indexOf(commandName) === -1
      || isNaN(cardIndex)
      || cardIndex < 0
      || cardIndex > cardList.length - 1
    ) {
      return;
    }

    const [command] = commands.filter(aCommand => aCommand.name === commandName);
    const card = cardList[cardIndex];
    command.handle(card);
  };

  /**
   * @param {SyntheticEvent} e
   */
  const handleOnClick = (e) => {
    const { target } = e;
    const optionAttribute = 'data-card-list-command';
    if (target.hasAttribute(optionAttribute)) {
      const command = target.getAttribute(optionAttribute);
      handleCommand(command);
    }
  };

  return handleOnClick;
}

function renderBoardName(card) {
  if (card.board) {
    return (
      <span>in <span className="ui label basic small grey compact" style={labelStyle}>{card.board.name}</span></span>
    );
  }

  return null;
}

function renderListName(card) {
  if (card.list) {
    return (
      <span>on <span className="ui label basic small grey compact" style={labelStyle}>{card.list.name}</span></span>
    );
  }

  return null;
}

function renderTitle(card) {
  return (<span className="ui label basic large compact" style={labelStyle}>{card.name}</span>)
}

/**
 * @param {TrelloCard} card
 * @param cardIndex
 * @param {CardOption} cardOption
 * @return {XML}
 */
function renderCardOption(card, cardIndex, cardOption) {
  const { command, iconName } = cardOption;
  return (
    <Icon
      key={['icon', command.name, card.id].join('-')}
      link
      fitted size="big"
      name={iconName}
      className="option"
      data-card-list-command={[command.name, cardIndex].join(':')}
    />
  );
}

/**
 * @param {TrelloCard} card
 * @param {Number} cardIndex
 * @param {Array<CardOption>} cardOptions
 */
function renderCard(card, cardIndex, cardOptions) {
  const options = cardOptions.map(cardOption => renderCardOption(card, cardIndex, cardOption));

  return (
    <Segment vertical raised={false} key={card.id} className="trelloapp-card-list-item link">
      <div className="content" data-card-list-command={['selectcard', cardIndex].join(':')}>
        {renderTitle(card)}
        <br />
        {renderBoardName(card)} {renderListName(card)}
      </div>

      <div className="options">
        {options}
      </div>
    </Segment>
  );
}

const CardListComponent = ({ cards, onGotoCard, onUnlinkCard, onSelectCard }) => {
  let command = null;
  const commands = [];
  const cardOptions = [];

  if (onGotoCard) {
    command = new CardCommand('gotocard', onGotoCard);
    commands.push(command);
    cardOptions.push(new CardOption('external', command));
  }

  if (onUnlinkCard) {
    command = new CardCommand('unlinkcard', onUnlinkCard);
    commands.push(command);
    cardOptions.push(new CardOption('broken chain', command));
  }

  if (onSelectCard) {
    command = new CardCommand('selectcard', onSelectCard);
    commands.push(command);
  }

  const children = cards.map((card, cardIndex) => renderCard(card, cardIndex, cardOptions));
  if (cards.length) {
    children.push((<Divider fluid basic fitted />));
  }

  return (
    <div onClick={createOnClickHandler(cards, commands)}>
      {children}
    </div>
  );
};

CardListComponent.propTypes = {
  cards: React.PropTypes.array.isRequired,
  onGotoCard: React.PropTypes.func,
  onUnlinkCard: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
};
export default CardListComponent;
