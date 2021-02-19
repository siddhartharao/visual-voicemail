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

const AWS = require('aws-sdk');

// get reference to S3 client
const s3 = new AWS.S3();
const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

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