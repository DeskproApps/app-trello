import React from 'react';
import { Button, Container } from 'semantic-ui-react';

const AuthenticationRequiredPage = ({ onAuthenticate }) => (
  <Container>
    <p>
      Sign into your Trello account to get started:
    </p>

    <Button primary onClick={onAuthenticate}>Login with Trello</Button>
  </Container>
);

AuthenticationRequiredPage.propTypes = {
  onAuthenticate: React.PropTypes.func.isRequired
};
export default AuthenticationRequiredPage;
