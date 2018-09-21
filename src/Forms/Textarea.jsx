import React from 'react';
import PropTypes from 'prop-types';
import { Field, fieldPropTypes } from 'redux-form';
import AutosizeTextarea from 'react-textarea-autosize';
import classNames from 'classnames';

import Group from './Group';
import { objectKeyFilter } from './utils';



/**
 * Textarea component.
 */
class TextareaComponent extends React.PureComponent {

  static propTypes = {

    /**
     * Should we use autosizing textarea
     */
    autosize:  PropTypes.bool,
    /**
     * The textarea value.
     */
    value:     PropTypes.string,
    /**
     * The textarea name.
     */
    name:      PropTypes.string,
    /**
     * CSS classes to apply to the element.
     */
    className: PropTypes.string,
    /**
     * Called when the textarea value changes.
     */
    onChange:  PropTypes.func
  };

  static defaultProps = {
    autosize:  false,
    value:     '',
    name:      '',
    className: '',
    onChange:  () => {}
  };

  handleChange = (event) => {
    this.props.onChange(event.currentTarget.value || '', event.currentTarget.name);
  };

  render() {
    const { autosize, value, name, className, ...props } = this.props;

    const textarea = autosize ? <AutosizeTextarea name={name} value={value} onChange={this.handleChange} />
      : <textarea name={name} value={value} onChange={this.handleChange} />
    ;

    return (
      <div
        className={classNames('dp-textarea', className)}
        {...objectKeyFilter(props, TextareaComponent.propTypes)}
      >
        {textarea}
      </div>
    );
  }
}

/**
 * Renders a textarea using @deskpro/react-components and redux-form.
 *
 * @see https://redux-form.com/7.0.4/docs/api/field.md/#2-a-stateless-function
 */
export const TextareaField = ({ input, label, meta, ...props }) => (
  <Group label={label} error={meta.touched ? meta.error : ''} {...props}>
    <TextareaComponent {...input}  />
  </Group>
);

TextareaField.propTypes = {
  /**
   * Passed to the field by redux-form.
   */
  input: PropTypes.shape(fieldPropTypes.input).isRequired
};

/**
 * Connects the field to the Redux store.
 */
const Textarea = props => (
  <Field {...props} component={TextareaField} />
);

export default Textarea;
