import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@deskpro/apps-components';

class SearchInputComponent extends React.Component {

  static propTypes = {
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    minCharacters: PropTypes.number
  };

  static defaultProps = {
    onChange: () => {},
    minCharacters: 0
  };

  constructor(props) {
    super(props);
    this.state = { query: '' };
  }


  handleOnKeyDown =(e) => {
    if (e.keyCode === 13) {
      this.onSearch();
    }
  };

  onSearch = () => {
    const { query } = this.state;
    const { onSearch, minCharacters } = this.props;

    if (onSearch && query.length >= minCharacters ) {
      onSearch(query);
    }
  };

  handleSearchChange = (event) => {
    const newQuery = event.target.value;
    this.setState({ query: newQuery });
    const { onChange, minCharacters } = this.props;
    if (onChange && newQuery.length >= minCharacters) {
      onChange(newQuery);
    }
  };

  filterInputProps = (props) => {
    const { onChange, value, icon, minCharacters, ...allowed } = props;
    return allowed;
  };

  render() {
    const inputProps = this.filterInputProps(this.props);
    const { query } = this.state;

    return (
      <div className={"dp-input"}>
        <input

          value=      {query}
          onChange=   {this.handleSearchChange}
          onKeyDown=  {this.handleOnKeyDown}
          {...inputProps}
        />
      </div>
    );
  }
}

export default SearchInputComponent;
