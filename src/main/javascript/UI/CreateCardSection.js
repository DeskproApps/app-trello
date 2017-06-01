import React from "react";
import {Form, Layout} from "@deskproapps/deskproapps-sdk-react";

const createNewListOption = { key: 'trello.newList', value: '--- CREATE LIST ---' };


/**
 * @param {Array<TrelloBoard>} boards
 * @param {Array<TrelloList>} lists
 */
const getFieldsDefinition = (boards, lists) => {
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
                allowedValues: lists.map(list => list.id).concat([createNewListOption.key])
            },
            ui: {
                placeholder: 'Please select',
                label: 'LIST',
                transform(id) {
                    if (id == createNewListOption.key) {
                      return createNewListOption.value;
                    }

                    for (const list of lists) {
                        if (list.id === id) {
                            return list.name;
                        }
                    }
                }
            }
        },
        newList: {
          schema: {
            type: String,
            optional: true,
            min: 1
          },
          ui: {
            placeholder: 'Please enter list name',
            label: 'LIST'
          }
        },
        title: {
            schema: {
                type: String,
                optional: false
            }
        },
        description: {
            schema: {
                type: String,
                optional: true
            },
            ui: {
                label: 'DESCRIPTION',
                component: Form.FieldTypes.Textarea
            }
        },
        duedate: {
            schema: {
                type: Date,
                optional: true
            },
            ui: {
                placeholder: 'dd / mm / yyyy',
                label: 'DUE DATE'
            }
        },
        labels: {
            schema: {
                type: String,
                optional: true
            },
            ui: {
                placeholder: 'Add by name',
                label: 'LABELS'
            }
        },
        subscribe: {
            schema: {
                type: String,
                defaultValue: 'yes',
                allowedValues: ['yes', 'no'],
                optional: false
            },
            ui: {
                label: 'SUBSCRIBE'
            }
        },
    };
};

class CreateCardSection extends React.Component {

  static propTypes = {
    onCancel: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onChange: React.PropTypes.func,

    model: React.PropTypes.object,
    boards: React.PropTypes.array,
    lists: React.PropTypes.array
  };

  static defaultProps = {
    boards: [],
    lists: []
  };

  constructor(props) {
    super(props);
    this.state = { showOptionalFields: false, showCreateList: false };
  }

  toggleOptionalFieldsVisibility  = () => {
    const { showOptionalFields } = this.state;
    this.setState({ showOptionalFields: !showOptionalFields });
  };

  handleOnSubmit = (model, ...others) => {

    const { showCreateList } = this.state;
    const { onSubmit } = this.props;

    //make sure newList does not get included in the model if we don't have that option selected
    const newModel = showCreateList ? model : { ...model, newList: null };
    onSubmit(...[newModel, ...others]);
  };

  handleOnChangeEvent = (key, value, model) => {

    let internalEvent = false;
    let showCreateList = null;
    if (key === 'list') {
      showCreateList = value === createNewListOption.key;
      internalEvent = showCreateList;
    } else if (key === 'board') {
      showCreateList = false;
    }

    if (showCreateList !== null) {
      this.setState({ showCreateList });
    }

    if (internalEvent) { return ; }

    const { onChange } = this.props;
    onChange(key, value, model);
  };

  render () {
    const { boards, lists } = this.props;
    const defaultModel = { board: boards.length ? boards[0].id : null, list: lists.length ? lists[0].id : null, newList: null };

    const { showOptionalFields, showCreateList } = this.state;
    const fields = getFieldsDefinition(boards , lists);


    const hiddenStyle = { display: 'none' };
    const visibleStyle = { display: 'block' };
    const toggleOptionalFieldsLabel = showOptionalFields ? 'HIDE OPTIONAL FIELDS' : 'SHOW 2 OPTIONAL FIELDS';

    const { model:injectedModel, onSubmit, onChange, onCancel } = this.props;
    let model = injectedModel || defaultModel;
    model = showCreateList ? { ...model, newList: null } : model;

    // <Layout.Block label="ATTACHEMENTS">
    //   <Layout.Button> Choose files </Layout.Button>
    // </Layout.Block>

    return (
      <Layout.Section title="CREATE A NEW CARD">
        <Form.Form
          fields={fields}
          model={ model }
          submitLabel={"Create card"}
          onSubmit={this.handleOnSubmit}
          onChange={this.handleOnChangeEvent}
          onCancel={onCancel}
        >
          <Form.Fields fields={['board']} />

          <Layout.Block style={showCreateList ? hiddenStyle: visibleStyle}>
            <Form.Fields fields={['list']} />
          </Layout.Block>

          <Layout.Block style={showCreateList ? visibleStyle : hiddenStyle}>
            <Form.Fields fields={['newList']} />
          </Layout.Block>

          <Form.Fields fields={['title', 'description']} />

          <Layout.Block style={showOptionalFields ? visibleStyle : hiddenStyle}>
            <Form.Fields fields={['duedate', 'labels']} />
          </Layout.Block>

          <Layout.Block>
            <a href="#" onClick={this.toggleOptionalFieldsVisibility} className="text small">{toggleOptionalFieldsLabel}</a>
          </Layout.Block>
        </Form.Form>
      </Layout.Section>
    );
  }
}

export default CreateCardSection;
