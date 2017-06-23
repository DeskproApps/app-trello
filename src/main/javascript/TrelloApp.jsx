import React from 'react';

import * as TrellParsers from './Trello/TrelloParsers';
import { TrelloApiClient, TrelloApiError, TrelloServices, TrelloClientError, parseTrelloCardUrl } from './Trello';

import AuthenticationRequiredError from './AuthenticationRequiredError';
import { CreateCardSection, LinkedCardsSection, LinkToCardSection, PickCardSection, SearchCardSection, AuthenticationRequiredPage } from './UI';

export default class TrelloApp extends React.Component {

  static propTypes = { dpapp: React.PropTypes.object.isRequired };

  constructor(props) {
    super(props);
    this.initUiState = 'ticket-loaded';

    const key = '32388eb417f0326c4d75ab77c2a5d7e7';
    this.trelloApiClient = new TrelloApiClient(key);
    this.trelloServices = new TrelloServices();

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
      pickCardModel: null,

      refreshCount: 0
    };
  };

  shouldComponentUpdate (nextProps, nextState)
  {
    const shouldUpdate = this.state.uiState != nextState.uiState
      || this.state.authorizedUIState !== nextState.authorizedUIState
      || this.state.stateTransitionsCount !== nextState.stateTransitionsCount
      || this.state.refreshCount !== nextState.refreshCount
    ;

    if (shouldUpdate) {
      this.onStateChangeUpdateUI(nextState);
    }

    return shouldUpdate;
  }

  onStateChangeUpdateUI = (state) => {
    const { ui } = this.props.dpapp;
    const { ticketState } = state;

    ui.badgeCount = ticketState.trello_cards.length;
  };

  componentDidMount()
  {
    const { dpapp } = this.props;
    const { ticketId } = this.state.ticketState;

    dpapp.on('app.refresh', () => {
      this.sameUIStateTransition(Promise.resolve({ refreshCount: this.state.refreshCount + 1 }))
    });

    dpapp.on('ui.show-settings', this.onUIShowSettings);

    dpapp.ui.hideMenu();
    dpapp.ui.showBadgeCount();

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

  onUIShowSettings = () => { alert('on settings clicked'); };

  onExistingAuthStateReceived = (authState) =>
  {
    if (!authState) { return; }

    const { dpapp } = this.props;
    const { trelloApiClient, trelloServices } = this;
    const { appState } = this.props.dpapp;

    trelloApiClient.setToken(authState);
    trelloServices.getAuthUser(trelloApiClient)
      .then(data => {
        this.setState({ authState, authUser: data });
        dpapp.ui.showMenu();

        return data;
      })
      .catch(err => {
        if (err instanceof AuthenticationRequiredError) {
          return appState.asyncDeletePrivate('auth').then(() => Promise.reject(err));
        }
        return Promise.reject(err);
      });

  };

  onNewAuthStateReceived = (authState) =>
  {
    const { trelloApiClient, trelloServices } = this;

    if (authState) {
      const { authorizedUIState } = this;
      trelloApiClient.setToken(authState);

      const { appState, ui } = this.props.dpapp;

      return trelloServices.getAuthUser(trelloApiClient)
        .then(data => appState.asyncSetPrivate('auth', authState).then(() => data))
        .then(data => {
          this.setState({ authState, authUser: data, uiState: authorizedUIState });
          ui.showMenu();
          return authState;
        });
    }
  };

  onTicketStateReceived = newTicketState =>
  {
    const { trelloApiClient, trelloServices } = this;

    const uiState = this.getInitialUIState();
    const ticketState = newTicketState || this.state.ticketState; // TODO Must not overwrite state blindly like this !!!

    trelloServices.getCardList(trelloApiClient, ticketState.trello_cards)
      .then(linkedCards => this.setState({ ...uiState, ticketState, linkedCards }))
    ;
  };

  /**
   * @param {TrelloBoard} board
   * @param {Array<String>} labels
   */
  onCreateCardLabels = (board, labels) =>
  {
    if (labels.length === 0) {
      return [];
    }

    const { trelloApiClient, trelloServices } = this;
    const labelNames = labels.map (label => label.trim());

    return trelloServices.getBoardLabels(trelloApiClient, board.id)
      .then(labels => {

        if (labels.length === 0) {
          return { newLabels: labelNames, existingLabels: [] }
        }

        const existingLabelNames = labels.map(label => label.name);
        const newLabels = labelNames.filter(name => existingLabelNames.indexOf(name) === -1);
        const existingLabels = labels.filter(label => labelNames.indexOf(label.name) !== -1);

        return {newLabels, existingLabels};
      })
      .then(
        ({ newLabels, existingLabels }) => trelloServices.createLabels(trelloApiClient, board, newLabels).then(createdLabels => createdLabels.concat(existingLabels))
      );
  };

  /**
   * @param {TrelloCard} card
   */
  onCreateAndLinkTrelloCard = (card) =>
  {
    const { trelloApiClient, trelloServices } = this;
    const { list } = card;

    return Promise.resolve(card)
      .then(card => {
          if (!list.id) {
            return trelloServices.createList(trelloApiClient, list).then(newList => card.changeList(newList));
          }
          return card;
      })
      .then(card => trelloServices.createCard(trelloApiClient, card))
      .then(newCard => card.changeId(newCard.id))
      .then(newCard => this.onLinkTrelloCard(newCard))
      ;
  };

  /**
   * @param card
   * @return {Promise.<{ticketState: {trello_cards: Array.<*>}}>}
   */
  onLinkTrelloCard = (card) =>
  {
    const { ticketState, linkedCards } = this.state;
    const { ticketId } = this.state.ticketState;

    if (linkedCards.filter(linkedCard => linkedCard.id === card.id).length) {
      return Promise.resolve({ ticketState, linkedCards });
    }

    const newTicketState = Object.assign({}, ticketState, { trello_cards: [card.id].concat(ticketState.trello_cards) });
    const newLinkedCards = [card].concat(linkedCards);

    const { appState } = this.props.dpapp;
    const { tabUrl } = this.props.dpapp.context;
    const { trelloApiClient, trelloServices } = this;

    return appState
      .asyncSetShared(ticketId, newTicketState)
      .then(() => trelloServices.createCardLinkedComment(trelloApiClient, card, tabUrl))
      .then(() => ({ ticketState: newTicketState, linkedCards: newLinkedCards }))
      ;
  };

  /**
   * @param {TrelloCard} card
   */
  onUnlinkTrelloCard = (card) =>
  {
    const { ticketState, linkedCards } = this.state;
    const { ticketId } = this.state.ticketState;

    const newLinkedCards = linkedCards.filter(linkedCard => linkedCard.id !== card.id);
    if (newLinkedCards.length === linkedCards.length) { // card is not a previously linked card
      return Promise.resolve({});
    }
    const newTicketState = Object.assign({}, ticketState, { trello_cards: newLinkedCards.map(linkedCard => linkedCard.id) });

    const { appState } = this.props.dpapp;
    const { trelloApiClient, trelloServices } = this;
    const { tabUrl } = this.props.dpapp.context;

    return appState
      .asyncSetShared(ticketId, newTicketState)
      .then(() => trelloServices.createCardUnlinkedComment(trelloApiClient, card, tabUrl))
      .then(() => ({ ticketState: newTicketState, linkedCards: newLinkedCards }))
    ;
  };

  /**
   * @param {TrelloCard} card
   */
  onGoToTrelloCard = (card) =>
  {
    window.open(card.url, '_blank');
  };

  getInitialUIState = () =>
  {
    const { authState } = this.state;
    const authorizedUIState = 'ticket-loaded';
    const uiState = authState ? authorizedUIState : 'authentication-required';

    return { authorizedUIState, uiState };
  };

  onAuthenticate = () => {
    const authOptions = {
      expiration: 'never',
      interactive: true,
      name: 'Deskpro',
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

  retrieveTicketState = ticketId =>
  {
    const { appState } = this.props.dpapp;
    // notify dp the app is ready
    return appState.asyncGetShared(ticketId).then(state => this.onTicketStateReceived(state));
  };

  sameUIStateTransition = (transition) =>
  {
    const { uiState } = this.state;
    return this.nextUIStateTransition(uiState, transition);
  };

  /**
   * @param nextState
   * @param {Promise} transition
   */
  nextUIStateTransition = (nextState, transition) =>
  {
    const { dpapp } = this.props;
    const { stateTransitionsCount } = this.state;
    dpapp.ui.showLoading();

    return transition.then(
      value => {
        dpapp.ui.hideLoading();
        this.setState({ stateTransitionsCount: stateTransitionsCount+1, authorizedUIState: nextState, uiState: nextState, ...value });
        return Promise.resolve(value);
      },
      error => {
        dpapp.ui.hideLoading();

        if (error instanceof AuthenticationRequiredError) {
          this.setState({
            stateTransitionsCount: stateTransitionsCount+1,
            authorizedUIState: null,
            uiState: 'authentication-required'
          });
        }

        return Promise.reject(error) ;
      }
    );
  };

  renderAuthenticationRequired = () => (<AuthenticationRequiredPage onAuthenticate={this.onAuthenticate} />);

  renderCreateCard = () =>
  {
    const { loadBoardLists } = this;
    const { createCardModel, boards, lists } = this.state;

    const onCancel = () => {
      this.nextUIStateTransition('ticket-loaded', Promise.resolve({ createCardModel: null, boards:[], lists: [] }));
    };

    const onSubmit = (model) =>
    {
      const createCardPromise = Promise.resolve(model)
        .then(model => {
          if (! model.labels || 0 == model.labels.length) { return []; }

          const labels = model.labels.split(',');
          const board = boards.filter(board => board.id === model.board).pop();
          return this.onCreateCardLabels(board, labels)
        })
        .then(labels => TrellParsers.parseTrelloCardFormJS(model, boards, lists, labels))
        .then(trelloCard => this.onCreateAndLinkTrelloCard(trelloCard))
      ;

      this
        .nextUIStateTransition('ticket-loaded', createCardPromise)
        .then(nextState => ({ ...nextState, createCardModel: null, boards:[], lists: [] }));
    };

    const onChange = (key, value, model) => {
      let onChangePromise;

      if (key === 'board' && value) {
        const executor = data => {
          const listId =  data.lists && data.lists.length ? data.lists[0].id : null;
          return { ...data, createCardModel: {...model, list: listId} };
        };
        const board = boards.filter(board => board.id === value).pop();

        onChangePromise = loadBoardLists(board).then(executor);
      }

      if (onChangePromise) {
        this.sameUIStateTransition(onChangePromise.then(finalState => { return finalState; }));
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

  loadBoards = () =>
  {
    const { trelloApiClient, trelloServices } = this;

    const executor = boards => {
      if (boards.length === 0) { return { boards: [], lists: [], cards: [] }; }

      return this.loadBoardLists(boards[0]).then(data => ({ boards, ...data }));
    };

    return trelloServices.getBoards(trelloApiClient).then(executor);
  };

  /**
   * @param {TrelloBoard} board
   * @return {Request|Promise.<TResult>}
   */
  loadBoardLists = board =>
  {
    const { trelloApiClient, trelloServices } = this;

    return trelloServices
      .getBoardLists(trelloApiClient, board.id)
      .then(lists => {
        const boardLists = lists.map((list) => list.changeBoard(board));
        if (boardLists.length === 0) { return { lists: [], cards: [] }; }

        const executor = data => ({ lists: boardLists, ...data });
        return this.loadListCards(boardLists[0]).then(executor);
      });
  };

  /**
   * @param {TrelloList} list
   * @return {Request|Promise.<{cards: *}>}
   */
  loadListCards = list =>
  {
    const { trelloApiClient, trelloServices } = this;

    const setCardListExecutor = cards => cards.map(card => card.changeList(list));
    const executor = newCards => ({ cards: newCards });

    return trelloServices.getListCards(trelloApiClient, list.id)
      .then(setCardListExecutor)
      .then(executor)
      ;
  };

  renderPickCard = () =>
  {
    const { pickCardModel, boards, lists, cards } = this.state;
    const { loadBoardLists, loadListCards } = this;

    const onCancel = () => {
      this.nextUIStateTransition('ticket-loaded', Promise.resolve({ pickCardModel: null, cards: null, boards: [], lists: [] }));
    };

    const onChange = (key, value, model) => {
      let onChangePromise;
      const executor = data => ({ ...data, pickCardModel: model });

      if (key === 'board' && value) {
        const board = boards.filter(board => board.id === value).pop();
        onChangePromise = loadBoardLists(board).then(executor);
      } else if (key === 'list' && value) {
        const list = lists.filter(list => list.id === value).pop();
        onChangePromise = loadListCards(list).then(executor);
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

  renderSearchCard = () =>
  {
    const { trelloApiClient, trelloServices } = this;
    const { cards } = this.state;

    const onSearchChange = query => {
      const parsedCard = parseTrelloCardUrl(query);
      let onSearchPromise = null;

      if (parsedCard) {
        const { shortLink } = parsedCard;
        onSearchPromise = trelloServices.getCardList(trelloApiClient, [ shortLink ]).then(foundCards => ({ cards: foundCards }));
      } else {
        onSearchPromise = trelloServices.searchCards(trelloApiClient, query).then(foundCards => ({ cards: foundCards }));
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
    const { linkedCards } = this.state;

    const onCreate = () => {
      this.nextUIStateTransition('create-card', this.loadBoards());
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
        <LinkedCardsSection cards={linkedCards} onSelectCard={onGotoCard} onUnlinkCard={onUnlinkCard} />
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
