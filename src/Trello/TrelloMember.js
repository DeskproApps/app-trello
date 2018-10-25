class TrelloMember {
  /**
   * @param {String} id
   * @param {String} avatarUrl
   * @param {String} fullName
   */
  constructor({ id, avatarUrl, fullName }) {
    this.id = id;
    this.avatarUrl = avatarUrl;
    this.fullName = fullName;
  }

}

export default TrelloMember;
