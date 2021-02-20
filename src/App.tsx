import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import GraphQLAPI, {GRAPHQL_AUTH_MODE, GraphQLResult, graphqlOperation} from '@aws-amplify/api';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { listMailboxs, getMailbox, createMailbox as createMailboxMutation, updateMailbox, deleteMailbox as deleteMailboxMutation, ListMailboxsQuery } from './graphql';
import { Mailbox } from './models';
import { Nav, Navbar, NavDropdown, Form, Button, FormControl } from 'react-bootstrap';
import SignOut from './SignOut';
import Mailboxes from './Mailboxes';
import Messages from './Messages';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

const initialFormState = { id: '', mailbox: '', emailAddress: '' };

function App() {
  const [mailboxes, setMailbox] = useState<ListMailboxsQuery | undefined>(undefined);
  const [formData, setFormData] = useState<Mailbox>(initialFormState as Mailbox);

  useEffect(() => {
    fetchMailboxes();
  }, []);

  async function fetchMailboxes() {
    try {
      const response = await GraphQLAPI.graphql({
        query: listMailboxs,
        authMode: GRAPHQL_AUTH_MODE.API_KEY
      }) as { data: ListMailboxsQuery };
      setMailbox(response.data);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function createMailbox() {
    if (!formData.mailbox || !formData.emailAddress) return;
    await GraphQLAPI.graphql({ query: createMailboxMutation, variables: { input: formData } });
    fetchMailboxes();
    setFormData(initialFormState as Mailbox);
  }

  async function deleteMailbox({ id }: Mailbox | any) {
    if (!id) return;
    await GraphQLAPI.graphql({ query: deleteMailboxMutation, variables: { input: { id } }});
    fetchMailboxes();
  }

  return (
    <Router>
    <div className="App">
      <Navbar bg="dark" variant="dark" fixed="top">
        <Navbar.Brand href="#home">Visual Voicemail</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
          <Nav.Link href="/Mailboxes">Mailboxes</Nav.Link>
          <Nav.Link href="/Messages">Messages</Nav.Link>
          </Nav>
          <Nav className="ml-auto">
          <Navbar.Text>&nbsp;&nbsp;&nbsp;</Navbar.Text>
          <SignOut />
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path='/Mailboxes'>
          <Mailboxes />
        </Route>
        <Route path='/Messages'>
          <Messages />
        </Route>
        <Route path='/'>
          <Mailboxes />
        </Route>
      </Switch>
    </div>
    </Router>
  );
}

export default withAuthenticator(App);
