import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch,  } from 'react-router';
import { Loader} from '@deskpro/apps-components';

import * as TrellParsers from './Trello/TrelloParsers';
import { TrelloApiClient, TrelloServices, parseTrelloCardUrl } from './Trello';

import AuthenticationRequiredError from './AuthenticationRequiredError';
import {InstallError} from './InstallError';
import { CreateCardSection, PageHome, PageLink, AuthenticationRequiredPage } from './UI';

export default class TrelloApp extends React.Component {

  static propTypes = {
    /** router history object */
    history: PropTypes.object,
    /**
     * instance of app client.
     */
    dpapp: PropTypes.object,
  };

  constructor(props) {

    super(props);

    this.initUiState = 'ticket-loaded';

    const key = '32388eb417f0326c4d75ab77c2a5d7e7';
    this.trelloApiClient = new TrelloApiClient(key);
    this.trelloServices = new TrelloServices();
    this.stateTransitionCount = 0;
    this.customField = 'trelloCards';

    this.initState();

    //Here ya go
    this.props.history.listen(() => {
      this.updateBadge();
    });
  }

  initState = () => {
    const { history } = this.props;

    history.push("ticket-loaded", null);
    history.go(1);

    this.state = {
      authUser: null,
      authToken: null,
      authorizedUIState: null,
      pickCards: [],
      searchCards: [],
      boards: [],
      lists: [],

      stateTransitionsCount: 0,
      linkedCards: [],

      uiState: this.initUiState,

      createCardModel: null,
      pickCardModel: null,

      refreshCount: 0
    };
  };

  shouldComponentUpdate (nextProps, nextState)
  {
    const shouldUpdate = this.state.uiState !== nextState.uiState
      || this.state.authorizedUIState !== nextState.authorizedUIState
      || this.state.stateTransitionsCount !== nextState.stateTransitionsCount
      || this.state.refreshCount !== nextState.refreshCount
    ;

    return shouldUpdate;
  }

  componentDidMount()
  {
    const { history, dpapp } = this.props;
    dpapp.on('app.refresh', () => { this.sameUIStateTransition(Promise.resolve({})); });
    dpapp.on('ui.show-settings', this.onUIShowSettings);

    const { ui } = this.props.dpapp;
    ui.hideMenu();
    ui.hideBadgeCount();

    const { storage } = this.props.dpapp;

    const transitionPromise = storage.getAppStorage(['auth'])
      .then(({ auth}) => {
          if (auth) {
            return this.onExistingAuthStateReceived(auth);
          }
          return Promise.reject(new AuthenticationRequiredError('missing auth token'));
        }
      )
      .then((authState) => this.retrieveLinkedCards().then((linkedCards) => ({ ...authState, ...linkedCards })))
      .then(state => { ui.showMenu(); return state; })
      .catch(error => {

        let uiState = 'error';

        if (error instanceof AuthenticationRequiredError) {
          history.push("authentication-required", null);
          history.go(1);
        } else if (error instanceof InstallError) {
          history.push("admin-install-required", null);
          history.go(1);
        }

        return { uiState };
      })
    ;

    this.sameUIStateTransition(transitionPromise);
  }

  updateBadge = () => {
    const { linkedCards } = this.state;
    const { ui } = this.props.dpapp;

    if (linkedCards.length) {
      ui.showBadgeCount();
      ui.badgeCount = linkedCards.length;
    } else {
      ui.hideBadgeCount();
    }
  };

  onUIShowSettings = () => { alert('on settings clicked'); };

  onExistingAuthStateReceived = (authToken) =>
  {
    if (!authToken) { return {}; }
    const { trelloApiClient, trelloServices } = this;

    trelloApiClient.setToken(authToken);
    return trelloServices
      .getAuthUser(trelloApiClient)
      .then((data) => ({ authToken, authUser: data }))
      .catch(error => {
        console.log('ERROR: onExistingAuthStateReceived authentication failure', error);
        return Promise.reject(error);
      })
    ;
  };

  onNewAuthStateReceived = (authToken) =>
  {
    if (! authToken) { return {}; }

    const { trelloApiClient, trelloServices } = this;
    const { storage } = this.props.dpapp;

    trelloApiClient.setToken(authToken);

    return trelloServices.getAuthUser(trelloApiClient)
      .then(data => storage.setAppStorage('auth', authToken).then(() => data))
      .then(data => ({ authToken, authUser: data }))
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
      .then(newCard => card.changeId(newCard.id).changeUrl(newCard.url))
      .then(newCard => this.onLinkTrelloCard(newCard))
      ;
  };

  /**
   * @param {TrelloCard} card
   * @return {Promise.<{linkedCards: Array.<TrelloCard>}>}
   */
  onLinkTrelloCard = (card) =>
  {
    const { linkedCards } = this.state;

    if (linkedCards.filter(linkedCard => linkedCard.id === card.id).length) {
      return Promise.resolve({ linkedCards });
    }

    const newLinkedCards = [card].concat(linkedCards);
    const newLinkedCardIds = newLinkedCards.map(card => card.id);

    const { context } = this.props.dpapp;
    const { tabUrl } = this.props.dpapp.context.hostUI;
    const { trelloApiClient, trelloServices } = this;

    // return context.get('ticket').customFields.setField(`app:${this.props.dpapp.instanceId}:${this.customField}`, newLinkedCardIds)
    return context.get('ticket').customFields.setAppField(this.customField, newLinkedCardIds)
      .then(() => trelloServices.createCardLinkedComment(trelloApiClient, card, tabUrl))
      .then(() => ({ linkedCards: newLinkedCards }))
      ;
  };

  /**
   * @param {TrelloCard} card
   * @return {Promise.<{linkedCards: Array.<TrelloCard>}>}
   */
  onUnlinkTrelloCard = (card) =>
  {
    const { linkedCards } = this.state;

    const newLinkedCards = linkedCards.filter(linkedCard => linkedCard.id !== card.id);
    if (newLinkedCards.length === linkedCards.length) { // card is not a previously linked card
      return Promise.resolve({});
    }
    const newLinkedCardIds = newLinkedCards.map(card => card.id);

    const { trelloApiClient, trelloServices } = this;
    const { context } = this.props.dpapp;
    const { tabUrl } = context.hostUI;

    // return context.get('ticket').customFields.setField(`app:${this.props.dpapp.instanceId}:${this.customField}`, newLinkedCardIds)
    return context.get('ticket').customFields.setAppField(this.customField, newLinkedCardIds)
      .then(() => trelloServices.createCardUnlinkedComment(trelloApiClient, card, tabUrl))
      .then(() => ({ linkedCards: newLinkedCards }))
    ;
  };

  /**
   * @param {TrelloCard} card
   */
  onGoToTrelloCard = (card) =>
  {
    window.open(card.url, '_blank');
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
    const { trelloApiClient } = this;

    const transitionPromise = trelloApiClient.auth(authOptions)
      .then(() => trelloApiClient.token)
      .then(token => this.onNewAuthStateReceived(token))
      .then((authState) =>
        this.retrieveLinkedCards().then((linkedCardsState) => ({ ...authState, ...linkedCardsState }))
      );

    this.nextUIStateTransition(this.initUiState, transitionPromise)
  };

  retrieveLinkedCards = () =>
  {
    const { context } = this.props.dpapp;
    const { trelloApiClient, trelloServices } = this;

    // notify dp the app is ready
    // return context.get('ticket').customFields.getField(`app:${this.props.dpapp.instanceId}:${this.customField}`)
    return context.get('ticket').customFields.getAppField(this.customField)
      .then(cardIds => {
        if (cardIds instanceof Array && cardIds.length) {
          return trelloServices.getCardList(trelloApiClient, cardIds).then((linkedCards) => ({ linkedCards }));
        }
        return { linkedCards: [] };
      });
  };

  /**
   * @param {Promise} transition
   */
  sameUIStateTransition = (transition) =>
  {
    return this.nextUIStateTransition('', transition);
  };

  /**
   * @param nextUIState
   * @param {Promise} transition
   */
  nextUIStateTransition = (nextUIState, transition) =>
  {
    const { history } = this.props;

    if (nextUIState) {
      history.push(nextUIState, null);
      history.go(1);
    }


    const { dpapp } = this.props;
    const stateTransitionsCount = this.stateTransitionCount++;

    return transition.then(
      newState => {
        const nextState = {
          stateTransitionsCount,
          authorizedUIState: nextUIState,
          uiState: nextUIState,
          ...newState
        };

        this.setState(nextState);
        this.updateBadge();
        return Promise.resolve(newState);
      },
      error => {
        dpapp.ui.hideLoading();
        console.log('ERROR: nextUIStateTransition', error);

        if (error instanceof AuthenticationRequiredError) {
          console.log('[AUTH]: ERROR ', error);
          const nextState = {stateTransitionsCount, authorizedUIState: null, uiState: 'authentication-required'};
          this.setState(nextState);
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
    const { history } = this.props;

    const onSubmit = (model) =>
    {
      const createCardPromise = Promise.resolve(model)
        .then(model => {
          if (! model.labels || 0 === model.labels.length) { return []; }

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
      let stateChangePromise;

      if (key === 'board' && value) {
        const executor = data => {
          const listId =  data.lists && data.lists.length ? data.lists[0].id : null;
          return { ...data, createCardModel: {...model, list: listId} };
        };
        const board = boards.filter(board => board.id === value).pop();

        stateChangePromise = loadBoardLists(board).then(executor);
      }

      if (stateChangePromise) {
        this.sameUIStateTransition(stateChangePromise);
      }
    };

    return (
        <CreateCardSection
          onSubmit= {onSubmit}
          onChange= {onChange}
          model=    {createCardModel}
          boards=   {boards}
          lists=    {lists}
          history=  {history}
        />
    );
  };

  loadBoards = () =>
  {
    const { trelloApiClient, trelloServices } = this;

    const executor = boards => {
      if (boards.length === 0) {
        return this.setState({
          boards: [],
          lists: [],
          searchCards: [],
          pickCards: []
        });
      }

      this.setState({
        boards
      });
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
        if (boardLists.length === 0) { return { lists: [], searchCards: [], pickCards: [] }; }

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
    const executor = newCards => ({ pickCards: newCards, searchCards: [] });

    return trelloServices.getListCards(trelloApiClient, list.id)
      .then(setCardListExecutor)
      .then(executor)
      ;
  };

  renderPageLink = () => {
    const { trelloApiClient, trelloServices, loadBoardLists, loadListCards } = this;
    const { pickCardModel, boards, lists, searchCards, pickCards } = this.state;
    const { history } = this.props;

    const onChange = (key, value, model) => {
      let stateChangePromise;
      const executor = data => ({ ...data, pickCardModel: model });

      if (key === 'board' && value) {
        stateChangePromise = loadBoardLists(model.board).then(executor );
      } else if (key === 'list' && value) {
        stateChangePromise = loadListCards(model.list).then(executor);
      }

      if (stateChangePromise) {
        this.sameUIStateTransition(stateChangePromise);
      }
    };


    const onSearchChange = query => {
      const parsedCard = parseTrelloCardUrl(query);
      let onSearchPromise = null;

      if (parsedCard) {
        const { shortLink } = parsedCard;
        onSearchPromise = trelloServices.getCardList(trelloApiClient, [ shortLink ]).then(foundCards => ({ searchCards: foundCards, pickCards: [] }));
      } else {
        onSearchPromise = trelloServices.searchCards(trelloApiClient, query).then(foundCards => ({ searchCards: foundCards, pickCards: [] }));
      }

      if (onSearchPromise) {
        this.sameUIStateTransition(onSearchPromise);
      }

    };

    /**
     * @param {TrelloCard} card
     */
    const onSelectCard = (card) => {
      this.nextUIStateTransition('ticket-loaded', this.onLinkTrelloCard(card));
    };

    return (
      <PageLink
        pickCards={pickCards}
        searchCards={searchCards}
        onSelectCard={onSelectCard}
        onSearchChange={onSearchChange}
        history={history}
        onChange={onChange}
        model={pickCardModel}
        boards={boards || []}
        lists={lists || []}
      />
    );
  };

  renderPageHome = () => {
    const { history } = this.props;
    const { linkedCards } = this.state;


    /**
     * @param {TrelloCard} card
     */
    const onUnlinkCard = card => {
      this.sameUIStateTransition(this.onUnlinkTrelloCard(card));
    };

    return (
      <PageHome
          cards={linkedCards}
          onUnlinkCard={onUnlinkCard}
          loadBoards={this.loadBoards}
          history={history}
        />
    );
  };

  /**
   * @returns {*}
   */
  render() {
    const { history } = this.props;
    return (
      <Router history={history} >
        <Switch>
          <Route path="home" render={this.renderPageHome} />
          <Route path="error" render={() => <p>The app encountered an error. Try re-opening the ticket. </p>} />
          <Route path="admin-install-required" render={() => <p>Your admin has not installed the app yet.</p>} />
          <Route path="authentication-required" render={this.renderAuthenticationRequired} />
          <Route path="create" render={this.renderCreateCard} />
          <Route path="link" render={this.renderPageLink} />
          <Route path="ticket-loaded" render={this.renderPageHome} />
          <Route render={() => <Loader />} />
        </Switch>
      </Router>
    );
  }
}
