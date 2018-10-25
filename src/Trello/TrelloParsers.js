import TrelloBoard from './TrelloBoard';
import TrelloCard from './TrelloCard';
import TrelloList from './TrelloList';
import TrelloLabel from './TrelloLabel';
import TrelloMember from './TrelloMember';

/**
 * @param board
 * @return {TrelloBoard}
 */
function parseTrelloBoardJS(board) {
  const { id, name, url, labelNames, organization, idOrganization: organizationId } = board;

  let orgProps = {};
  if (organizationId) {
    let {name : organizationName, displayName: organizationDisplayName} = organization;
    orgProps = { organizationId, organizationName, organizationDisplayName }
  }
  const boardProps = { id, name, url, labelNames};
  const props = {...boardProps, ...orgProps};

  return new TrelloBoard(props);
}

/**
 * @param labelJS
 * @return {TrelloLabel}
 */
function parseTrelloLabelJS(labelJS) {
  return new TrelloLabel(labelJS);
}

/**
 * @param memberJS
 * @return {TrelloMember}
 */
function parseTrelloMemberJS(memberJS) {
  return new TrelloMember(memberJS);
}

/**
 * @param list
 * @return {TrelloList}
 */
function parseTrelloListJS(list) {
  const { id, name } = list;
  return new TrelloList({id, name, board:null});
}

/**
 * @param card
 * @return {TrelloCard}
 */
function parseTrelloCardJS(card) {

  const { list, board, members } = card;
  const parsedList = list ? parseTrelloListJS(list) : null;
  const parsedBoard = board ? parseTrelloBoardJS(board) : null;
  const parsedMembers = members ? members.map(member => parseTrelloMemberJS(member)) : [];

  const { id, name, url, subscribed, desc } = card;
  return new TrelloCard({ id, name, url, description: desc, subscribed, board: parsedBoard, list: parsedList, members: parsedMembers, due: null, labels: []});
}

/**
 * @param {{}} formModel
 * @param {Array<TrelloBoard>} boards
 * @param {Array<TrelloList>} lists
 * @param {Array<TrelloLabel>} labels
 * @return {TrelloCard}
 */
function parseTrelloCardFormJS(formModel, boards, lists, labels) {
  const { title, description, duedate } = formModel;

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

  if (formModel.newList) {
    listObject = new TrelloList({ name: formModel.newList, id: null, board: boardObject });
  } else if (formModel.list) {
    for (const list of lists) {
      if (list.id === formModel.list) {
        listObject = list;
        break;
      }
    }
  }

  const due = duedate instanceof Date ? duedate: null;
  return new TrelloCard({ id: '', name: title, url: '', description, subscribed: true, board: boardObject, list:listObject, due, labels });
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
    due: undefined
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

  if (trelloCard.due) {
    source.due = trelloCard.due;
  }

  const target = {};
  for (const key of Object.keys(source)) {
    if (undefined !== source[key]) {
      target[key] = source[key];
    }
  }

  if (trelloCard.labels.length) {
    target.idLabels = trelloCard.labels.map(label => label.id).join(',')
  }

  return target;
}

/**
 * @param {TrelloList} list
 */
const trelloListToJS = list => ({ name: list.name, idBoard: list.board.id  });

const parseTrelloCardJSList = list => list.map(card => parseTrelloCardJS(card));

export { parseTrelloCardJSList, parseTrelloCardJS, parseTrelloListJS, parseTrelloBoardJS, parseTrelloCardFormJS, trelloCardToJS, trelloListToJS, parseTrelloLabelJS, parseTrelloMemberJS };
