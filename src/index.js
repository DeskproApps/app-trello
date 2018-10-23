/*
 * This is the main entry point for the browser. It's pre-configured
 * to boot the Deskpro Apps system and render your App. You usually
 * don't need to modify this unless you want to add some special
 * bootup behaviour.
 */

import { AppFrame } from '@deskpro/apps-components';
import { createApp } from '@deskpro/apps-sdk';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from "react-redux";
import { createMemoryHistory as createHistory } from "history";

import './styles.css';
import TrelloApp from './TrelloApp';
import store from './store';

const history = createHistory({
  initialEntries: ["loading"],
  initialIndex: 0
});

createApp(dpapp => props =>
  ReactDOM.render(
    <AppFrame {...props}>
      <Provider store={store}>
        <TrelloApp dpapp={dpapp} history={history}/>
      </Provider>
    </AppFrame>,
    document.getElementById('root')
  )
);
