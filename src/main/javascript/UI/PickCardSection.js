import React from 'react';
import { Layout, Form } from '@deskproapps/deskproapps-sdk-react';

import CardsListComponent from './CardListComponent';

const transformListToOption = (list) => {
  return { value: list.id, label: list.name};
};

const transformBoardToOptionGroup = (board, defaultLabel) => {
  const {organization: org} = board;

  const label = org.id ? org.displayName ? org.displayName  : org.name : defaultLabel;
  return { label, options: [] };
};

const transformBoardToOption= (board, defaultGroup) => {
  const {organization: org} = board;

  const group = org.id ? org.displayName ? org.displayName  : org.name : defaultGroup;
  return {
    value: board.id,
    label: board.name,
    group
  };
};

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
        // allowed values will be constructed from the list of options returned by ui.options
        // allowedValues: boards.map(board => board.id)
      },
      ui: {
        placeholder: 'Please select',
        label: 'BOARD',
        groups() {
          const sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
          const unique = (item, pos, prevItem) => !pos || item != prevItem;
          const defaultLabel = 'Personal Boards';

          const groups = boards.map((board) => transformBoardToOptionGroup(board, defaultLabel))
              .sort((a,b) => sort(a.label, b.label))
              .filter((item, pos, ary) => unique(item.label, pos, pos ? ary[pos - 1].label : null))
            ;

          // put the default groups on top
          const groupsWithoutDefault = groups.filter((group) => group.label !== defaultLabel);
          if (groupsWithoutDefault.length === groups.length) { return groups; }

          const defaultGroups = groups.filter((group) => group.label === defaultLabel);
          return defaultGroups.concat(groupsWithoutDefault);
        },
        options() {
          const defaultGroup = 'Personal Boards';
          return boards.map((board) => transformBoardToOption(board, defaultGroup));
        }
      }
    },
    list: {
      schema: {
        type: String,
        optional: false,
        // allowed values will be constructed from the list of options returned by ui.options
        // allowedValues: lists.map(list => list.id)
      },
      ui: {
        placeholder: 'Please select',
        label: 'LIST',
        options() { return lists.map(transformListToOption); }
      }
    }
  };
}

const PickCardSection = ({ onSelectCard, onGotoCard, onCancel, onSubmit, onChange, model, boards, lists, cards, ...otherProps }) => {
  const fields = getFieldsDefinition(boards || [], lists || []);
  const defaultModel = { board: boards.length ? boards[0].id : null, list: lists.length ? lists[0].id : null };

  return (
    <Layout.Section title="PICK AN EXISTING CARD">
      <Form.Form
        fields={fields}
        model={model || defaultModel}
        onSubmit={onSubmit}
        onChange={onChange}
        onCancel={onCancel}
      >
        <Form.Fields fields={['board', 'list']} />
        <Layout.Block label="CARDS">
          <CardsListComponent cards={cards || []} onGotoCard={onGotoCard} onSelectCard={onSelectCard} showCardLocation={false} showBorder={true} />
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
