class TrelloCard {

  /**
   * @param {String} id
   * @param {String} name
   * @param {String} url
   * @param {String} description
   * @param {boolean} subscribed
   * @param {TrelloBoard} board
   * @param {TrelloList} list
   */
  constructor(id, name, url, description, subscribed, board, list) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.description = description;
    this.subscribed = subscribed;
    this.board = board;
    this.list = list;
  }
}

export default TrelloCard;
