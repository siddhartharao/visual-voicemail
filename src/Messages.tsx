import React, { useState, useEffect } from 'react';
import GraphQLAPI, {GRAPHQL_AUTH_MODE, GraphQLResult, graphqlOperation} from '@aws-amplify/api';
import { listVoicemails, ListVoicemailsQuery } from './graphql';
import { Mailbox, VoicemailState } from './models';
import { Card, ListGroup, Badge, Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import playImage from './play.png';
import Player from './Player';

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
          limit: 100
        }
      }) as { data: ListVoicemailsQuery };
      console.log(response.data);
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
                  <Card.Subtitle className="mb-2 text-muted">
                    <Container fluid={true}>
                      <Row lg="2" md="2" sm="2" xl="2" xs="2" className="align-items-center">
                        <Col lg="11" md="10" sm="10" xl="11" xs="10">
                          <i>"{message?.transcript}"</i>
                        </Col>
                        <Col lg="auto" md="auto" sm="auto" xl="auto" xs="auto">
                          <Player audioKey={message?.key} />
                        </Col>
                      </Row>
                    </Container>
                  </Card.Subtitle>
                  <Card.Text>

                  </Card.Text>
                </Card.Body>
                <Card.Footer className="TextAlignCenter">{moment(message?.timestamp).format('dddd, MMMM Do')}
                
                </Card.Footer>
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