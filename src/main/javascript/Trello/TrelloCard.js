class TrelloCard
{
  /**
   * @param {String} id
   * @param {String} name
   * @param {String} url
   * @param {String} description
   * @param {boolean} subscribed
   * @param {TrelloBoard} board
   * @param {TrelloList} list
   * @param {Array<TrelloLabel>} labels
   * */
  constructor({id, name, url, description, subscribed, board, list, labels}) {
    this.props = {
      id: id,
      name: name,
      url: url,
      description: description,
      subscribed: subscribed,
      board: board,
      list: list,
      labels: labels
    };
  }

  get id() { return this.props.id; }

  get name() { return this.props.name; }

  get url() { return this.props.url; }

  get description() { return this.props.description; }

  get subscribed() { return this.props.subscribed; }

  get board() { return this.props.board; }

  get list() { return this.props.list; }

  get labels() { return this.props.labels; }

  /**
   * @param {TrelloBoard} newBoard
   * @return {TrelloCard}
   */
  changeBoard = newBoard => {
    const { board, list, ...rest } = this.props;
    const newProps = Object.assign({}, this.props, { board: newBoard, list: null });

    return new TrelloCard(newProps);
  };

  /**
   * @param {TrelloList} newList
   * @return {TrelloCard}
   */
  changeList = newList => {
    const { board } = this.props;
    const newBoard = newList.board ? newList.board : board;

    const newProps = Object.assign({}, this.props, { board: newBoard, list: newList });
    return new TrelloCard(newProps);
  };
}

export default TrelloCard;

