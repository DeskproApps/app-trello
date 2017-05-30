import React from 'react';
import { Icon, Input } from 'semantic-ui-react';

class SearchInputComponent extends React.Component {

  static propTypes = {
    onChange: React.PropTypes.func,
    onSearch: React.PropTypes.func,
    minCharacters: React.PropTypes.number
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

  handleSearchChange = (e) => {
    e.stopPropagation();
    const newQuery = e.target.value;
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
      <Input
        value={query}
        icon
        focus
        onChange={this.handleSearchChange}
        {...inputProps}
      >
        <input onKeyDown={this.handleOnKeyDown} autofocus/>
        <Icon name="search" />
      </Input>
    );
  }
}

export default SearchInputComponent;
