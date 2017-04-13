import React from 'react';
import { Button, Divider } from 'semantic-ui-react';
import { Layout,  } from 'deskproapps-sdk-react';

const LinkToCardSection = ({ onCreate, onPick, onSearch }) => {
  return (
    <Layout.Section title="LINK TO ANOTHER CARD">
      <Button basic fluid color="black" onClick={onSearch}>Search for card</Button>
      <Divider hidden />
      <Button basic fluid color="black" onClick={onPick}>Pick card</Button>
      <Divider hidden />
      <Button basic fluid color="black" onClick={onCreate}>Create new card</Button>
    </Layout.Section>
  )};

LinkToCardSection.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onPick: React.PropTypes.func.isRequired,
  onSearch: React.PropTypes.func.isRequired,
};
export default LinkToCardSection;
