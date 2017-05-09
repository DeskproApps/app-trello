import { connect } from '@deskproapps/deskproapps-sdk-react';
import TrelloApp from './TrelloApp';

connect(TrelloApp, 'Trello').render('#deskpro-app');
