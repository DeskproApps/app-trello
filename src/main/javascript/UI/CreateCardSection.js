import React from 'react';
import { Button } from 'semantic-ui-react';

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

const CreateCardSection = ({ onCancel, onSubmit, onChange, model, boards, lists }) => {
    const fields = getFieldsDefinition(boards || [], lists || []);

    const optionalFieldsStyle = {
        display: 'none'
    };

    return (
        <Layout.Section title="LINK TO ANOTHER CARD">
          <Form.Form
              fields={fields}
              model={model}
              onSubmit={onSubmit}
              onChange={onChange}
              onCancel={onCancel}
          >
            <Form.Fields fields={['board', 'list', 'title', 'description']} />

            <Layout.Block>
              <a href="#">SHOW 5 OPTIONAL FIELDS</a>
            </Layout.Block>

            <div style={optionalFieldsStyle}>
              <Form.Fields fields={['duedate', 'labels']} />

              <Layout.Block label="ATTACHEMENTS">
                <Button fluid> Choose files </Button>
              </Layout.Block>

            </div>
          </Form.Form>
        </Layout.Section>
    );
};

CreateCardSection.propTypes = {
    onCancel: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onChange: React.PropTypes.func,

    model: React.PropTypes.object,
    boards: React.PropTypes.array,
    lists: React.PropTypes.array
};

export default CreateCardSection;
