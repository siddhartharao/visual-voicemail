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

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
  region: 'us-east-1'
})
const s3 = new AWS.S3();


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
            actions = [];
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

async function newCall(event) {
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

{
    "Type" : "PlayAudioAndGetDigits",
    "Parameters" : {
        "CallId": "call-id-1",
        "ParticipantTag": "LEG-A", //or LEG-B        
        "InputDigitsRegex": "^\d{2}#$",
        "AudioSource": {
            "Type": "S3",
            "BucketName": "valid-s3-bucket-name",
            "Key": "audio-file-1.wav"
        },
        "FailureAudioSource": {
            "Type": "S3",
            "BucketName": "valid-s3-bucket-name",
            "Key": "audio-file-failure.wav"
        },
        "MinNumberOfDigits": 3,
        "MaxNumberOfDigits": 5,
        "TerminatorDigits": ["#"],        
        "InBetweenDigitsDurationInMilliseconds": 5000,
        "Repeat": 3,
        "RepeatDurationInMilliseconds": 10000
    }
}

*/
    let rv = [hangupAction];
    const legA = getLegACallDetails(event);
    if (legA) {
        const callID = legA.CallId;
        const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;
        const s3EntranceKeyName = announcementsKeyPrefix + callID + "/entrance.wav";
        const s3EntranceFailKeyName = announcementsKeyPrefix + callID + "/entrancefailure.wav";
        await synthesizeWelcomeSpeech(s3AnnounceBucketName, s3EntranceKeyName);
        await synthesizeSpeech(s3AnnounceBucketName, s3EntranceFailKeyName, "Hmmm... I didn't get that, please try again.", 'text', 'Joanna', 'en-US');
        rv = [pauseAction, {
            "Type" : "PlayAudioAndGetDigits",
            "Parameters" : {
                "AudioSource": {
                    "ParticipantTag": "LEG-A",
                    "Type": "S3",
                    "BucketName": s3AnnounceBucketName,
                    "Key": s3EntranceKeyName
                },
                "FailureAudioSource": {
                    "ParticipantTag": "LEG-A",
                    "Type": "S3",
                    "BucketName": s3AnnounceBucketName,
                    "Key": s3EntranceFailKeyName
                },
                "MinNumberOfDigits": 1,
                "MaxNumberOfDigits": 1,
                "Repeat": 3,
                "RepeatDurationInMilliseconds": 10000,
                "InputDigitsRegex": "[1-2]"
            }
        }];
    }
    return rv;
};

async function actionSuccessful(event) {
/*
{
  SchemaVersion: '1.0',
  Sequence: 1,
  InvocationEventType: 'ACTION_SUCCESSFUL',
  ActionData: {
    ReceivedDigits: '1',
    Type: 'PlayAudioAndGetDigits',
    Parameters: {
      AudioSource: [Object],
      FailureAudioSource: [Object],
      MinNumberOfDigits: 1,
      MaxNumberOfDigits: 1,
      InBetweenDigitsDurationInMilliseconds: 10000,
      Repeat: 3,
      RepeatDurationInMilliseconds: 10000,
      CallId: '496a8978-bc8b-4c8c-b3ad-2ba5ece0ebab'
    }
  },
  CallDetails: {
    TransactionId: '6bc77224-e257-4b09-8e30-e5e16bfbdd75',
    AwsAccountId: '352842279943',
    AwsRegion: 'us-east-1',
    SipRuleId: '170bb454-f79c-4d32-a642-ce561fe2063c',
    SipMediaApplicationId: 'f3f3c910-ad38-45d9-a8cd-28a9ab2f1838',
    Participants: [ [Object] ]
  }
}
*/

};

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
        return graphqlData.data;
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
    return null;
};

async function synthesizeWelcomeSpeech(s3Bucket, s3Key) {

    let englishBuffer = await synthesizeSpeechInternal("<speak>For english <emphasis>press one.</emphasis><break /><break /></speak>", 'ssml', 'Joanna', 'en-US');
    let spanishBuffer = await synthesizeSpeechInternal("<speak>Para español <emphasis>presione dos.</emphasis><break /><break /></speak>", 'ssml', 'Joanna', 'es-MX');
    if (englishBuffer && spanishBuffer) {
        let audioBuffer = _appendBuffer(englishBuffer, spanishBuffer);
        return audioBuffer ? addWaveHeaderAndUploadToS3(audioBuffer, s3Bucket, s3Key) : null;    
    }
    return null;
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
  
 
  
  