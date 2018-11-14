import React from 'react';
import { Action, List, Panel } from "@deskpro/apps-components";

class AppPlaceholder extends React.PureComponent
{
  render() {
    return (
      <Panel title={"Linked cards"} border="none" className="dp-trello-container">
        <Action icon={"search"} label={"Find"} />
        <Action icon={"add"} label={"Create"} />
        <List className="dp-form-group dp-trello-card-list" />
      </Panel>
    );
  }
}

export default AppPlaceholder;
