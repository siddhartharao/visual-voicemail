/* Amplify Params - DO NOT EDIT
	API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIIDOUTPUT
	API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
	API_VISUALVOICEMAIL_MAILBOXTABLE_ARN
	API_VISUALVOICEMAIL_MAILBOXTABLE_NAME
	API_VISUALVOICEMAIL_VOICEMAILTABLE_ARN
	API_VISUALVOICEMAIL_VOICEMAILTABLE_NAME
	ENV
	REGION
	STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME
Amplify Params - DO NOT EDIT */

const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const AWS = require('aws-sdk');
const { print } = graphql;

const REGION = process.env.REGION;

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: REGION
});
const s3 = new AWS.S3();

const transcribeClient = new AWS.TranscribeService({
  signatureVersion: 'v4',
  region: REGION
});

const lexClient = new AWS.LexRuntime({
    signatureVersion: 'v4',
    region: REGION
});


exports.handler = async (event, context, callback) => {
    console.log("Begin SMA Event");
    console.log(event);
    let actions;
    switch (event.InvocationEventType) {
        case "NEW_INBOUND_CALL":
            console.log("INBOUND");
            // New inbound call
            actions = await newCall(event);
            break;
    
        case "ACTION_SUCCESSFUL":
            // Action from the previous invocation response 
            // or a action requiring callback was successful
            console.log("SUCCESS ACTION");
            actions = await actionSuccessful(event);
            break;
    
        case "HANGUP":
            // Hangup received
            console.log("HANGUP ACTION");
            actions = [];
            break;
    
        default:
            // Action unsuccessful or unknown event recieved
            console.log("FAILED ACTION");
            actions = [hangupAction];
            break;
    }

    const response = {
        "SchemaVersion": "1.0",
        "Actions": actions
    };
    
    console.log("Sending response:" + JSON.stringify(response));
    callback(null, response);
    
};

const announcementsKeyPrefix = "announcements/";
const messageMaximumLengthInSeconds = 10;
const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;
const lexBotName = 'VoicemailRetrievalBot';
const lexBotAlias = 'PROD';
const lexInputContentType = 'audio/lpcm; sample-rate=8000; sample-size-bits=16; channel-count=1; is-big-endian=false';
const lexOutputContentType = 'text/plain; charset=utf-8';

async function newCall(event) {
    let rv = [];
    const legA = getLegACallDetails(event);
    if (legA) {
        const callID = legA.CallId;
        const s3EntranceKeyName = announcementsKeyPrefix + callID + "/entrance.wav";
        await synthesizeWelcomeSpeech(s3AnnounceBucketName, s3EntranceKeyName);
        rv = await playResponseAndRecordForLex(event, s3EntranceKeyName, rv);
    }
    else rv = [hangupAction];
    return rv;
};

async function actionSuccessful(event) {
    console.log("In recording complete step");
    console.log(JSON.stringify(event));
    let rv = [hangupAction];
    const legA = getLegACallDetails(event);
    if (legA && event.ActionData && event.ActionData.Type === 'RecordAudio' && 
        event.ActionData.RecordingDestination && 
        event.ActionData.RecordingDestination.Key) {
        const callID = legA.CallId;
        // The data outbound to lex is here
        const outboundWaveDataToLex = event.ActionData.RecordingDestination.Key;
        const lexInputStream = await getS3Data(s3AnnounceBucketName, outboundWaveDataToLex);
        const lexParams = {
            userId: callID,
            botName: lexBotName,
            botAlias: lexBotAlias,
            contentType: lexInputContentType,
            requestAttributes: {
                'x-amz-lex:accept-content-types': 'PlainText,SSML'
            },
            accept: lexOutputContentType,
            inputStream: lexInputStream
        };

        const lexResponse = await lexClient.postContent(lexParams).promise();
        console.log("Lex Response");
        console.log(lexResponse);
        if (lexResponse.dialogState !== 'ReadyForFulfillment') {
            const lexResponseKey = announcementsKeyPrefix + callID + '/' + outboundWaveDataToLex + '/lexresponse.wav';
            await synthesizeSpeech(s3AnnounceBucketName, lexResponseKey, lexResponse.message, lexResponse.messageType === 'SSML' ? 'ssml' : 'text', 'Joanna', 'en-US');
            rv = await playResponseAndRecordForLex(event, lexResponseKey, []);
        }
        else {
            const targetMailboxID = lexResponse.slots.MailboxNumber;
            const targetDate = lexResponse.slots.MessageDate;
            const messageToPlay = await searchForMessages(targetMailboxID, targetDate);
            if (messageToPlay && messageToPlay.key) {
                rv = [pauseAction,
                    {
                        "Type" : "PlayAudio",    
                        "Parameters" : {
                            "ParticipantTag": "LEG-A",
                            "AudioSource": {
                                "Type": "S3",
                                "BucketName": s3AnnounceBucketName,
                                "Key": messageToPlay.key
                            }
                        }
                    },pauseAction
                ];
            }
        }
    }
    return rv;
};

async function playResponseAndRecordForLex(event, lexResponseKey, currentActions) {
    let rv = [];
    if (currentActions && currentActions.length > 0)
        rv = currentActions;
    const legA = getLegACallDetails(event);
    if (legA) {
        const callID = legA.CallId;
        if (lexResponseKey) {
            const audioPlayAction = {
                "Type" : "PlayAudio",    
                "Parameters" : {
                    "ParticipantTag": "LEG-A",
                    "AudioSource": {
                        "Type": "S3",
                        "BucketName": s3AnnounceBucketName,
                        "Key": lexResponseKey
                    }
                }
            };
            rv.push(audioPlayAction);
        }
        const recordMessageAction = {
            "Type" : "RecordAudio",
            "Parameters" : {
                "ParticipantTag": "LEG-A",
                "DurationInSeconds": messageMaximumLengthInSeconds,
                "RecordingTerminators": ["#"],
                "RecordingDestination": {
                    "Type": "S3",
                    "BucketName": s3AnnounceBucketName
                }
            }
        };

        rv.push(recordMessageAction);
    }
    else rv = [hangupAction];
    return rv;
};


async function synthesizeWelcomeSpeech(s3Bucket, s3Key) {

    let audioBuffer = await synthesizeSpeechInternal("<speak>Welcome to the voicemail retrieval hotline. You can begin by saying <emphasis>get a message.</emphasis><break />After each response press the pound key, or wait a few seconds.<break /></speak>", 'ssml', 'Joanna', 'en-US');
    return audioBuffer ? addWaveHeaderAndUploadToS3(audioBuffer, s3Bucket, s3Key) : null;    
};

async function synthesizeSpeech(s3Bucket, s3Key, text, textType, voiceID, languageCode) {
    let audioBuffer = await synthesizeSpeechInternal(text, textType, voiceID, languageCode);
    return audioBuffer ? addWaveHeaderAndUploadToS3(audioBuffer, s3Bucket, s3Key) : null;
};

async function addWaveHeaderAndUploadToS3(audioBuffer, s3Bucket, s3Key) {
    var uint16Buffer = new Uint16Array(audioBuffer);

    var wavArray = buildWaveHeader({
        numFrames: uint16Buffer.length,
        numChannels: 1,
        sampleRate: 8000,
        bytesPerSample: 2
    });
    
    var totalBuffer = _appendBuffer(wavArray, audioBuffer);
    return uploadAnnouncementToS3(s3Bucket, s3Key, totalBuffer);
};

async function uploadAnnouncementToS3(s3Bucket, s3Key, totalBuffer) {
    var buff = Buffer.from(totalBuffer);

    let s3params = {
        Body: buff, 
        Bucket: s3Bucket, 
        Key: s3Key,
        ContentType: 'audio/wav'
    };
    
    return s3.upload(s3params).promise();
};

async function getS3Data(s3Bucket, s3Key) {
    let s3params = {
        Bucket: s3Bucket, 
        Key: s3Key
    };

    let s3Object = await s3.getObject(s3params).promise();
    console.log("S3 Object");
    console.log(s3Object);
    return s3Object.Body;
}

async function synthesizeSpeechInternal(text, textType, voiceID, languageCode) {
    try {
        let pollyparams = {
            'Text': text,
            'TextType': textType,
            'OutputFormat': 'pcm',
            'SampleRate': '8000',
            'VoiceId': voiceID,
            'LanguageCode': languageCode
        };

        const pollyResult = await Polly.synthesizeSpeech(pollyparams).promise();
        if (pollyResult.AudioStream.buffer) {
            return pollyResult.AudioStream.buffer;
        }
        else {
            return null;
        }
    } catch (synthesizeError) {
        console.log(synthesizeError);
        return null;
    }
};

function buildWaveHeader(opts) {
    var numFrames = opts.numFrames;
    var numChannels = opts.numChannels || 2;
    var sampleRate = opts.sampleRate || 44100;
    var bytesPerSample = opts.bytesPerSample || 2;
    var blockAlign = numChannels * bytesPerSample;
    var byteRate = sampleRate * blockAlign;
    var dataSize = numFrames * blockAlign;
  
    var buffer = new ArrayBuffer(44);
    var dv = new DataView(buffer);
  
    var p = 0;
  
    function writeString(s) {
        for (var i = 0; i < s.length; i++) {
            dv.setUint8(p + i, s.charCodeAt(i));
        }
        p += s.length;
    }
  
    function writeUint32(d) {
        dv.setUint32(p, d, true);
        p += 4;
    }
  
    function writeUint16(d) {
        dv.setUint16(p, d, true);
        p += 2;
    }
  
    writeString('RIFF');              // ChunkID
    writeUint32(dataSize + 36);       // ChunkSize
    writeString('WAVE');              // Format
    writeString('fmt ');              // Subchunk1ID
    writeUint32(16);                  // Subchunk1Size
    writeUint16(1);                   // AudioFormat
    writeUint16(numChannels);         // NumChannels
    writeUint32(sampleRate);          // SampleRate
    writeUint32(byteRate);            // ByteRate
    writeUint16(blockAlign);          // BlockAlign
    writeUint16(bytesPerSample * 8);  // BitsPerSample
    writeString('data');              // Subchunk2ID
    writeUint32(dataSize);            // Subchunk2Size
  
    return buffer;
}
  
var _appendBuffer = function(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
};


const pauseAction = {
    "Type": "Pause",
    "Parameters": {
        "DurationInMilliseconds": "3000"
    }
};

const hangupAction = {
    "Type": "Hangup",
    "Parameters": {
        "SipResponseCode": "0"
    }
};

/*
{
    "SchemaVersion": "1.0",
    "Sequence": 2,
    "InvocationEventType": "NEW_INBOUND_CALL"
    "CallDetails": {
        "TransactionId": "transaction-id",
        "AwsAccountId": "aws-account-id",
        "AwsRegion": "us-east-1",
        "SipRuleId": "sip-rule-id",
        "SipApplicationId": "sip-application-id",
        "Participants": [
            {
                "CallId": "call-id-1",
                "ParticipantTag": "LEG-A",
                "To": "+19876543210",
                "From": "+11234567890",
                "Direction": "Inbound",
                "StartTimeInMilliseconds": "159700958834234",
                "Status": "Connected"
            }
        ]
    }
}
*/

function getLegACallDetails(event) {
    let rv = null;
    if (event && event.CallDetails && event.CallDetails.Participants && event.CallDetails.Participants.length > 0) {
        for (let i = 0; i < event.CallDetails.Participants.length; i++) {
            if (event.CallDetails.Participants[i].ParticipantTag === 'LEG-A') {
                rv = event.CallDetails.Participants[i];
                break;
            }
        }
    }
    return rv;
}

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