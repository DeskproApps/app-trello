import React from 'react';
import { Icon, Input } from 'semantic-ui-react';

class SearchInputComponent extends React.Component {

  static propTypes = {
    onChange: React.PropTypes.func,
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
      const { query } = this.state;
      const { onChange, minCharacters } = this.props;

      if (query.length >= minCharacters && onChange) {
        onChange(query);
      }
    }
  };

  handleSearchChange = (e) => {
    e.stopPropagation();
    const newQuery = e.target.value;
    this.setState({ query: newQuery });
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
