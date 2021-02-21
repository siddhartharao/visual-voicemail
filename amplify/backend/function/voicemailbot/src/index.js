/* Amplify Params - DO NOT EDIT
	API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIIDOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
	API_VISUALVOICEMAIL_MAILBOXTABLE_ARN
	API_VISUALVOICEMAIL_MAILBOXTABLE_NAME
	API_VISUALVOICEMAIL_VOICEMAILTABLE_ARN
	API_VISUALVOICEMAIL_VOICEMAILTABLE_NAME
	AUTH_VISUALVOICEMAIL8AEA0F86_USERPOOLID
	ENV
	REGION
	STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME
Amplify Params - DO NOT EDIT */

const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const AWS = require('aws-sdk');
const { print } = graphql;

exports.handler = async (event, context, callback) => {
    console.log("Voicemail Bot Invoked");
    console.log(JSON.stringify(event));
    const source = event.invocationSource;
    const mailboxNumber = event.currentIntent.slots.MailboxNumber;
    const messageDate = event.currentIntent.slots.MessageDate;
    const outputSessionAttributes = event.sessionAttributes || {};
    let slots = event.currentIntent.slots;
    try {

        // MailboxNumber //MessageDate
        
        if (mailboxNumber === null && messageDate === null) {
            callback(null, delegate(outputSessionAttributes, slots));
        }
        else if (mailboxNumber !== null && messageDate === null) {
            // Validate the actual mailbox
            const mailbox = await getMailbox(mailboxNumber);
            console.log(mailbox);
            if (!mailbox) {
                callback(null, elicitSlot(
                    outputSessionAttributes, 
                    event.currentIntent.name, 
                    event.currentIntent.slots,
                    'MailboxNumber',
                    { contentType: 'PlainText', content: 'We apologize but that is not a valid entry for room type. Please make a new selection.' }
                ));
            }
            else {
                callback(null, delegate(outputSessionAttributes, slots));
            }
        }
        else if (messageDate !== null && messageDate !== null) {
            // Now we have to see if we have at least one message for the mailbox on that date
            // Yes, folks, I know I am querying in UTC. ;-)
            // And yes, I know it won't be exactly accurate
            const oneMessage = await searchForMessages(mailboxNumber, messageDate);
            console.log(oneMessage);
            if (!oneMessage) {
                callback(null, elicitSlot(
                    outputSessionAttributes, 
                    event.currentIntent.name, 
                    event.currentIntent.slots,
                    'MessageDate',
                    { contentType: 'PlainText', content: 'Hmmm.... I am sorry but I cannot find a message for that date. Try another date please.' }
                ));
            }
            else {
                callback(null, delegate(outputSessionAttributes, slots));
            }
        }
        else {
            callback(null, delegate(outputSessionAttributes, slots));
        }
    }
    catch (botError) {
        console.log("BOT ERROR");
        console.log(JSON.stringify(botError));
        callback(null, delegate(outputSessionAttributes, slots));
    }
};

// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
         
        },
    };
}

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}
 
function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

async function getMailbox(mailboxString) {
    const getMailbox = gql`
    query GetMailbox($id: ID!) {
        getMailbox(id: $id) {
            id
            mailbox
            emailAddress
            createdAt
            updatedAt
        }
    }
    `;

    try {
        const graphqlData = await axios({
            url: process.env.API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT,
            method: 'post',
            headers: {
                'x-api-key': process.env.API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
            },
            data: {
                query: print(getMailbox),
                variables: {
                    id: mailboxString
                }
            }
        });
        return graphqlData.data.data.getMailbox;
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
    return null;
};

async function searchForMessages(mailboxString, messageDate) {
    /*
    query MyQuery {
  voicemailsByMailboxStateAndTime(filter: {timestamp: {beginsWith: "2021-02-20"}}, mailboxID: "1234", limit: 1) {
    items {
      bucket
      callerID
      createdAt
      duration
      id
      key
      mailboxID
      state
      targetLanguage
      timestamp
      transcript
      updatedAt
    }
  }
}
*/
    const searchMessages = gql`
    query MyQuery($mailboxID: ID!, $timestampBeginsWith: String!) {
        voicemailsByMailboxStateAndTime(filter: {timestamp: {beginsWith: $timestampBeginsWith}}, mailboxID: $mailboxID, limit: 1) {
            items {
                bucket
                callerID
                createdAt
                duration
                id
                key
                mailboxID
                state
                targetLanguage
                timestamp
                transcript
                updatedAt
            }
        }
    }
    `;

    try {
        const graphqlData = await axios({
            url: process.env.API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT,
            method: 'post',
            headers: {
                'x-api-key': process.env.API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
            },
            data: {
                query: print(searchMessages),
                variables: {
                    mailboxID: mailboxString,
                    timestampBeginsWith: messageDate
                }
            }
        });
        console.log(JSON.stringify(graphqlData.data));
        return graphqlData.data.data.voicemailsByMailboxStateAndTime.items[0];
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
    return null;
}
  