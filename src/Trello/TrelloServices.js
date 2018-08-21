import * as TrelloParsers from './TrelloParsers';
import AuthenticationRequiredError from '../AuthenticationRequiredError';
import TrelloApiError from './TrelloApiError';

const trelloCardFields = [
  'idList',
  'idBoard',
  'id',
  'name',
  'url',
  'idMembers',
  'subscribed',
  'desc'
];

const trelloListCardFields = [
  'idBoard',
  'id',
  'name',
  'url',
  'idMembers',
  'subscribed',
  'desc'
];

const trelloBoardFields = [
  'id',
  'name',
  'url',
  'labelNames',
  'idOrganization',
];

const trelloListFields = [
  'id',
  'name',
];

/**
 * @param {Array} results
 * @param {'resolved'|'rejected'} status
 * @return {Array}
 */
function filterResultsByStatus(results, status) {
  const dataKey = status === 'resolved' ? 'value' : 'error';

  const accepted = [];
  for (const result of results) {
    if (result.status === status) {
      accepted.push(result[dataKey]);
    }
  }

  return accepted;
}

/**
 * @param {Array} results
 * @return {Array}
 */
const retainResolvedResults = (results) => filterResultsByStatus(results, 'resolved');

/**
 * Returns a function that is always successful
 *
 * @param {Promise} promise
 */
const promiseReflect = promise => promise.then(value => ({ value, status: 'resolved' }), error => ({ error, status: 'rejected' }));

/**
 * @param results
 * @return {Promise.<T>}
 */
const rejectPromiseAllWhenAuthenticationRequired = (results) => {
  const errors = filterResultsByStatus(results, 'rejected');
  if (errors.length) {
    for( const error in errors) {
      if (error instanceof AuthenticationRequiredError) {
        return Promise.reject(error);
      }
    }
  }

  return Promise.resolve(results);
};

const handleTrelloApiErrors = (err) => {
  let handledError;

  if (err instanceof TrelloApiError && err.response.status === 401) {
    handledError = new AuthenticationRequiredError('authentication error', err);
  } else {
    handledError = err;
  }

  return Promise.reject(handledError);
};

function buildCardPromise(trelloApiClient, cardId) {
  const executor = (resolve, reject) => {
    trelloApiClient.get(`/1/cards/${cardId}`, { fields: trelloCardFields.join(','), organization: true})
      .catch(handleTrelloApiErrors)
      .then(data => resolve(data), err => { reject(err) });
  };
  return promiseReflect(new Promise(executor));
}

function buildCardBoardPromise(trelloApiClient, card) {
  const { idBoard } = card;
  const executor = (resolve, reject) => {
    trelloApiClient.get(`/1/boards/${idBoard}`, { fields: trelloBoardFields.join(','), organization: true })
      .catch(handleTrelloApiErrors)
      .then(data => resolve(data), err => reject(err))
    ;

  };
  return promiseReflect(new Promise(executor));
}

function buildCardListPromise(trelloApiClient, card) {
  const { idList } = card;
  const executor = (resolve, reject) => {
    trelloApiClient.get(`/1/lists/${idList}`, { fields: trelloListFields.join(',')})
      .catch(handleTrelloApiErrors)
      .then(data => resolve(data), err => reject(err))
    ;
  };
  return promiseReflect(new Promise(executor));
}

function mergeCard(card, boards, lists) {
  const newCard = { board: null, list: null };
  const { idBoard, idList } = card;

  for (const board of boards) {
    if (board.id === idBoard) {
      newCard.board = board;
      break;
    }
  }

  for (const list of lists) {
    if (list.id === idList) {
      newCard.list = list;
      break;
    }
  }

  for (const key of Object.keys(card)) {
    newCard[key] = card[key];
  }
  return newCard;
}

function accumulateCards(accumulator, cards) {
  accumulator.cards = cards;
  return accumulator;
}

function accumulateBoardsAndLists(accumulator, boardsAndLists) {
  const boards = [];
  const lists = [];

  for (const boardOrList of boardsAndLists) {
    if (Object.prototype.hasOwnProperty.call(boardOrList, 'url')) {
      boards.push(boardOrList);
    } else {
      lists.push(boardOrList);
    }
  }

  accumulator.boards = boards;
  accumulator.lists = lists;
  return accumulator;
}

class TrelloServices
{

  /**
   * @param {TrelloApiClient} trelloApiClient
   */
  getAuthUser = (trelloApiClient) =>
  {
    return trelloApiClient.get('/1/members/me?fields=username,fullName').catch(handleTrelloApiErrors);
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {Array<String>} cardIdList
   * @return {Promise}
   */
  getCardList = (trelloApiClient, cardIdList) =>
  {
    if (!cardIdList || !cardIdList.length) {
      return Promise.resolve([]);
    }

    const cardListData = { cards: null, boards: null, lists: null };

    return Promise.all(cardIdList.map(cardId => buildCardPromise(trelloApiClient, cardId)))
      .then(rejectPromiseAllWhenAuthenticationRequired)
      .then(retainResolvedResults)
      .then(cards => accumulateCards(cardListData, cards))
      .then(accumulator => Promise.all(
        accumulator.cards.map(card => buildCardBoardPromise(trelloApiClient, card))
            .concat(accumulator.cards.map(card => buildCardListPromise(trelloApiClient, card)))
        )
        .then(rejectPromiseAllWhenAuthenticationRequired)
        .then(retainResolvedResults)
      )

      .then(boardsAndLists => accumulateBoardsAndLists(cardListData, boardsAndLists))
      .then(accumulator => {
        const { cards, boards, lists } = accumulator;
        return cards.map(card => mergeCard(card, boards, lists));
      })
      .then(cards => cards.map(TrelloParsers.parseTrelloCardJS))
    ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @return {Request|Promise.<TResult>|*}
   */
  getBoards = (trelloApiClient) =>
  {
    const args = { fields: trelloBoardFields.join(','), organization: true  };

    return trelloApiClient
      .get('/1/members/me/boards', args)
      .catch(handleTrelloApiErrors)
      .then(boards => boards.map(TrelloParsers.parseTrelloBoardJS))
    ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param boardId
   * @return {Request|Promise.<TResult>|*}
   */
  getBoardLabels = (trelloApiClient, boardId) =>
  {
    const args = { fields: trelloListFields.join(',') };

    return trelloApiClient
      .get(`/1/boards/${boardId}/labels`, args)
      .catch(handleTrelloApiErrors)
      .then(labels => labels.map(TrelloParsers.parseTrelloLabelJS))
      ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param boardId
   * @return {Request|Promise.<TResult>|*}
   */
  getBoardLists = (trelloApiClient, boardId) =>
  {
    const args = { fields: trelloListFields.join(',') };

    return trelloApiClient
      .get(`/1/boards/${boardId}/lists`, args)
      .catch(handleTrelloApiErrors)
      .then(boards => boards.map(TrelloParsers.parseTrelloListJS))
      ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param listId
   * @return {Request|Promise.<TResult>|*}
   */
  getListCards = (trelloApiClient, listId) =>
  {
    const args = { fields: trelloListCardFields.join(',') };

    return trelloApiClient
      .get(`/1/lists/${listId}/cards`, args)
      .catch(handleTrelloApiErrors)
      .then(cards => cards.map(TrelloParsers.parseTrelloCardJS))
      ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloBoard} board
   * @param labels
   */
  createLabels = (trelloApiClient, board, labels) =>
  {
    const mapper = (name) => {
      return trelloApiClient.post('/1/labels', { name, color: null, idBoard: board.id })
        .catch(handleTrelloApiErrors)
        .then(data => TrelloParsers.parseTrelloLabelJS(data))
      ;
    };

    const promiseList = labels.map(mapper);
    return Promise.all(promiseList).then(rejectPromiseAllWhenAuthenticationRequired);
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloCard} card
   */
  createCard = (trelloApiClient, card) =>
  {
    const { list } = card;
    if (!list || !list.id) {
      throw new Error('missing id from the list');
    }
    const apiRepresentation = TrelloParsers.trelloCardToJS(card);
    return trelloApiClient.post('/1/cards', apiRepresentation)
      .catch(handleTrelloApiErrors)
      .then(data => TrelloParsers.parseTrelloCardJS(data))
      ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloCard} card
   * @param {String} ticketUrl
   * @return {Promise}
   */
  createCardLinkedComment = (trelloApiClient, card, ticketUrl) =>
  {
    const comment = `Card linked to DeskPRO ticket: ${ticketUrl}`;
    return this.createComment(trelloApiClient, card, comment);
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloCard} card
   * @param {String} ticketUrl
   * @return {Promise}
   */
  createCardUnlinkedComment = (trelloApiClient, card, ticketUrl) =>
  {
    const comment = `Card **unlinked** from DeskPRO ticket: ${ticketUrl}`;
    return this.createComment(trelloApiClient, card, comment);
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloCard} card
   * @param {String} text
   * @return {Promise}
   */
  createComment = (trelloApiClient, card, text) =>
  {
    const { id } = card;
    if (!id) { throw new Error('missing card id'); }

    return trelloApiClient.post(`/1/cards/${card.id}/actions/comments`, { text }).catch(handleTrelloApiErrors);
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param {TrelloList} list
   */
  createList = (trelloApiClient, list) =>
  {
    const { board } = list;
    if (!board || !board.id) {
      throw new Error('failed to create list: missing board id');
    }
    const apiRepresentation = TrelloParsers.trelloListToJS(list);

    return trelloApiClient.post('/1/lists', apiRepresentation)
      .catch(handleTrelloApiErrors)
      .then(data => TrelloParsers.parseTrelloListJS(data))
      ;
  };

  /**
   * @param {TrelloApiClient} trelloApiClient
   * @param query
   * @return {Promise.<TResult>}
   */
  searchCards = (trelloApiClient, query) =>
  {
    const args = { query, card_fields: 'id', cards_limit: 25, modelTypes: 'cards' };
    return trelloApiClient.get('/1/search', args)
      .catch(handleTrelloApiErrors)
      .then(data => data.cards.map(card => card.id))
      .then(idList => this.getCardList(trelloApiClient, idList));
  };
}

export default TrelloServices;
