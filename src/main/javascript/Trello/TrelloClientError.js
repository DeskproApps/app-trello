import ErrorWrapper from 'error-wrapper';

class TrelloClientError extends ErrorWrapper {
  constructor(message, originalError, httpResponse) {
    super(message, originalError);
    this.httpResponse = httpResponse;
  }

  get response() {
    return this.httpResponse;
  }

  get code() {
    return 'TrelloClientError';
  }
}

export default TrelloClientError;
