import React from 'react';
import { Divider } from 'semantic-ui-react';
import { Layout } from '@deskproapps/deskproapps-sdk-react';

const LinkToCardSection = ({ onCreate, onPick, onSearch }) => {
  return (
    <Layout.Section title="LINK TO ANOTHER CARD">
      <Layout.Button onClick={onSearch}>Search for card</Layout.Button>
      <Divider hidden />
      <Layout.Button onClick={onPick}>Pick card</Layout.Button>
      <Divider hidden />
      <Layout.Button onClick={onCreate}>Create new card</Layout.Button>
    </Layout.Section>
  )};

LinkToCardSection.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onPick: React.PropTypes.func.isRequired,
  onSearch: React.PropTypes.func.isRequired,
};
export default LinkToCardSection;
