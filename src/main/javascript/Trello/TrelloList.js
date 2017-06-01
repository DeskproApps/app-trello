class TrelloList {
  /**
   * @param {String} id
   * @param {String} name
   * @param {TrelloBoard} board
   */
  constructor({id, name, board}) {
    this.props = {id, name, board};
  }

  get id() { return this.props.id; }

  get name() { return this.props.name; }

  get board() { return this.props.board; }

  changeBoard = board => new TrelloList({ id: this.props.id, name: this.props.name, board});
}

export default TrelloList;
