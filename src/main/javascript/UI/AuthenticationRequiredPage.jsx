import React from 'react';
import PropTypes from 'prop-types';
import { Container, Button } from '@deskpro/react-components';

const AuthenticationRequiredPage = ({ onAuthenticate }) => (
  <Container className="dp-trello-container">
    <p>
      Sign into your Trello account to get started:
    </p>

    <Button onClick={onAuthenticate}>Login with Trello</Button>
  </Container>
);

AuthenticationRequiredPage.propTypes = {
  onAuthenticate: PropTypes.func.isRequired
};
export default AuthenticationRequiredPage;
