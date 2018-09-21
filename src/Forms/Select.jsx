import React from 'react';
import PropTypes from 'prop-types';
import { Field, fieldPropTypes } from 'redux-form';
import { Icon } from '@deskpro/apps-components';
import classNames from 'classnames';
import ReactSelect from 'react-select';

import Group from './Group';

const SelectComponent = ({ className, name, placeholder, icon, multiple, onChange, options, value, ...props }) => {

  // Redux Form expects values to be strings, but the value of Forms.Select
  // is an object with { label: string, value: string }. Parse the value to
  // return the value part of the object unless the parse prop has already
  // been provided.
  let actualValue;
  try {
     actualValue = value ? JSON.parse(value) : null;
  } catch (e) {
    actualValue = value;
  }

  return  <div
    className={classNames('dp-select', className, { 'dp-input--with-icon': icon })}
  >
    { icon && <Icon name={icon} /> }
    <ReactSelect
      className=  {classNames('dp-react-select', className)}
      classNamePrefix={'dp-react-select'}
      name=       {name}
      onChange=   {onChange}
      placeholder={placeholder}
      multiple=   {multiple}
      options=    {options}
      value=      {actualValue}
      {...props}
    />
  </div>
};

SelectComponent.propTypes = {
  /**
   * CSS classes to apply to the element.
   */
  className:   PropTypes.string,
  /**
   * Name of the form element.
   */
  name:        PropTypes.string,
  /**
   * Displayed in the drop down before a value is entered.
   */
  placeholder: PropTypes.string,
  /**
   * Icon to display to the left of the text.
   */
  icon:        PropTypes.string,
  /**
   * Allow multiple options to be selection.
   */
  multiple:    PropTypes.bool,
  /**
   * Called when the selected value changes.
   */
  onChange:    PropTypes.func,
  /**
   * Array of values to
   */
  options:     PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.node,
    value: PropTypes.node.isRequired,
  })).isRequired,
};

SelectComponent.defaultProps = {
  placeholder: 'Please select',
  multiple:    false,
  name:        '',
  icon:        '',
  className:   '',
  onChange() {}
};


/**
 * Renders a select element using @deskpro/react-components and redux-form.
 *
 * @see https://redux-form.com/7.0.4/docs/api/field.md/#2-a-stateless-function
 */
export const SelectField = ({ options, input, label, meta, ...props }) => (
    <Group label={label} error={meta.touched ? meta.error : ''} {...props}>
      <SelectComponent
        {...input}
        options=  {options}
        onBlur=   {() => {}}
      />
    </Group>
);

SelectField.propTypes = {
  /**
   * List of dropdown values.
   */
  options: SelectComponent.propTypes.options, // eslint-disable-line
  /**
   * Passed to the field by redux-form.
   */
  input:   PropTypes.shape(fieldPropTypes.input).isRequired
};

/**
 * Connects the field to the Redux store.
 */
const Select = ({ ...props }) =>  <Field
  {...props}
  component=  {SelectField}
  onChange=   {value => props.onChange(value.value, props.name)}
/>;

Select.propTypes = {
  /**
   * Parses the value given from the field input component to the type that
   * you want stored in the Redux store.
   */
  parse:    PropTypes.func,
  /**
   * The name of the form field.
   */
  name:     PropTypes.string.isRequired,
  /**
   * Called when the select value changes.
   */
  onChange: PropTypes.func
};

Select.defaultProps = {

  onChange: () => {}
};

export default Select;
