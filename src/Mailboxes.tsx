import React, { useState, useEffect } from 'react';
import GraphQLAPI, {GRAPHQL_AUTH_MODE, GraphQLResult, graphqlOperation} from '@aws-amplify/api';
import { listMailboxs, getMailbox, createMailbox as createMailboxMutation, updateMailbox, deleteMailbox as deleteMailboxMutation, ListMailboxsQuery } from './graphql';
import { Mailbox } from './models';
import { Table, Button, Form } from 'react-bootstrap';

const initialFormState = { id: '', mailbox: '', emailAddress: '' };

function Mailboxes() {
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
    <div>
      <h3>&nbsp;</h3><h3>&nbsp;</h3>
      <Table striped bordered hover variant="dark">
          <thead>
              <tr>
                  <th>Mailbox Number</th>
                  <th colSpan={2}>E-mail Address</th>
              </tr>
          </thead>
          <tbody>
                {
                    mailboxes?.listMailboxs?.items.map(box => {
                        return (
                            <tr>
                                <td>{box?.mailbox}</td>
                                <td>{box?.emailAddress}</td>
                                <td>
                                    <Button className="pull-right" onClick={() => deleteMailbox(box)}>Remove</Button>
                                </td>
                            </tr>
                        );
                    })
                }
          </tbody>
          <tfoot>
              <tr>
                    <td>
                    <Form.Control 
                    onChange={e => setFormData({ ...formData, 'id': e.target.value, 'mailbox': e.target.value})}
                    placeholder="Mailbox Name"
                    value={formData.mailbox}
                    />
                    </td>
                    <td>
                    <Form.Control type="email"
                    onChange={e => setFormData({ ...formData, 'emailAddress': e.target.value})}
                    placeholder="Mailbox Address"
                    value={formData.emailAddress}
                    />
                    </td>
                    <td><Button onClick={createMailbox}>Add</Button></td>
              </tr>
          </tfoot>
      </Table>
    </div>
  );
}

export default Mailboxes;