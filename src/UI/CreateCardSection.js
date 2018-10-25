import React from "react";
import PropTypes from 'prop-types';

import { Form, Input, Textarea, Datepicker, Select, required, HiddenFields } from '../Forms';
import { SubmitButton } from './SubmitButton';
import { Action, ActionBar, Button, Panel } from '@deskpro/apps-components';
import { listToOption, boardsToOptions, boardToOption } from './utils'

const createNewListOption = { value: 'trello.newList', label: '--- CREATE LIST ---' };

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

  state = {
    showOptionalFields: false,
    showCreateList: false,
    isSubmitting: false,
    values: {}
  };

  handleOnSubmit = (values) => {

    const { onSubmit } = this.props;
    const { showCreateList } = this.state;

    const { board, duedate } = values;

    //make sure newList does not get included in the model if we don't have that option selected
    const nextModel = {
      ...values,
      duedate:  new Date(Date.parse(duedate)),
      board:    board.value,
      list:     showCreateList ? null : values.list.value,
      newList:  showCreateList ? values.newList : null
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
    const showCreateList = values.list.value === createNewListOption.value;

    if (this.state.showCreateList !== showCreateList) {
      this.setState({ showCreateList});
    }
  };

  onCancel = () => {
    const { history } = this.props;
    history.push("ticket-loaded", null);
    history.go(1);
  };

  onBoardChange = (value) => {
    const { onChange } = this.props;
    const nextModel = { board: value };
    onChange('board', value, nextModel);
  };

  render () {
    const { boards, lists, model } = this.props;
    const { showOptionalFields, showCreateList, isSubmitting } = this.state;

    // <Layout.Block label="ATTACHEMENTS">
    //   <Layout.Button> Choose files </Layout.Button>
    // </Layout.Block>


    const board = model && model.board ? model.board : boards.length ? boards[0].id : null;
    const list = lists.length ? lists[0].id : null;

    return (
      <Panel className="dp-trello-container">
        <ActionBar title="Create card">
          <Action icon="close" onClick={this.onCancel} />
        </ActionBar>
        <Form name="create_card" onSubmit={this.handleOnSubmit} onChange={this.onChange} initialValues={{
          board: JSON.stringify(board ? boardToOption('Personal Boards')(board): null),
          list: JSON.stringify(list ? listToOption(list) : null)
        }}>

          <Select
            label=    "Board"
            name=     "board"
            options=  { boardsToOptions(boards, 'Personal Boards') }
            onChange= { this.onBoardChange }
          />

          <Select
            label=    "List"
            name=     "list"
            options=  { lists.map(listToOption).concat([createNewListOption]) }
          />

          { showCreateList && <Input
            label=    "List"
            name=     "newList"
            validate= { required }
          /> }

          <Input label="Title" name="title" validate={ required } />

          <Textarea
            label=  "Description"
            id=     "description"
            name=   "description"
          />

          <HiddenFields
            className="dp-form-group"
            opened={showOptionalFields}
            labelShow={"SHOW 2 OPTIONAL FIELDS"}
            labelHide={"HIDE OPTIONAL FIELDS"}
          >

            <Datepicker
              label="Due date"
              name= "duedate"
            />

            <Textarea label="Labels" name="labels"/>

          </HiddenFields>

          <div className="dp-form-group dp-form-controls">
            <SubmitButton disabled={isSubmitting} className={"dp-form-control dp-Button--wide"}> Create </SubmitButton>
            <Button type="secondary" onClick={(e) => { e.preventDefault(); this.onCancel(e); }} className={"dp-form-control dp-Button--wide"}> Cancel </Button>
          </div>

        </Form>
      </Panel>
    );

  }
}

export default CreateCardSection;
