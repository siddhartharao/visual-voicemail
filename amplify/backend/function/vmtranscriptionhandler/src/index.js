/* Amplify Params - DO NOT EDIT
	API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIIDOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
	API_VISUALVOICEMAIL_MAILBOXTABLE_ARN
	API_VISUALVOICEMAIL_MAILBOXTABLE_NAME
	API_VISUALVOICEMAIL_VOICEMAILTABLE_ARN
	API_VISUALVOICEMAIL_VOICEMAILTABLE_NAME
	AUTH_VISUALVOICEMAILE476C410_USERPOOLID
	ENV
	REGION
	STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

// get reference to S3 client
const s3 = new AWS.S3();
const pinpoint = new AWS.Pinpoint();
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

// You have to create one of these in the pinpoint console.
const pinpointApplicationID = "b12650e287c4420884f0392173fc8961";
const smsFromNumber = "+18445120332";

exports.handler = async (event, context, callback) => {
    console.log("Entering voicemail transcript handler...");
    console.log(JSON.stringify(event));
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = event.Records[0].s3.object.key;
    
    if (!srcBucket || !srcKey)
        return;
    
    if (srcKey.indexOf('.json') <= 0) return;
    
    const voicemailID = srcKey.replace('.json', '');
    
    let voicemail = await getVoicemail(voicemailID);
    
    if (!voicemail) return;
    
    const params = {
        Bucket: srcBucket,
        Key: srcKey
    };
    
    const transcriptJson = await s3.getObject(params).promise();
    
    if (!transcriptJson || transcriptJson.length == 0) return;
    
    const transcriptObject = JSON.parse(transcriptJson.Body.toString());
    
    voicemail.transcript = transcriptObject.results.transcripts[0].transcript;
    voicemail.state = VoicemailState.Transcribed;
    
    await updateVoicemail(voicemail);

    // Now go ahead and get the mailbox for this voicemail
    console.log(voicemail.mailboxID);
    const mailbox = await getMailbox(voicemail.mailboxID);
    if (mailbox && pinpointApplicationID) {
        const targetMailboxEMail = mailbox.emailAddress;
        if (targetMailboxEMail) {
            console.log("Notifying " + targetMailboxEMail);
            // First we can send the e-mail without really doing anything special
            await sendEmail(voicemail, mailbox);
            /* 
                    Filter: "email=\""+ targetMailboxEMail + "\""
                    */
            console.log(escape(targetMailboxEMail));
            // Now go ahead and find the cognito profile
            const targetPhoneNumber = await getPhoneNumberForEmail(targetMailboxEMail);
            console.log(targetPhoneNumber);
            if (targetPhoneNumber) {
                await sendSMS(voicemail, targetPhoneNumber);
            }
        }
    }
};


async function getVoicemail(voicemailID) {
    const getVoicemail = gql`
    query GetVoicemail($id: ID!) {
        getVoicemail(id: $id) {
            id
            state
            mailboxID
            callerID
            duration
            timestamp
            transcript
            bucket
            key
            targetLanguage
        }
    }
    `;
    console.log(process.env.API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT, process.env.API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT);
    try {
        const graphqlData = await axios({
            url: process.env.API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT,
            method: 'post',
            headers: {
                'x-api-key': process.env.API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
            },
            data: {
                query: print(getVoicemail),
                variables: {
                    id: voicemailID
                }
            }
        });
        console.log(voicemailID);
        return graphqlData.data.data.getVoicemail;
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
    return null;
};

async function updateVoicemail(voicemail) {
    const updateVoicemail = gql`
    mutation UpdateVoicemail(
        $input: UpdateVoicemailInput!
        $condition: ModelVoicemailConditionInput
    ) {
        updateVoicemail(input: $input, condition: $condition) {
            id
            state
            mailboxID
            mailbox {
                id
                mailbox
                emailAddress
                createdAt
                updatedAt
            }
            callerID
            duration
            timestamp
            transcript
            bucket
            key
            targetLanguage
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
                query: print(updateVoicemail),
                variables: {
                    input: voicemail
                }
            }
        });
        return voicemail;
    }
    catch (createError) {
        console.log("Unable to update voicemail entry " + JSON.stringify(createError));
    }
    return null;
};

const VoicemailState = {
    Created             : "Created",
    LanguageSelected    : "LanguageSelected",
    MailboxSelected     : "MailboxSelected",
    Recorded            : "Recorded",
    Transcribed         : "Transcribed"
};

async function getMailbox(mailboxString) {
    console.log(mailboxString);
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

const senderAddress = "siddhartha.s.rao@gmail.com";
const subject = "You have a new voicemail";
const bodyText = "You have a new voicemail, here are the details:";
const charset = "UTF-8";

async function sendEmail(voicemail, mailbox) {
    console.log("Entering sendEMail");
    console.log(JSON.stringify(voicemail));
    const textToSend = bodyText + "\n" +
        "From:" + voicemail.callerID + "\n" +
        "Transcript:" + voicemail.transcript + "\n" +
        "Mailbox:" + voicemail.mailboxID + "\n";
    var params = {
      ApplicationId: pinpointApplicationID,
      MessageRequest: {
        Addresses: {
          [mailbox.emailAddress]:{
            ChannelType: 'EMAIL'
          }
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: senderAddress,
            SimpleEmail: {
              Subject: {
                Charset: charset,
                Data: subject
              },
              TextPart: {
                Charset: charset,
                Data: textToSend
              }
            }
          }
        }
      }
    };
    console.log("Pinpoint params");
    console.log(params);
    try {
        var rv = await pinpoint.sendMessages(
            params, 
            function(err, data) { 
                console.log(err);
                console.log(data);
                if (err) { 
                    console.log(err); 
                } else { 
                    console.log(data['MessageResponse']); 
                }}).promise();
        console.log(JSON.stringify(rv.MessageResponse));
    }
    catch (pinpointError) {
        console.log(pinpointError);
    }
}

async function sendSMS(voicemail, destinationNumber) {
    // Specify the parameters to pass to the API.
    console.log("Entering sendEMail");
    console.log(JSON.stringify(voicemail));
    const message = bodyText + "\n" +
        "From:" + voicemail.callerID + "\n" +
        "Transcript:" + voicemail.transcript + "\n" +
        "Mailbox:" + voicemail.mailboxID + "\n";
    var params = {
      ApplicationId: pinpointApplicationID,
      MessageRequest: {
        Addresses: {
          [destinationNumber]: {
            ChannelType: 'SMS'
          }
        },
        MessageConfiguration: {
          SMSMessage: {
            Body: message,
            Keyword: "voicemail",
            MessageType: "TRANSACTIONAL",
            OriginationNumber: smsFromNumber,
            SenderId: "MySenderID",
          }
        }
      }
    };
    console.log("Pinpoint params");
    console.log(params);
    try {
        var rv = await pinpoint.sendMessages(
            params, 
            function(err, data) { 
                console.log(err);
                console.log(data);
                if (err) { 
                    console.log(err); 
                } else { 
                    console.log(data['MessageResponse']); 
                }}).promise();
        console.log(JSON.stringify(rv.MessageResponse));
    }
    catch (pinpointError) {
        console.log(pinpointError);
    }
}

async function getPhoneNumberForEmail(targetMailboxEMail) {
    console.log(targetMailboxEMail);
    const users = await cognitoidentityserviceprovider.listUsers(
    {
        UserPoolId: process.env.AUTH_VISUALVOICEMAILE476C410_USERPOOLID,
        AttributesToGet: ['email', 'phone_number'],
        Filter: "email=\"" + targetMailboxEMail + "\""
    }
    ).promise();
    if (users) {
        console.log("Got users");
        console.log(users);
        for (let i = 0; i < users.Users.length; i++) {
            const user = users.Users[i];
            const attributes = user.Attributes;
            console.log(JSON.stringify(attributes));
            let targetPhoneNumber = null;
            let foundUser = false;
            if (attributes) {
                for (let j = 0; j < attributes.length; j++) {
                    console.log(attributes[j]);
                    if (attributes[j].Name == "phone_number") {
                        targetPhoneNumber = attributes[j].Value;
                        if (foundUser) return targetPhoneNumber;
                    }
                    if (attributes[j].Name == "email") {
                        console.log("Found user");
                        if (targetPhoneNumber) return targetPhoneNumber;
                        foundUser = true;
                    }
                }
            }
        }
    }
    return null;
}