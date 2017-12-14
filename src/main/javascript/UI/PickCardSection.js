import React from 'react';
import { Form, Select, validators } from '@deskpro/react-components/lib/bindings/redux-form';
import { Heading, Button, Container, Group, Label } from '@deskpro/react-components';

import CardsListComponent from './CardListComponent';

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

const PickCardSection = ({ onSelectCard, onGotoCard, onCancel, onChange, model, boards, lists, cards, ...otherProps }) => {
  const board = model && model.board ? model.board : boards.length ? boards[0] : null;
  const list = model && model.list ? model.list : lists.length ? lists[0] : null;

  const onModelChange = (value, key) => {
    let nextModel = null;

    if (key === 'board') {
      const board = boards.filter(board => board.id === value).pop();
      nextModel  = {...model, board };
    } else if (key === 'list') {
      const list = lists.filter(list => list.id === value).pop();
      nextModel  = {...model, list }
    }

    if (nextModel) {
      onChange(key, value, nextModel);
    }
  };

  return (
    <Container className="dp-trello-container">
      <Heading size={2}>PICK A CARD</Heading>
      <Form name="pick_card" initialValues={{
        board: model && model.board ? model.board.id : boards.length ? boards[0].id : null,
        list: lists.length ? lists[0].id : null
      }}>

        <Select
          id="board"
          name="board"
          label="Board"
          value={ board ? board.id : null }
          options={ boards.map(board => transformBoardToOption(board, 'Personal Boards')) }
          validate={ validators.required }
          onChange={ onModelChange }
        />

        <Select
          id="list"
          name="list"
          label="List"
          value={ list ? list.id : null }
          options={ lists.map(list => ({ value: list.id, label: list.name})) }
          validate={ validators.required }
          onChange={ onModelChange }
        />

        <Group label="Cards" >
          <CardsListComponent cards={cards || []} onGotoCard={onGotoCard} onSelectCard={onSelectCard} showCardLocation={false} showBorder={true} />
        </Group>

        <Button onClick={(e) => { e.preventDefault(); onCancel(e); }}>
          Cancel
        </Button>
      </Form>
    </Container>
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
