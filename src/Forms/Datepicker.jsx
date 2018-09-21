import React from 'react';
import PropTypes from 'prop-types';
import { Field, fieldPropTypes } from 'redux-form';
import { default as ReactDatePicker } from 'react-datepicker';
import 'moment/locale/en-gb';

import 'react-datepicker/dist/react-datepicker.css';

import Group from './Group';

class DatepickerComponent extends React.Component
{

  static propTypes = {

    onChange:      PropTypes.string,

    /**
     *
     */
    value:      PropTypes.string,

    dateFormat:      PropTypes.string,

    locale:      PropTypes.string,

  };

  state = {
    startDate: null
  };

  handleChange = (date) => {
    this.setState({
      startDate: date
    });
    this.props.onChange(date.format(this.props.dateFormat));
  };

  render() {
    return <ReactDatePicker
      className=  {"dp-datepicker"}
      dateFormat= {this.props.dateFormat}
      selected=   {this.state.startDate || null}
      onChange=   {this.handleChange}
      fixedHeight
      popperPlacement=  "top-end"
      popperModifiers=  {{
        offset: {
          enabled: true,
          offset: "30px"
        },
        preventOverflow: {
          enabled: false,
          escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
          boundariesElement: 'scrollParent'
        }
      }}
      locale={"en-gb"}
    />;
  }
}

/**
 * Renders a date picker using @deskpro/react-components and redux-form.
 *
 * @see https://redux-form.com/7.0.4/docs/api/field.md/#2-a-stateless-function
 */
export const DatepickerField = ({ input, label, meta, ...props }) => (
  <Group label={label} error={meta.touched ? meta.error : ''} {...props}>
    <DatepickerComponent {...input} onSelect={input.onChange} />
  </Group>
);

DatepickerField.propTypes = {
  /**
   * Passed to the field by redux-form.
   */
  input: PropTypes.shape(fieldPropTypes.input).isRequired
};

/**
 * Connects the field to the Redux store.
 */
const Datepicker = ({ parse, ...props }) => <Field {...props} component={DatepickerField} parse={parse} />;

Datepicker.propTypes = {
  /**
   * Parses the value given from the field input component to the type that
   * you want stored in the Redux store.
   */
  parse: PropTypes.func
};

Datepicker.defaultProps = {
  // Redux Form expects values to be strings, but the value of Forms.Datepicker
  // is a Date object. Parse the date into a string unless the parse prop has already
  // been provided.
  parse: value => String(value)
};

export default Datepicker;
