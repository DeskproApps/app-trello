import React from 'react';
import { Scrollbar, List, ListElement, Icon } from '@deskpro/react-components';

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

function renderBoardName(card, cardIndex) {
  if (card.board) {
    const commandAttributes = {
      'data-card-list-command': ['selectcard', cardIndex].join(':')
    };
    return (
    <span {...commandAttributes} className="small text">in <span {...commandAttributes} className="board-name small text">{card.board.name}</span></span>
    );
  }

  return <span>&nbsp;</span>;
}

function renderListName(card, cardIndex) {
  const commandAttributes = {
    'data-card-list-command': ['selectcard', cardIndex].join(':')
  };

  if (card.list) {
    return (
      <span {...commandAttributes} className="small text">on  <span {...commandAttributes} className="list-name small text">{card.list.name}</span></span>
    );
  }

  return <span {...commandAttributes} className="small text">&nbsp;</span>;
}


function renderCardLocation(card, cardIndex)
{
  const commandAttributes = {
    'data-card-list-command': ['selectcard', cardIndex].join(':')
  };
  return (<span className="long-content small text" {...commandAttributes}>{renderBoardName(card, cardIndex)} {renderListName(card, cardIndex)}</span>);
}

function renderTitle(card, cardIndex) {
  const commandAttributes = {
    'data-card-list-command': ['selectcard', cardIndex].join(':')
  };

  return (<div className="ui header card-title" {...commandAttributes}>{card.name}</div>)
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
      size="l"
      name={iconName}
      data-card-list-command={[command.name, cardIndex].join(':')}
    />
  );
}

function renderCardOptionsLayout(card, cardIndex, cardOptions) {
  const options = cardOptions.map(cardOption => renderCardOption(card, cardIndex, cardOption));

  if (options.length == 1) {
    return (
      <div className="options-single">
        <div className="options link">
          {options}
        </div>
      </div>
    );
  }

  return (
    <div className="options-multiple">
      <div className="options-hint">
        <i className="ellipsis horizontal large icon"/>
      </div>

      <div className="options link">
        <nav>{options}</nav>
      </div>
    </div>
  );
}

/**
 * @param {Object} renderOptions
 * @param {TrelloCard} card
 * @param {Number} cardIndex
 * @param {Array<CardOption>} cardOptions
 */
function renderCard(renderOptions, card, cardIndex, cardOptions) {
  return (
    <ListElement className="dp-trello-card-list-item">
      {renderCardOptionsLayout(card, cardIndex, cardOptions)}

      <div className="link content" data-card-list-command={['selectcard', cardIndex].join(':')}>
        {renderTitle(card, cardIndex)}
        {renderOptions.showCardLocation ? renderCardLocation(card, cardIndex) : null}
        {renderPeopleList(card, cardIndex)}
      </div>
    </ListElement>
  );
}

const CardListComponent = ({ cards, showCardLocation, showBorder, onGotoCard, onUnlinkCard, onSelectCard }) => {

  if (! cards.length) {
    return <noscript/>;
  }

  let command = null;
  const commands = [];
  const cardOptions = [];

  const renderOptions = { showCardLocation, showBorder };

  if (onGotoCard) {
    command = new CardCommand('gotocard', onGotoCard);
    commands.push(command);
    cardOptions.push(new CardOption('sign-in', command));
  }

  if (onUnlinkCard) {
    command = new CardCommand('unlinkcard', onUnlinkCard);
    commands.push(command);
    cardOptions.push(new CardOption('chain-broken', command));
  }

  if (onSelectCard) {
    command = new CardCommand('selectcard', onSelectCard);
    commands.push(command);
  }

  const children = cards.map((card, cardIndex) => renderCard(renderOptions, card, cardIndex, cardOptions));
  const classNames = ['dp-form-group'];

  return (
    <div onClick={createOnClickHandler(cards, commands)} className={classNames.join(' ')}>
      <Scrollbar renderThumbVertical={renderScrollbarThumb} autoHeightMax={400} autoHeight={true} autoHideTimeout={500}>
        <List className="dp-trello-card-list">
          {children}
        </List>
      </Scrollbar>
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
