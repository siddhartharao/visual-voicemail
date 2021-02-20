import React, { useState, useEffect } from 'react';
import GraphQLAPI, {GRAPHQL_AUTH_MODE, GraphQLResult, graphqlOperation} from '@aws-amplify/api';
import { listVoicemails, ListVoicemailsQuery } from './graphql';
import { Mailbox, VoicemailState } from './models';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import moment from 'moment';

const initialFormState = { id: '', mailbox: '', emailAddress: '' };

function Messages() {
  const [voicemails, setVoicemail] = useState<ListVoicemailsQuery | undefined>(undefined);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await GraphQLAPI.graphql({
        query: listVoicemails,
        authMode: GRAPHQL_AUTH_MODE.API_KEY,
        variables: {
          filter: {
            state: {
              eq: VoicemailState.TRANSCRIBED
            }
          },
          limit: 10
        }
      }) as { data: ListVoicemailsQuery };
      setVoicemail(response.data);
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
    <h3>&nbsp;</h3><h3>&nbsp;</h3>
    <ListGroup>
    {
        voicemails?.listVoicemails?.items.map(message => {
            return (
              <ListGroup.Item>
              <Card>
                <Card.Header>{message?.callerID}
                  
                  <Badge className="TextAlignRight" pill variant="primary">{message?.mailboxID}</Badge>
                  
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{message?.transcript}</Card.Subtitle>
                  <Card.Text>

                  </Card.Text>
                </Card.Body>
                <Card.Footer className="TextAlignCenter">{moment(message?.timestamp).format('dddd, MMMM Do')}</Card.Footer>
              </Card>
              </ListGroup.Item>
            );
        })
    }
    </ListGroup>
    </div>
  );
}

export default Messages;