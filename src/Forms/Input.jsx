import React from 'react';
import PropTypes from 'prop-types';
import { Field, fieldPropTypes } from 'redux-form';
import Group from './Group';
import classNames from 'classnames';
import { objectKeyFilter } from './utils';

class InputComponent extends React.Component
{
  static propTypes = {
    className: PropTypes.string,
    validated: PropTypes.bool,
    validating: PropTypes.bool,
    invisible: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    invisible: false,
    validated: false,
    validating: false,
    className: '',
    onChange() {},
    onFocus() {},
    onBlur() {},
  };

  state = {
    focus: false
  };

  onChange = (event) => {
    this.props.onChange(event.currentTarget.value || '', event.currentTarget.name || '');
  };

  onFocus = (e) => {
    this.setState({
      focus: true
    });
    this.props.onFocus(e);
  };

  onBlur = (e) => {
    this.setState({
      focus: false
    });
    this.props.onBlur(e);
  };

  render() {
    const {className, validated, validating, invisible, ...props} = this.props;
    return (
      <div
        className={
          classNames(
            'dp-input',
            className,
            {
              'dp-input--validating': validating,
              'dp-input--validated': validated,
              'dp-input--invisible': invisible,
              'dp-input--focused': this.state.focus,
            }
          )
        }
      >
        <input
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          {...objectKeyFilter(props, InputComponent.propTypes)}
        />
      </div>
    );
  }
}

/**
 * Renders an input element using @deskpro/react-components and redux-form.
 *
 * @see https://redux-form.com/7.0.4/docs/api/field.md/#2-a-stateless-function
 */
export const InputField = ({ input, label, meta, ...props }) => (
  <Group label={label} error={meta.touched ? meta.error : ''} {...props}>
    <InputComponent {...input} />
  </Group>
);

InputField.propTypes = {
  /**
   * Passed to the field by redux-form.
   */
  input: PropTypes.shape(fieldPropTypes.input).isRequired
};

/**
 * Connects the field to the Redux store.
 */
const Input = props => (
  <Field
    {...props}
    component={InputField}
    onChange={(value) => {
      props.onChange(
        Object.values(value).filter(v => typeof v !== 'function').join(''),
        props.name
      );
    }}
  />
);

Input.propTypes = {
  /**
   * The name of the form field.
   */
  name:     PropTypes.string.isRequired,
  /**
   * Called when the select value changes.
   */
  onChange: PropTypes.func
};

Input.defaultProps = {
  onChange: () => {}
};

export default Input;
