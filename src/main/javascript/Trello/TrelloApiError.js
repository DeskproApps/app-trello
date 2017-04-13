import ErrorWrapper from 'error-wrapper';

class TrelloApiError extends ErrorWrapper {
  constructor(message, originalError, httpResponse) {
    super(message, originalError);
    this.httpResponse = httpResponse;
  }

  get response() {
    return this.httpResponse;
  }

  get code() {
    return 'TrelloApiError';
  }
}

export default TrelloApiError;
