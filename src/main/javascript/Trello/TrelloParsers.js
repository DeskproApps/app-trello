import TrelloBoard from './TrelloBoard';
import TrelloCard from './TrelloCard';
import TrelloList from './TrelloList';

/**
 * @param board
 * @return {TrelloBoard}
 */
function parseTrelloBoardJS(board) {
  const { id, name, url, labelNames } = board;
  return new TrelloBoard({ id, name, url, labelNames });
}

/**
 * @param list
 * @return {TrelloList}
 */
function parseTrelloListJS(list) {
  const { id, name } = list;
  return new TrelloList(id, name);
}

/**
 * @param card
 * @return {TrelloCard}
 */
function parseTrelloCardJS(card) {
  const { list, board } = card;
  const parsedList = list ? parseTrelloListJS(list) : null;
  const parsedBoard = board ? parseTrelloBoardJS(board) : null;

  const { id, name, url, subscribed, desc } = card;

  return new TrelloCard(id, name, url, desc, subscribed, parsedBoard, parsedList);
}

/**
 * @param {{}} formModel
 * @param {Array<TrelloBoard>} boards
 * @param {Array<TrelloList>} lists
 * @return {TrelloCard}
 */
function parseTrelloCardFormJS(formModel, boards, lists) {
  const { title, description, subscribe } = formModel;

  let boardObject = null;
  if (formModel.board) {
    for (const board of boards) {
      if (board.id === formModel.board) {
        boardObject = board;
        break;
      }
    }
  }

  let listObject = null;
  if (formModel.list) {
    for (const list of lists) {
      if (list.id === formModel.list) {
        listObject = list;
        break;
      }
    }
  }

  return new TrelloCard(
    null,
    title,
    null,
    description,
    subscribe === 'yes',
    boardObject,
    listObject
  );
}

/**
 * @param {TrelloCard} trelloCard
 */
function trelloCardToJS(trelloCard) {

  const source = {
    id: undefined,
    name: undefined,
    url: undefined,
    idList: undefined,
    desc: undefined,
  };

  if (trelloCard.id) {
    source.id = trelloCard.id;
  }

  if (trelloCard.name) {
    source.name = trelloCard.name;
  }

  if (trelloCard.description) {
    source.desc = trelloCard.description;
  }

  if (trelloCard.list && trelloCard.list.id) {
    source.idList = trelloCard.list.id;
  }

  const target = {};
  for (const key of Object.keys(source)) {
    if (undefined !== source[key]) {
      target[key] = source[key];
    }
  }

  return target;
}

const parseTrelloCardJSList = list => list.map(card => parseTrelloCardJS(card));

export { parseTrelloCardJSList, parseTrelloCardJS, parseTrelloListJS, parseTrelloBoardJS, parseTrelloCardFormJS, trelloCardToJS };
