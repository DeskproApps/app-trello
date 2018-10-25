import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, List, ListItem, Level, Menu, Action, ActionBar } from '@deskpro/apps-components';
import trelloLogo from '../trelloLogo.png';

class Card extends React.Component
{
  static propTypes = {
    renderOptions: PropTypes.object.isRequired,
    card:          PropTypes.object,
    cardIndex:     PropTypes.number,
    onUnlinkCard:  PropTypes.func,
    onSelectCard:  PropTypes.func,
  };

  /**
   * @param {TrelloCard} card
   * @param cardIndex
   * @param {{icon, name, handler}} cardAction
   * @return {XML}
   */
  static renderCardAction(card, cardIndex, cardAction) {

    const { icon, label, handler } = cardAction;

    return <Action key={label} label={label} icon={icon} onClick={() => handler(card)} />
  }

  constructor(props) {
    super(props);
    this.menu = React.createRef();

    this.state = {
      menuOpen: false,
      confirmUnlink: false,
    };
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeMenu);
  }

  toggleMenu = () => {
    if (this.state.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  };

  /**
   * @param {TrelloCard} card
   */
  static onGotoCard = (card) =>
  {
    window.open(card.url, '_blank');
  };

  openMenu = () => {
    this.setState({
      menuOpen: true
    });
    document.addEventListener('mousedown', this.closeMenu);
  };

  closeMenu = (e) => {
    if (e && this.menu.current && this.menu.current.contains(e.target)) {
      return;
    }
    this.setState({
      menuOpen: false,
      confirmUnlink: false
    });
    document.removeEventListener('mousedown', this.closeMenu);
  };

  confirmUnlink = () => {
    this.setState({
      confirmUnlink: true,
    });
  };

  /**
   * @param {Object} renderOptions
   * @param {TrelloCard} card
   * @param {Number} cardIndex
   * @param {Array} cardActions
   */
  render() {
    const { card, cardIndex, onSelectCard, onUnlinkCard } = this.props;
    const { menuOpen, confirmUnlink } = this.state;

    const cardActions = [
      {
        icon:     "open",
        label:     "Open",
        handler:   Card.onGotoCard
      }
    ];


    if (onSelectCard) {
      cardActions.push({
        icon:     "link",
        label:     "Link",
        handler:   onSelectCard
      });
    }

    if (onUnlinkCard) {
      if (confirmUnlink) {
        cardActions.push({
          label:     "Are you sure?",
          handler:   onUnlinkCard
        });
      } else {
        cardActions.push({
          icon:     "unlink",
          label:     "Unlink",
          handler:   this.confirmUnlink
        });
      }
    }

    return (
      <ListItem>

        <ActionBar
          title={<a href={card.url} target="_blank">{card.name}</a>}
          iconUrl={trelloLogo}
        >
          <Menu
            onClick={this.toggleMenu}
            isOpen={menuOpen}
            ref={this.menu}
          >
            { cardActions.map(action => Card.renderCardAction(card, cardIndex, action)) }
          </Menu>
        </ActionBar>

        <Level>
          <Level align={"left"} style={{flexShrink: 1}}>
              <span>{ card.board && card.board.name ? card.board.name : "" } &nbsp;|&nbsp; { card.list && card.list.name ? card.list.name : "" }</span>
          </Level>
          <Level align={"right"}>
            { card.members && card.members.length > 0 ? card.members.map(member =>
              <Avatar
                shape="round"
                src={`${member.avatarUrl}/30.png`}
                title={member.fullName}
              />
            ) : "" }
          </Level>
        </Level>


      </ListItem>
    );
  };
}

class CardListComponent extends React.PureComponent
{
  static propTypes = {
    cards: PropTypes.array.isRequired,
    showBorder: PropTypes.bool,
    onUnlinkCard: PropTypes.func,
    onSelectCard: PropTypes.func,
  };

  static defaultProps = {
    showBorder: false
  };

  render() {
    const { cards, showBorder, onUnlinkCard, onSelectCard } = this.props;

    if (! cards.length) {
      return <noscript/>;
    }

    const renderOptions = { showCardLocation: true, showBorder };


    return (
      <List className="dp-form-group dp-trello-card-list">
        {cards.map((card, cardIndex) =>
          <Card
            key={cardIndex}
            renderOptions={renderOptions}
            card={card}
            cardIndex={cardIndex}
            onSelectCard={onSelectCard}
            onUnlinkCard={onUnlinkCard}
          />
        )}
      </List>
    );
  }
}

export default CardListComponent;
