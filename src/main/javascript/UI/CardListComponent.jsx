import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Scrollbars } from 'react-custom-scrollbars';

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

function renderPeopleList(card) {
  return (<div>&nbsp;</div>);
}

function renderBoardName(card) {
  if (card.board) {
    return (
      <span><span>in </span> <span className="ui board-name dp-greyscale-750">{card.board.name}</span></span>
    );
  }

  return <span>&nbsp;</span>;
}

function renderListName(card) {
  if (card.list) {
    return (
      <span><span>on </span> <span className="ui list-name dp-greyscale-750">{card.list.name}</span></span>
    );
  }

  return <span>&nbsp;</span>;
}

function renderTitle(card) {
  return (<div className="ui card-title dp-greyscale-950">{card.name}</div>)
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
      fitted
      size="large"
      name={iconName}
      className="option"
      data-card-list-command={[command.name, cardIndex].join(':')}
    />
  );
}

function renderCardLocation(card, cardIndex)
{
  return (<span className="long-content">{renderBoardName(card)} {renderListName(card)}</span>);
}

/**
 * @param {Object} renderOptions
 * @param {TrelloCard} card
 * @param {Number} cardIndex
 * @param {Array<CardOption>} cardOptions
 */
function renderCard(renderOptions, card, cardIndex, cardOptions) {
  const options = cardOptions.map(cardOption => renderCardOption(card, cardIndex, cardOption));

  return (
    <div className="ui trelloapp-card-list-item">

      <div>
        <div className="options-hint">
          <i className="ellipsis horizontal large icon"/>
        </div>

        <div className="options">
          <nav>{options}</nav>
        </div>
      </div>

      <div className="link content dp-greyscale-500" data-card-list-command={['selectcard', cardIndex].join(':')}>
        {renderTitle(card)}
        {renderOptions.showCardLocation ? renderCardLocation(card, cardIndex) : null}
        {renderPeopleList(card)}
      </div>
    </div>
  );
}

const CardListComponent = ({ cards, showCardLocation, showBorder, onGotoCard, onUnlinkCard, onSelectCard }) => {

  if (! cards.length) {
    return null;
  }

  let command = null;
  const commands = [];
  const cardOptions = [];

  const renderOptions = { showCardLocation, showBorder };

  if (onGotoCard) {
    command = new CardCommand('gotocard', onGotoCard);
    commands.push(command);
    cardOptions.push(new CardOption('sign in', command));
  }

  if (onUnlinkCard) {
    command = new CardCommand('unlinkcard', onUnlinkCard);
    commands.push(command);
    cardOptions.push(new CardOption('broken chain', command));
  }

  if (onSelectCard) {
    command = new CardCommand('selectcard', onSelectCard);
    commands.push(command);
    cardOptions.push(new CardOption('chain', command));
  }

  const children = cards.map((card, cardIndex) => renderCard(renderOptions, card, cardIndex, cardOptions));
  const classNames = ['trelloapp-card-list'];
  if (!showBorder) {
    classNames.push('borderless');
  }
  return (
    <div onClick={createOnClickHandler(cards, commands)} className={classNames.join(' ')}>
      <Scrollbars renderThumbVertical={renderScrollbarThumb} autoHeightMax={400} autoHeight={true} autoHideTimeout={500}>
      {children}
      </Scrollbars>
    </div>
  );
};

const renderScrollbarThumb = ({ style, ...props }) => {
  const thumbStyle = {
    backgroundColor: "#cccccc",
    zIndex:400
  };
  return (
    <div
      style={{ ...style, ...thumbStyle }}
      {...props}/>
  );
};

CardListComponent.propTypes = {
  cards: React.PropTypes.array.isRequired,
  showCardLocation: React.PropTypes.bool,
  showBorder: React.PropTypes.bool,
  onGotoCard: React.PropTypes.func,
  onUnlinkCard: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
};

CardListComponent.defaultProps = {
  showCardLocation: true,
  showBorder: false
};
export default CardListComponent;
