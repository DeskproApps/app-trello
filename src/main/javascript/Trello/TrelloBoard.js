class TrelloBoard {
  /**
   * @param {String} id
   * @param {String} name
   * @param url
   * @param labelNames
   */
  constructor({ id, name, url, labelNames }) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.labelNames = labelNames;
  }

  filterNewLabels = list => {
    if (list.length === 0) { return []; }

    const existingLabels = Object.keys(this.labelNames).reduce((acc, key) => acc.concat(this.labelNames[key]), []);
    return list.filter(newLabel => existingLabels.indexOf(newLabel) === -1)
  };
}

export default TrelloBoard;
