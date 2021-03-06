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
   * @param {Array<TrelloMember>} members
   * @param {Date|null} due
   * @param {Array<TrelloLabel>} labels
   * */
  constructor({id, name, url, description, subscribed, board, list, members, due, labels}) {

    this.props = {
      id,
      name,
      url,
      description,
      subscribed,
      board,
      list,
      members,
      due,
      labels
    };
  }

  get id() { return this.props.id; }

  get due() {
    if (this.props.due) {
      return new Date(this.props.due.getTime());
    }

    return null;
  }

  get name() { return this.props.name; }

  get url() { return this.props.url; }

  get description() { return this.props.description; }

  get subscribed() { return this.props.subscribed; }

  get board() { return this.props.board; }

  get list() { return this.props.list; }

  get labels() { return this.props.labels; }

  get members() { return this.props.members; }

  /**
   * @param {String} newUrl
   * @return {TrelloCard}
   */
  changeUrl = newUrl => {
    const newProps = Object.assign({}, this.props, { url: newUrl });

    return new TrelloCard(newProps);
  };

  /**
   * @param {String} newId
   * @return {TrelloCard}
   */
  changeId = newId => {
    const newProps = Object.assign({}, this.props, { id: newId });

    return new TrelloCard(newProps);
  };

  /**
   * @param {TrelloBoard} newBoard
   * @return {TrelloCard}
   */
  changeBoard = newBoard => {
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

