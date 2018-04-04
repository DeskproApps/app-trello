import React from "react";
import PropTypes from 'prop-types';

import { Form, Input, Textarea, Datepicker, Select, validators } from '@deskpro/redux-components';
import { Heading, Button, Container, HiddenFields } from '@deskpro/react-components';
import { SubmitButton } from './SubmitButton';

const createNewListOption = { value: 'trello.newList', label: '--- CREATE LIST ---' };

const transformBoardToOptionGroup = (board, defaultLabel) => {
  const {organization: org} = board;

  const label = org.id ? org.displayName ? org.displayName  : org.name : defaultLabel;
  return { label, options: [] };
};

const transformBoardToOption = (board, defaultGroup) => {
  const {organization: org} = board;

  const group = org.id ? org.displayName ? org.displayName  : org.name : defaultGroup;
  return {
    value: board.id,
    label: board.name,
    group
  };
};

class CreateCardSection extends React.Component {

  static propTypes = {
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,

    model: PropTypes.object,
    boards: PropTypes.array,
    lists: PropTypes.array
  };

  static defaultProps = {
    boards: [],
    lists: []
  };

  constructor(props) {
    super(props);
    this.state = {
      showOptionalFields: false,
      showCreateList: false,
      isSubmitting: false,
      values: {}
    };
  }

  handleOnSubmit = (values) => {

    const { onSubmit } = this.props;
    const { showCreateList } = this.state;

    //make sure newList does not get included in the model if we don't have that option selected
    const nextModel = {
      ...values,
      list: showCreateList ? null : values.list,
      newList: showCreateList ? values.newList : null
    };

    this.setState({
      isSubmitting: true
    });

    onSubmit(nextModel);
  };

  onChange = (values, dispatch, props) => {
    if (!props) { // not the event we're expecting
      return;
    }
    const showCreateList = values.list === createNewListOption.value;

    if (this.state.showCreateList !== showCreateList) {
      this.setState({ showCreateList});
    }
  };

  onBoardChange = (value) => {
    const { onChange } = this.props;
    const nextModel = { board: value };
    onChange('board', value, nextModel);
  };

  render () {
    const { boards, lists, model } = this.props;
    const { showOptionalFields, showCreateList, isSubmitting } = this.state;
    const { onCancel } = this.props;

    // <Layout.Block label="ATTACHEMENTS">
    //   <Layout.Button> Choose files </Layout.Button>
    // </Layout.Block>

    return (
      <Container className="dp-trello-container">
        <Heading size={3}>Create a card</Heading>

        <Form name="create_card" onSubmit={this.handleOnSubmit} onChange={this.onChange} initialValues={{
          board: model && model.board ? model.board : boards.length ? boards[0].id : null,
          list: lists.length ? lists[0].id : null
        }}>

          <Select
            label="Board"
            id="board"
            name="board"
            options={ boards.map(board => transformBoardToOption(board, 'Personal Boards')) }
            onChange={ this.onBoardChange }
          />

          <Select
            label="List"
            id="list"
            name="list"
            options={ lists.map(list => ({ value: list.id, label: list.name})).concat([createNewListOption]) }

          />

          { showCreateList && <Input
            label="List"
            id="newList"
            name="newList"
            validate={ validators.required }
          /> }

          <Input label="Title" id="title" name="title" validate={validators.required} />

          <Textarea
            label="Description"
            id="description"
            name="description"
          />

          <HiddenFields
            className="dp-form-group"
            opened={showOptionalFields}
            labelShow={"SHOW 2 OPTIONAL FIELDS"}
            labelHide={"HIDE OPTIONAL FIELDS"}
          >

            <Datepicker
              label="DUE DATE"
              id="duedate"
              name="duedate"
            />

            <Textarea label="Labels" id="labels" name="labels"/>

          </HiddenFields>

          <div className="dp-trello-form-buttons dp-form-group">
            <SubmitButton disabled={isSubmitting}> Create </SubmitButton>
            <Button type="secondary" onClick={(e) => { e.preventDefault(); onCancel(e); }}> Cancel </Button>
          </div>

        </Form>
      </Container>
    );

  }
}

export default CreateCardSection;
