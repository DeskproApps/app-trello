import React from 'react';
import { Layout, Form } from '@deskproapps/deskproapps-sdk-react';

import CardsListComponent from './CardListComponent';

/**
 * @param {Array<TrelloBoard>} boards
 * @param {Array<TrelloList>} lists
 */
function getFieldsDefinition(boards, lists) {
  return {
    board: {
      schema: {
        type: String,
        optional: false,
        allowedValues: boards.map(board => board.id)
      },
      ui: {
        placeholder: 'Please select',
        label: 'BOARD',
        transform(id) {
          for (const board of boards) {
            if (board.id === id) {
              return board.name;
            }
          }
        }
      }
    },
    list: {
      schema: {
        type: String,
        optional: false,
        allowedValues: lists.map(list => list.id)
      },
      ui: {
        placeholder: 'Please select',
        label: 'LIST',
        transform(id) {
          for (const list of lists) {
            if (list.id === id) {
              return list.name;
            }
          }
        }
      }
    }
  };
}

const PickCardSection = ({ onSelectCard, onGotoCard, onCancel, onSubmit, onChange, model, boards, lists, cards, ...otherProps }) => {
  const fields = getFieldsDefinition(boards || [], lists || []);

  return (
    <Layout.Section title="PICK AN EXISTING CARD">
      <Form.Form
        fields={fields}
        model={model}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={onCancel}
      >
        <Form.Fields fields={['board', 'list']} />
        <Layout.Block label="CARDS">
          <CardsListComponent cards={cards || []} onSelectCard={onSelectCard} showCardLocation={false} showBorder={true} />
        </Layout.Block>
      </Form.Form>
    </Layout.Section>
  );
};

PickCardSection.propTypes = {
  model: React.PropTypes.object,
  cards: React.PropTypes.array,
  boards: React.PropTypes.array,
  lists: React.PropTypes.array,
  onCancel: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onSelectCard: React.PropTypes.func,
  onGotoCard: React.PropTypes.func
};

export default PickCardSection;
