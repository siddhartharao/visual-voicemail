import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Auth } from 'aws-amplify';

export default class SignOut extends Component {
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  signOut() {
    Auth.signOut();
  }

  render() {
    return (
      <Button onClick={this.signOut}>Sign Out</Button>
    )
  }
}