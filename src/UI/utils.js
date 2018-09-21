
const groupBoards = (groups, board) => {

  const { group } = board;
  const option = groups[group];
  if (option) {
    option.options.push(board);
  } else {
    groups[group] = {
      label: group,
      options: [board]
    };
  }

  return groups;
};

/**
 * @param {String} defaultGroup
 * @return {function(*): {value: *, label: *, group: *}}
 */
export function boardToOption (defaultGroup) {
  return board => {
    const {organization: org} = board;

    const group = org && org.id ? org.displayName ? org.displayName : org.name : defaultGroup;
    return {
      value: board.id,
      label: board.name,
      group
    };
  }
}

/**
 * @param {Array<{}>} boards
 * @param {String} defaultGroup
 * @return {Array<{ label:String, options:Array }>}
 */
export function boardsToOptions(boards, defaultGroup)
{
  const boardGroups = boards.map(boardToOption(defaultGroup)).reduce(groupBoards, {});
  return Object.keys(boardGroups).map(key => boardGroups[key]);
}

/**
 * @param {{id, name}} list
 * @return {{value: *, label: *}}
 */
export function listToOption (list) {
  return {
    value: list.id,
    label: list.name,
  };
}




