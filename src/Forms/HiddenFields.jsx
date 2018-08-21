import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { objectKeyFilter } from './utils';
import { Button } from '@deskpro/apps-components';

/**
 * Wraps optional form fields which may be shown or hidden.
 */
export default class HiddenFields extends React.Component {
  static propTypes = {
    /**
     * When true the children are displayed.
     */
    opened:         PropTypes.bool,
    /**
     * Link text to display to show the children.
     */
    labelShow:      PropTypes.string,
    /**
     * Link text to display to hide the children.
     */
    labelHide:      PropTypes.string,

    /**
     * Called when the children are shown or hidden.
     */
    onChange:       PropTypes.func,
    /**
     * CSS classes to apply to the element.
     */
    className:      PropTypes.string,
    /**
     * Children to render.
     */
    children:       PropTypes.node
  };

  static defaultProps = {
    opened:         false,
    labelShow:      'Show optional fields',
    labelHide:      'Hide optional fields',
    className:      '',
    children:       '',
    onChange:       () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: props.opened
    };
  }

  handleClick = (e) => {
    e.preventDefault();
    this.setState({ opened: !this.state.opened }, () => {
      this.props.onChange(this.state.opened);
    });
  };

  render() {
    const {
      labelShow, labelHide, className, children, ...props
    } = this.props;
    const { opened } = this.state;

    return (
      <div
        className={classNames(
          'dp-hidden-fields',
          {
            'dp-hidden-fields--open': opened
          },
          className
        )}
        {...objectKeyFilter(props, HiddenFields.propTypes)}
      >
        <div
          aria-expanded={opened}
          id={`dp-hidden-fields-body-${this.id}`}
          className="dp-hidden-fields__body"
        >
          {children}
        </div>
        <Button
          classname={"dp-Button--wide"}
          appearance= {"text"}
          onClick=    {this.handleClick}
        >
          { opened ? labelHide : labelShow }
        </Button>
      </div>
    );
  }
}
