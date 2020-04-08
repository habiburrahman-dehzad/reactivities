import React, {Component} from 'react';
import { Header, Icon, List } from 'semantic-ui-react';
import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    values: []
  }

  componentDidMount() {
    axios.get("http://localhost:5000/values")
      .then((response) => {
        this.setState({
          values: response.data
        });
      });
  }

  render() {
    return (
      <div>
        <Header as='h2' icon textAlign='center'>
          <Icon name='users' circular />
          <Header.Content>Reactivity</Header.Content>
        </Header>
        <List bulleted>
          {
            this.state.values.map((value) => (
              <List.Item key={value.id}>{value.name}</List.Item>
            ))
          }
        </List>
      </div>
    );
  }
}

export default App;
