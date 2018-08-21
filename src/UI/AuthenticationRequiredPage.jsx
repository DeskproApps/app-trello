import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Button } from '@deskpro/apps-components';

const AuthenticationRequiredPage = ({ onAuthenticate }) => (
  <Panel title={"Sign in"}>
    <p>
      Sign into your Trello account to get started:
    </p>

    <Button onClick={onAuthenticate}>Login with Trello</Button>
  </Panel>
);

AuthenticationRequiredPage.propTypes = {
  onAuthenticate: PropTypes.func.isRequired
};
export default AuthenticationRequiredPage;
