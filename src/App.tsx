import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import GraphQLAPI, {GRAPHQL_AUTH_MODE, GraphQLResult, graphqlOperation} from '@aws-amplify/api';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listMailboxs, getMailbox, createMailbox as createMailboxMutation, updateMailbox, deleteMailbox as deleteMailboxMutation, ListMailboxsQuery } from './graphql';
import { Mailbox } from './models';

const initialFormState = { mailbox: '', emailAddress: '' };

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
    <div className="App">
      <h1>My Mailboxes</h1>
      <input
        onChange={e => setFormData({ ...formData, 'mailbox': e.target.value})}
        placeholder="Mailbox Name"
        value={formData.mailbox}
      />
      <input
        onChange={e => setFormData({ ...formData, 'emailAddress': e.target.value})}
        placeholder="Mailbox Address"
        value={formData.emailAddress}
      />
      <button onClick={createMailbox}>Create Mailbox</button>
      <div style={{marginBottom: 30}}>
        {
          mailboxes?.listMailboxs?.items.map(box => {
            return (
              <div key={box?.id}>
                <h2>{box?.mailbox}</h2>
                <p>{box?.emailAddress}</p>
                <button onClick={() => deleteMailbox(box)}>Delete Mailbox</button>
              </div>
            );
          })
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
