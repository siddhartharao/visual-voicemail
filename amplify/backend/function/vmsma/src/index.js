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


exports.handler = async (event) => {
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
                    id: "1234"
                }
            }
        });
        const body = {
            graphqlData: graphqlData.data
        };

        const s3AnnounceBucketName = process.env.STORAGE_VISUALVOICEMAIL167E06E1_BUCKETNAME;

        await synthesizeSpeech(s3AnnounceBucketName, "announcement.wav", "Hello world", 'text', 'Joanna');

        return {
            statusCode: 200,
            body: JSON.stringify(body),
            headers: {
                "Access-Control-Allow-Origin": "*",
            }
        };
    } catch (err) {
        console.log('Error querying appsync ', err);
    }
};



async function synthesizeSpeech(s3Bucket, s3Key, text, textType, voiceID) {
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

    let pollyparams = {
        'Text': text,
        'TextType': textType,
        'OutputFormat': 'pcm',
        'SampleRate': '8000',
        'VoiceId': voiceID
    };
  
    const pollyResult = await Polly.synthesizeSpeech(pollyparams).promise();
    if (pollyResult.AudioStream.buffer) {
        var uint16Buffer = new Uint16Array(pollyResult.AudioStream.buffer);

        var wavArray = buildWaveHeader({
            numFrames: uint16Buffer.length,
            numChannels: 1,
            sampleRate: 8000,
            bytesPerSample: 2
        });
        
        var totalBuffer = _appendBuffer(wavArray, pollyResult.AudioStream.buffer);
        var buff = Buffer.from(totalBuffer);

        let s3params = {
            Body: buff, 
            Bucket: s3Bucket, 
            Key: s3Key,
            ACL: "public-read",
            ContentType: 'audio/wav'
        };
        
        return s3.upload(s3params).promise();
    }
    else {
      return null;
    }
};
  
 
  
  