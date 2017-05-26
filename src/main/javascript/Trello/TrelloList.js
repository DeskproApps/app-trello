class TrelloList {
  /**
   * @param {String} id
   * @param {String} name
   * @param {TrelloBoard} board
   */
  constructor(id, name, board) {
    this.id = id;
    this.name = name;
    this.board = board;
  }

  changeBoard = board => new TrelloList(this.id, this.name, board);
}

export default TrelloList;
