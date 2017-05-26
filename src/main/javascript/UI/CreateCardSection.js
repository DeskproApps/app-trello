import React from 'react';
import { Form, Layout } from '@deskproapps/deskproapps-sdk-react';

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
                type: String,
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
    this.state = { showOptionalFields: false };
  }

  toggleOptionalFieldsVisibility  = () => {
    const { showOptionalFields } = this.state;
    this.setState({ showOptionalFields: !showOptionalFields });
  };

  render () {
    const { boards, lists } = this.props;
    const defaultModel = { board: boards.length ? boards[0].id : null, list: lists.length ? lists[0].id : null };

    const { showOptionalFields } = this.state;
    const fields = getFieldsDefinition(boards , lists);

    const optionalFieldsStyle = {
      display: showOptionalFields ? 'block' : 'none'
    };
    const toggleOptionalFieldsLabel = showOptionalFields ? 'HIDE OPTIONAL FIELDS' : 'SHOW 2 OPTIONAL FIELDS';

    const { model, onSubmit, onChange, onCancel } = this.props;


    // <Layout.Block label="ATTACHEMENTS">
    //   <Layout.Button> Choose files </Layout.Button>
    // </Layout.Block>

    return (
      <Layout.Section title="CREATE A NEW CARD">
        <Form.Form
          fields={fields}
          model={ model || defaultModel }
          submitLabel={"Create card"}
          onSubmit={onSubmit}
          onChange={onChange}
          onCancel={onCancel}
        >
          <Form.Fields fields={['board', 'list', 'title', 'description']} />

          <Layout.Block style={optionalFieldsStyle}>
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
