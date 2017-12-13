import ReactDOM from 'react-dom';
import { DeskproSDK, configureStore } from '@deskpro/apps-sdk-react';
import TrelloApp from './TrelloApp';

export function runApp(app) {

  const store = configureStore(app);

  ReactDOM.render(
    <DeskproSDK dpapp={app} store={store} component={TrelloApp} />,
    document.getElementById('deskpro-app')
  );

}
