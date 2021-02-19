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
        const voicemailID = getVoicemailID(event);
        const voicemail = await getOrCreateVoicemail(voicemailID, legA); // Get or create
        if (voicemail) {
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
    let rv = [hangupAction];
    const legA = getLegACallDetails(event);
    const callID = legA.CallId;
    const voicemailID = getVoicemailID(event);
    console.log(voicemailID);
    const voicemail = await getVoicemail(voicemailID);
    console.log("Received voicemail object...");
    console.log(JSON.stringify(voicemail));
    if (voicemail) {
        switch (voicemail.state) {
            case VoicemailState.Created:
                rv = await actionCollectMailbox(event, callID, voicemailID, voicemail);
                break;
            case VoicemailState.LanguageSelected:
                rv = await verifyMailbox(event, callID, voicemailID, voicemail);
                break;
            case VoicemailState.MailboxSelected:
                rv = await recordingComplete(event, callID, voicemailID, voicemail);
                break;
            default:
                break;
        }
    }
    return rv;
};

const messageMaximumLengthInSeconds = 30;

async function verifyMailbox(event, callID, voicemailID, voicemail) {
    console.log("In mailbox verify step");
    console.log(JSON.stringify(event));
    let rv = [hangupAction];
    if (event.ActionData && event.ActionData.ReceivedDigits) {
        let isEnglish = (voicemail.targetLanguage === 'en-US');
        let mailboxID = event.ActionData.ReceivedDigits;
        let mailbox = getMailbox(mailboxID);
        if (mailbox) {
            // Found a mailbox, time to do the actual recording.
            const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;
            const s3EntranceKeyName = announcementsKeyPrefix + callID + "/recordmessage.wav";
            await synthesizeSpeech(s3AnnounceBucketName, 
                s3EntranceKeyName, 
                isEnglish ? 
                    "Please leave a message, press pound when done." : 
                    "Deje un mensaje, presione libra cuando termine.", 
                'text', 'Joanna', 
                isEnglish ? 'en-US' : 'es-ES' );
            const audioPlayAction = {
                "Type" : "PlayAudio",    
                "Parameters" : {
                    "ParticipantTag": "LEG-A",
                    "AudioSource": {
                        "Type": "S3",
                        "BucketName": s3AnnounceBucketName,
                        "Key": s3EntranceKeyName
                    }
                }
            };
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
            voicemail.state = VoicemailState.MailboxSelected;
            await updateVoicemail(voicemail);
            rv = [audioPlayAction, recordMessageAction];
            
        }
        else {
            // Go back through this loop.
            // If you wanted to make the IVR prettier, you would play 
            // another message saying "mailbox not found" and then redo the loop
            // But this is also a security concern as it tells folks what mailboxes 
            // don't exist as well
            rv = await actionCollectMailbox(event, callID, voicemailID, voicemail);
        }
    }
    return rv;
};

async function actionCollectMailbox(event, callID, voicemailID, voicemail) {
    console.log("In mailbox ID collection step");
    console.log(JSON.stringify(event));
    let rv = [hangupAction];
    if (event.ActionData && event.ActionData.ReceivedDigits) {
        let isEnglish = true;
        voicemail.targetLanguage = 'en-US';
        if (event.ActionData.ReceivedDigits === '2') {
            voicemail.targetLanguage = 'es-ES';
            isEnglish = false;
        }
        voicemail.state = VoicemailState.LanguageSelected;
        await updateVoicemail(voicemail);
        const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;
        const s3EntranceKeyName = announcementsKeyPrefix + callID + "/collectmailbox.wav";
        const s3EntranceFailKeyName = announcementsKeyPrefix + callID + "/collectmailboxerror.wav";
        await synthesizeSpeech(s3AnnounceBucketName, 
            s3EntranceKeyName, 
            isEnglish ? "Please enter a mailbox number." : "Ingrese un número de buzón.", 
            'text', 'Joanna', 
            isEnglish ? 'en-US' : 'es-ES' );
        await synthesizeSpeech(s3AnnounceBucketName, 
            s3EntranceFailKeyName, 
            isEnglish ? "Invalid entry." : "Entrada invalida.", 
            'text', 'Joanna', 
            isEnglish ? 'en-US' : 'es-ES' );
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
                "MinNumberOfDigits": 3,
                "MaxNumberOfDigits": 10,
                "Repeat": 3,
                "RepeatDurationInMilliseconds": 10000,
            }
        }];
    }
    return rv;
};

async function recordingComplete(event, callID, voicemailID, voicemail) {
    console.log("In recording complete step");
    console.log(JSON.stringify(event));
    let rv = [hangupAction];
    if (event.ActionData && event.ActionData.Type === 'RecordAudio') {
        let isEnglish = (voicemail.targetLanguage === 'en-US');
        const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;
        voicemail.bucket = s3AnnounceBucketName;
        if (event.ActionData && event.ActionData.Parameters && 
            event.ActionData.RecordingDestination && 
            event.ActionData.RecordingDestination.Key) {
            voicemail.key = event.ActionData.RecordingDestination.Key;        
        }
        voicemail.state = VoicemailState.Recorded;
        await updateVoicemail(voicemail);
        await transcribeVoicemail(voicemail);
        const s3EntranceKeyName = announcementsKeyPrefix + callID + "/thankyou.wav";
        await synthesizeSpeech(s3AnnounceBucketName, 
            s3EntranceKeyName, 
            isEnglish ? "Thank you for leaving a message. Have a nice day!" : 
                "Gracias por dejar un mensaje. ¡Que tenga un lindo día!", 
            'text', 'Joanna', 
            isEnglish ? 'en-US' : 'es-ES' );

        rv = [pauseAction, {
            "Type" : "PlayAudio",
            "Parameters" : {
                "ParticipantTag": "LEG-A",
                "AudioSource": {
                    "Type": "S3",
                    "BucketName": s3AnnounceBucketName,
                    "Key": s3EntranceKeyName
                }
            }
        }, pauseAction, hangupAction];
    }
    return rv;
};

async function transcribeVoicemail(voicemail) {
    try {
        let params = {
            Media: {
                MediaFileUri: 'https://' + voicemail.bucket + '.s3.amazonaws.com/' + voicemail.key
            },
            TranscriptionJobName: voicemail.id,
            LanguageCode: voicemail.targetLanguage,
            MediaFormat: 'wav',
            OutputBucketName: voicemail.bucket
        };
        console.log(params);
        const rv = await transcribeClient.startTranscriptionJob(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
        console.log("Transcription succeeded");
        console.log(JSON.stringify(rv));
    }
    catch (transcriptionError) {
        console.log("Start transcription job failed");
        console.log(JSON.stringify(transcriptionError));
    }
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
        return graphqlData.data.data.getVoicemail;
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
    return null;
};

async function getOrCreateVoicemail(voicemailID, callDetails) {
    let rv = getVoicemail(voicemailID);
    console.log(JSON.stringify(rv));
    if (!rv || !rv.id) {
        const createVoicemail = gql`
        mutation CreateVoicemail(
            $input: CreateVoicemailInput!
            $condition: ModelVoicemailConditionInput
          ) {
            createVoicemail(input: $input, condition: $condition) {
              id
              state
              callerID
              timestamp
            }
          }
        `;
        try {
            const callerID = (callDetails && callDetails.From) ? callDetails.From : '';
            const newVoicemail = {
                id: voicemailID,
                state: "Created",
                callerID: callerID,
                timestamp: new Date().toISOString()
            };
            const graphqlData = await axios({
                url: process.env.API_VISUALVOICEMAIL_GRAPHQLAPIENDPOINTOUTPUT,
                method: 'post',
                headers: {
                    'x-api-key': process.env.API_VISUALVOICEMAIL_GRAPHQLAPIKEYOUTPUT
                },
                data: {
                    query: print(createVoicemail),
                    variables: {
                        input: newVoicemail
                    }
                }
            });
            rv = newVoicemail;
        }
        catch (createError) {
            console.log("Unable to create voicemail entry " + JSON.stringify(createError));
            rv = null;
        }
    }
    return rv;
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

async function synthesizeWelcomeSpeech(s3Bucket, s3Key) {

    let englishBuffer = await synthesizeSpeechInternal("<speak>For english <emphasis>press one.</emphasis><break /><break /></speak>", 'ssml', 'Joanna', 'en-US');
    let spanishBuffer = await synthesizeSpeechInternal("<speak>Para español <emphasis>presione dos.</emphasis><break /><break /></speak>", 'ssml', 'Joanna', 'es-ES');
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

function getVoicemailID(event) {
    let callDetails = getLegACallDetails(event);
    return event.CallDetails.SipMediaApplicationId + '-' + callDetails.CallId;
};

const VoicemailState = {
    Created             : "Created",
    LanguageSelected    : "LanguageSelected",
    MailboxSelected     : "MailboxSelected",
    Recorded            : "Recorded",
    Transcribed         : "Transcribed"
};

function isEnglishVoicemail(voicemail) {
    return (voicemail && isEnglish(voicemail.targetLanguage));
};

function isEnglish(voicemailTargetLanguage) {
    return voicemail.targetLanguage === 'en-US'
};
  
 
  
  