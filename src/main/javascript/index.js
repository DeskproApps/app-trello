import ReactDOM from 'react-dom';
import { DeskproAppContainer } from '@deskproapps/deskproapps-sdk-react';
import TrelloApp from './TrelloApp';

export function runApp(app) {
  ReactDOM.render(
    <DeskproAppContainer app={app} name={'Trello'} mainComponent={TrelloApp} />,
    document.getElementById('deskpro-app')
  );
}
