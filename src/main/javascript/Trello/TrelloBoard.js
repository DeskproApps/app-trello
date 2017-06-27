class TrelloBoard
{
  /**
   * @param {String} id
   * @param {String} name
   * @param {String} url
   * @param {Object} labelNames
   * @param {String} organizationId
   * @param {String} organizationName
   * @param {String} organizationDisplayName
   */
  constructor({ id, name, url, labelNames, organizationId, organizationName, organizationDisplayName }) {
    this.props = { id, name, url, labelNames, organizationId, organizationName, organizationDisplayName };
  }

  get id() { return this.props.id }

  get name() { return this.props.name }

  get url() { return this.props.url }

  get labels() { return this.props.labels }

  get organization() {
    return {
      id: this.props.organizationId,
      name: this.props.organizationName,
      displayName: this.props.organizationDisplayName
    };
  }

  get labelNames() {
    return Object.keys(this.props.labelNames).reduce((acc, key) => acc.concat(this.labelNames[key]), []);
  }

  filterNewLabels = list => {
    if (list.length === 0) { return []; }

    const existingLabels = Object.keys(this.props.labelNames).reduce((acc, key) => acc.concat(this.props.labelNames[key]), []);
    return list.filter(newLabel => existingLabels.indexOf(newLabel) === -1)
  };
}

export default TrelloBoard;
