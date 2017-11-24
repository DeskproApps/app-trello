import ErrorWrapper from 'error-wrapper';

class InstallError extends ErrorWrapper {

  static get CODE_NOT_AUTHORIZED() { return 'not-authorized'; } ;

  static get CODE_INSTALL_REQUIRED() { return 'install-required'; } ;

  static notAuthorizedError() { return new InstallError('insufficient privileges', InstallError.CODE_NOT_AUTHORIZED); }

  static installRequiredError() { return new InstallError('install required', InstallError.CODE_INSTALL_REQUIRED); }

  constructor (message, code)
  {
    super(message);
    this.props = { code }
  }

  get code() { return this.props.code; }
}

export { InstallError };
