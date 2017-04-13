import ErrorWrapper from 'error-wrapper';

class AuthenticationRequiredError extends ErrorWrapper {

  get code() {
    return 'AuthenticationRequiredError';
  }
}

export default AuthenticationRequiredError;
