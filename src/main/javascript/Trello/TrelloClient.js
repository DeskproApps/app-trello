import * as TrelloParsers from './TrelloParsers';

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
];

const trelloListFields = [
  'id',
  'name',
];




const promiseReflect = promise => promise.then(value => ({ value, status: 'resolved' }), error => ({ error, status: 'rejected' }));

function buildCardPromise(trelloApiClient, cardId) {
  const executor = (resolve, reject) => {
    trelloApiClient
      .get(`/1/cards/${cardId}`, { fields: trelloCardFields.join(',')})
      .then(data => resolve(data), err => { reject(err) });
  };
  return promiseReflect(new Promise(executor));
}

function buildCardBoardPromise(trelloApiClient, card) {
  const { idBoard } = card;
  const executor = (resolve, reject) => {
    trelloApiClient
      .get(`/1/boards/${idBoard}`, { fields: trelloBoardFields.join(',')})
      .then(data => resolve(data), err => reject(err))
    ;

  };
  return promiseReflect(new Promise(executor));
}

function buildCardListPromise(trelloApiClient, card) {
  const { idList } = card;
  const executor = (resolve, reject) => {
    trelloApiClient
      .get(`/1/lists/${idList}`, { fields: trelloListFields.join(',')})
      .then(data => resolve(data), err => reject(err))
    ;
  };
  return promiseReflect(new Promise(executor));
}

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

class TrelloClient {

  /**
   * @param {TrelloApiClient} trelloApiClient
   */
  setApiClient = (trelloApiClient) => {
    this.trelloApiClient = trelloApiClient;
  };

  /**
   * @param {Array<String>} cardIdList
   */
  getCardList = (cardIdList) => {

    if (!cardIdList || !cardIdList.length) {
      return [];
    }

    const { trelloApiClient } = this;
    const cardListData = { cards: null, boards: null, lists: null };

    return Promise.all(cardIdList.map(cardId => buildCardPromise(trelloApiClient, cardId)))
      .then(results => filterResultsByStatus(results, 'resolved'))
      .then(cards => accumulateCards(cardListData, cards))
      .then(accumulator => Promise.all(
        accumulator.cards.map(card => buildCardBoardPromise(trelloApiClient, card))
            .concat(accumulator.cards.map(card => buildCardListPromise(trelloApiClient, card)))
        )
      )
      .then(results => filterResultsByStatus(results, 'resolved'))
      .then(boardsAndLists => accumulateBoardsAndLists(cardListData, boardsAndLists))
      .then(accumulator => {
        const { cards, boards, lists } = accumulator;
        return cards.map(card => mergeCard(card, boards, lists));
      })
      .then(cards => cards.map(TrelloParsers.parseTrelloCardJS))
    ;
  };

  getBoards = () => {
    const { trelloApiClient } = this;
    const args = { fields: trelloBoardFields.join(',') };

    return trelloApiClient
      .get('/1/members/me/boards', args)
      .then(boards => boards.map(TrelloParsers.parseTrelloBoardJS))
    ;
  };

  getBoardLists = (boardId) => {
    const { trelloApiClient } = this;
    const args = { fields: trelloListFields.join(',') };

    return trelloApiClient
      .get(`/1/boards/${boardId}/lists`, args)
      .then(boards => boards.map(TrelloParsers.parseTrelloListJS))
      ;
  };

  getListCards = (listId) => {
    const { trelloApiClient } = this;
    const args = { fields: trelloListCardFields.join(',') };

    return trelloApiClient
      .get(`/1/lists/${listId}/cards`, args)
      .then(cards => cards.map(TrelloParsers.parseTrelloCardJS))
      ;
  };

  /**
   * @param {TrelloCard} card
   */
  createCard = (card) => {
    const { list } = card;
    if (!list || !list.id) {
      throw new Error('missing id from the list');
    }
    const apiRepresentation = TrelloParsers.trelloCardToJS(card);
    const { trelloApiClient } = this;

    return trelloApiClient.post('/1/cards', apiRepresentation).then(data => TrelloParsers.parseTrelloCardJS(data));
  };

  searchCards = (query) => {
    const { trelloApiClient } = this;
    const args = { query, card_fields: 'id', cards_limit: 5, modelTypes: 'cards' };
    return trelloApiClient.get('/1/search', args).then(data => data.cards.map(card => card.id)).then(idList => this.getCardList(idList));
  };
}

export default TrelloClient;
