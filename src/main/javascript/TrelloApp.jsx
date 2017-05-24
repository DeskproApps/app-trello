import React from 'react';

import * as TrellParsers from './Trello/TrelloParsers';
import { TrelloApiClient, TrelloApiError, TrelloClient, TrelloClientError, parseTrelloCardUrl } from './Trello';

import AuthenticationRequiredError from './AuthenticationRequiredError';
import { CreateCardSection, LinkedCardsSection, LinkToCardSection, PickCardSection, SearchCardSection, AuthenticationRequiredPage } from './UI';

export default class TrelloApp extends React.Component {

  static propTypes = { dpapp: React.PropTypes.object.isRequired };

  constructor(props) {
    super(props);
    this.initUiState = '';

    const key = '32388eb417f0326c4d75ab77c2a5d7e7';
    this.trelloApiClient = new TrelloApiClient(key);
    this.trelloClient = new TrelloClient();

    this.initState();
  }

  initState = () => {
    const { entityId: ticketId } = this.props.dpapp.context;

    this.state = {
      authUser: null,
      authState: null,
      authorizedUIState: null,
      cards: null,
      boards: [],
      lists: [],

      stateTransitionsCount: 0,
      ticketState: { ticketId, trello_cards: [] },

      uiState: this.initUiState,

      createCardModel: null,
      pickCardModel: null
    };
  };

  shouldComponentUpdate (nextProps, nextState)
  {
    return this.state.uiState != nextState.uiState
      || this.state.authorizedUIState !== nextState.authorizedUIState
      || this.state.stateTransitionsCount !== nextState.stateTransitionsCount
    ;
  }

  componentDidMount() {
    const { dpapp } = this.props;
    const { ticketId } = this.state.ticketState;

    dpapp.on('ui.show-settings', this.onSettings);
    dpapp.ui.showLoading();
    dpapp.ui.hideMenu();

    const { appState } = this.props.dpapp;

    appState.asyncGetPrivate('auth')
      .then(state => this.onExistingAuthStateReceived(state))
      .then(() => this.retrieveTicketState(ticketId))
      .catch(err => {
        if (err instanceof AuthenticationRequiredError) {
          this.setState({ uiState: 'authentication-required' });
        }
        return err;
      })
      .then(mixed => {
        dpapp.ui.hideLoading();
        return mixed;
      })
      .then(mixed => {
        if (mixed instanceof Error) {
          throw mixed;
        }
        return mixed;
      })
    ;
  }

  onSettings = () => { alert('on settings clicked'); };

  onExistingAuthStateReceived = (authState) => {
    const { dpapp } = this.props;
    const { trelloApiClient, trelloClient } = this;

    if (authState) {
      trelloApiClient.setToken(authState);
      return this.verifyTrelloAuthentication()
        .then(data => {
          trelloClient.setApiClient(trelloApiClient);
          this.setState({ authState, authUser: data });
          dpapp.ui.showMenu();
          return data;
        });
    }
  };

  onNewAuthStateReceived = (authState) => {
    const { trelloApiClient, trelloClient } = this;

    if (authState) {
      const { authorizedUIState } = this.state;
      trelloApiClient.setToken(authState);
      trelloClient.setApiClient(trelloApiClient);

      const { appState, ui } = this.props.dpapp;

      return this.retrieveTrelloAuthUser()
        .then(data => appState.asyncSetPrivate('auth', authState).then(() => data))
        .then(data => {
          this.setState({ authState, authUser: data, uiState: authorizedUIState });
          ui.showMenu();
          return authState;
        });
    }
  };

  onTicketStateReceived = newTicketState => {
    const uiState = this.getInitialUIState();
    const ticketState = newTicketState || this.state.ticketState; // TODO Must not overwrite state blindly like this !!!

    this.trelloClient
      .getCardList(ticketState.trello_cards)
      .then(linkedCards => this.setState({ ...uiState, ticketState, linkedCards }))
    ;
  };

  /**
   * @param card
   * @return {Promise.<{ticketState: {trello_cards: Array.<*>}}>}
   */
  onLinkTrelloCard = (card) => {
    const { ticketState, linkedCards } = this.state;
    const { ticketId } = this.state.ticketState;

    const newTicketState = Object.assign({}, ticketState, { trello_cards: [card.id].concat(ticketState.trello_cards) });
    const newLinkedCards = [card].concat(linkedCards);

    const { appState } = this.props.dpapp;

    return appState
      .asyncSetShared(ticketId, newTicketState)
      .then(() => ({ ticketState: newTicketState, linkedCards: newLinkedCards }))
    ;
  };

  /**
   * @param {TrelloCard} card
   */
  onCreateAndLinkTrelloCard = (card) => {
    const { trelloClient } = this;
    return trelloClient.createCard(card).then(newCard => this.onLinkTrelloCard(newCard));
  };

  /**
   * @param {TrelloCard} card
   */
  onUnlinkTrelloCard = (card) => {
    const { ticketState, linkedCards } = this.state;
    const { ticketId } = this.state.ticketState;

    const newLinkedCards = linkedCards.filter(linkedCard => linkedCard.id !== card.id);
    if (newLinkedCards.length === linkedCards.length) { // card is not a previously linked card
      return Promise.resolve({});
    }
    const newTicketState = Object.assign({}, ticketState, { trello_cards: newLinkedCards.map(linkedCard => linkedCard.id) });

    const { appState } = this.props.dpapp;

    return appState
      .asyncSetShared(ticketId, newTicketState)
      .then(() => ({ ticketState: newTicketState, linkedCards: newLinkedCards }))
    ;
  };

  /**
   * @param {TrelloCard} card
   */
  onGoToTrelloCard = (card) => {
    window.open(card.url, '_blank');
  };

  getInitialUIState = () => {
    const { authState } = this.state;
    const authorizedUIState = 'ticket-loaded';
    const uiState = authState ? authorizedUIState : 'authentication-required';

    return { authorizedUIState, uiState };
  };

  onAuthenticate = () => {
    const authOptions = {
      expiration: '1hour',
      interactive: true,
      name: 'Deskpro Trello App',
      persist: false,
      scope: {
        read: true,
        write: true
      },
      type: 'popup',
    };
    const { dpapp } = this.props;
    const { trelloApiClient } = this;
    const { ticketId } = this.state.ticketState;

    trelloApiClient.auth(authOptions)
      .then(() => trelloApiClient.token)
      .then(token => this.onNewAuthStateReceived(token))
      .then(() => this.retrieveTicketState(ticketId))
      .catch(err => { console.log('on authenticate error ', err); return err; })
      .then(mixed => {
        dpapp.ui.hideLoading();
        return mixed;
      });
  };

  verifyTrelloAuthentication = () => {
    const { appState } = this.props.dpapp;

    return this.trelloApiClient.get('/1/members/me?fields=username,fullName')
      .catch(err => {
        if (err instanceof TrelloApiError && err.response.status === 401) {
          return appState.asyncDeletePrivate('auth').then(() => new AuthenticationRequiredError('authentication error', err));
        }
        return err;
      })
      .then(mixed => {
        if (mixed instanceof Error) {
          throw mixed;
        }
        return mixed;
      });
  };

  retrieveTicketState = ticketId => {
    const { appState } = this.props.dpapp;
    // notify dp the app is ready
    return appState.asyncGetShared(ticketId).then(state => this.onTicketStateReceived(state));
  };

  retrieveTrelloAuthUser = () => this.trelloApiClient.get('/1/members/me?fields=username,fullName');

  sameUIStateTransition = (transition) => {
    const { uiState } = this.state;
    return this.nextUIStateTransition(uiState, transition);
  };

  /**
   * @param nextState
   * @param {Promise} transition
   */
  nextUIStateTransition = (nextState, transition) => {

    const { dpapp } = this.props;
    const { stateTransitionsCount } = this.state;
    dpapp.ui.showLoading();

    return transition.then(
      value => {
        dpapp.ui.hideLoading();
        this.setState({ stateTransitionsCount: stateTransitionsCount+1, authorizedUIState: nextState, uiState: nextState, ...value });
        return value;
      },
      error => {
        dpapp.ui.hideLoading();

        return error;
      }
    );
  };

  renderAuthenticationRequired = () => (<AuthenticationRequiredPage onAuthenticate={this.onAuthenticate} />);

  renderCreateCard = () => {
    const { trelloClient } = this;
    const { createCardModel, boards, lists } = this.state;

    const onCancel = () => {
      this.nextUIStateTransition('ticket-loaded', Promise.resolve({ createCardModel: null }));
    };

    const onSubmit = (model) => {
      // should be sent somewhere
      this.setState({ createCardModel: model });
      const trelloCard = TrellParsers.parseTrelloCardFormJS(model, boards, lists);

      this.nextUIStateTransition(
        'ticket-loaded',
        this.onCreateAndLinkTrelloCard(trelloCard).then(nextState => ({ ...nextState, createCardModel: null}))
      );
    };

    const onChange = (key, value, model) => {
      if (key === 'board' && value) {
        this.sameUIStateTransition(trelloClient.getBoardLists(value).then(newLists => ({ lists: newLists, createCardModel: model })));
      }
    };

    return (
      <div>
        <CreateCardSection
          onCancel={onCancel}
          onSubmit={onSubmit}
          onChange={onChange}
          model={createCardModel}
          boards={boards}
          lists={lists}
        />
      </div>
    );
  };

  loadBoards = () => {
    const { trelloClient } = this;

    const executor = boards => {
      if (boards.length === 0) { return { boards: [], lists: [], cards: [] }; }

      const { id } = boards[0];
      return this.loadBoardLists(id).then(data => ({ boards, ...data }));
    };

    return trelloClient.getBoards().then(executor);
  };

  loadBoardLists = boardId => {
    const { trelloClient } = this;

    return trelloClient
      .getBoardLists(boardId)
      .then(lists => {
        if (lists.length === 0) { return { lists: [], cards: [] }; }

        const { id } = lists[0];
        const executor = data => ({ lists, ...data });

        return this.loadListCards(id).then(executor);
      });
  };

  loadListCards = listId => {
    const { trelloClient } = this;
    const executor = newCards => ({ cards: newCards });

    return trelloClient.getListCards(listId).then(executor);
  };

  renderPickCard = () => {
    const { pickCardModel, boards, lists, cards } = this.state;
    const { loadBoardLists, loadListCards } = this;

    const onCancel = () => {
      this.nextUIStateTransition('ticket-loaded', Promise.resolve({ pickCardModel: null, cards: null, boards: [], lists: [] }));
    };

    const onChange = (key, value, model) => {
      let onChangePromise;
      const executor = data => ({ ...data, pickCardModel: model });

      if (key === 'board' && value) {
        onChangePromise = loadBoardLists(value).then(executor);
      } else if (key === 'list' && value) {
        onChangePromise = loadListCards(value).then(executor);
      }

      if (onChangePromise) {
        this.sameUIStateTransition(onChangePromise.then(finalState => { return finalState; }));
      }
    };

    /**
     * @param {TrelloCard} card
     */
    const onSelectCard = (card) => {
      this.nextUIStateTransition('ticket-loaded', this.onLinkTrelloCard(card));
    };

    const onGotoCard = this.onGoToTrelloCard;

    return (
      <div>
        <PickCardSection
          onGotoCard={onGotoCard}
          onSelectCard={onSelectCard}
          onCancel={onCancel}
          onChange={onChange}
          model={pickCardModel}
          boards={boards}
          lists={lists}
          cards={cards}
        />
      </div>
    );
  };

  renderSearchCard = () => {
    const { trelloClient } = this;
    const { cards } = this.state;

    const onSearchChange = query => {
      const parsedCard = parseTrelloCardUrl(query);
      let onSearchPromise = null;

      if (parsedCard) {
        const { shortLink } = parsedCard;
        onSearchPromise = trelloClient.getCardList([ shortLink ]).then(foundCards => ({ cards: foundCards }));
      } else {
        onSearchPromise = trelloClient.searchCards(query).then(foundCards => ({ cards: foundCards }));
      }

      if (onSearchPromise) {
        this.sameUIStateTransition(onSearchPromise);
      }

    };

    const onCancel = () => {
      this.nextUIStateTransition('ticket-loaded', Promise.resolve({ cards: [] }));
    };

    /**
     * @param {TrelloCard} card
     */
    const onSelectCard = (card) => {
      this.nextUIStateTransition('ticket-loaded', this.onLinkTrelloCard(card));
    };

    const onGotoCard = this.onGoToTrelloCard;

    return (
      <div>
        <SearchCardSection
          cards={cards}
          onGotoCard={onGotoCard}
          onSelectCard={onSelectCard}
          onCancel={onCancel}
          onSearchChange={onSearchChange}
        />
      </div>
    );
  };

  renderTicketLoaded = () => {
    const { trelloClient } = this;
    const { linkedCards } = this.state;

    const onCreate = () => {
      this.nextUIStateTransition('create-card', trelloClient.getBoards().then(boards => ({ boards })));
    };

    const onPick = () => {
      this.nextUIStateTransition('pick-card', this.loadBoards());
    };

    const onSearch = () => {
      this.nextUIStateTransition('search-card', Promise.resolve({ cards: [] }));
    };

    const onGotoCard = this.onGoToTrelloCard;

    /**
     * @param {TrelloCard} card
     */
    const onUnlinkCard = card => {
      this.sameUIStateTransition(this.onUnlinkTrelloCard(card));
    };

    return (
      <div>
        <LinkedCardsSection cards={linkedCards} onGotoCard={onGotoCard} onUnlinkCard={onUnlinkCard} />
        <LinkToCardSection onPick={onPick} onCreate={onCreate} onSearch={onSearch} />
      </div>
    );
  };

  render() {
    const { uiState } = this.state;

    switch (uiState) {
      case 'authentication-required':
        return this.renderAuthenticationRequired();
      case 'create-card':
        return this.renderCreateCard();
      case 'pick-card':
        return this.renderPickCard();
      case 'search-card':
        return this.renderSearchCard();
      case 'ticket-loaded':
        return this.renderTicketLoaded();
      default:
        return null;
    }
  }
}
