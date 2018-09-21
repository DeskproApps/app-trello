import React from 'react';
import { Button } from '@deskpro/apps-components';

export class SubmitButton extends React.Component
{
  render()
  {
    const {disabled, children, ...otherProps} = this.props;
    return (<Button {...otherProps}> {children} </Button>);
  }
}


