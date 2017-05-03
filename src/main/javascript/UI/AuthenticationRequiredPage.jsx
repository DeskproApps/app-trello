import React from 'react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

const AuthenticationRequiredPage = ({ onAuthenticate }) => (
  <Layout.Section>
    <p>
      Sign into your Trello account to get started:
    </p>

    <Layout.Button primary onClick={onAuthenticate}>Login with Trello</Layout.Button>
  </Layout.Section>
);

AuthenticationRequiredPage.propTypes = {
  onAuthenticate: React.PropTypes.func.isRequired
};
export default AuthenticationRequiredPage;
