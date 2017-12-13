import React from 'react';
import { Container, Button } from '@deskpro/react-components';

const AuthenticationRequiredPage = ({ onAuthenticate }) => (
  <Container class="dp-jira">
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
