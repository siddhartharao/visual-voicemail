### Visual Voicemail
The visual voicemail app is composed of three components. First, there is a web based Amplify app built in React that enables customers to retrieve voicemail messages, play them back, create voice mailboxes, and view the transcriptions of voicemails. Second, a Lambda (vmsma) that integrates with the Amazon Chime SDK's SIP Media Application framework. This Lambda presents an IVR to an incoming caller that enables them to select a voice mailbox and leave a message. Third, we have a voicemail retrieval hotline, again integrated with SMA, that uses a Lex bot to select (with validation) a mailbox and retrieve a single message from a particular day. I will admit that the IVRs could be better, but this is just an example. We use Polly to play back the announcements for the IVRs, Transcribe to transcribe the messages, and Lex to power the retrieval hotline.

### Building the Example Using Your Own AWS Account
You would init the amplify project with:
<code>
  amplify init --app https://github.com/siddhartharao/visual-voicemail/
</code>

The project depends on a central S3 bucket (referenced throughout the Lambdas) for storing the voicemail and generated announcements. We also require custom IAM permissions to call Polly, Transcribe. You will see these permissions in the <a href="https://github.com/siddhartharao/visual-voicemail/blob/master/amplify/backend/function/vmsma/vmsma-cloudformation-template.json#L253">CloudFormation JSON</a> for each of the Amplify Lambda functions.

### Give me a Diagram!
![image](https://user-images.githubusercontent.com/58867898/113094465-91b3a400-91a6-11eb-96c2-ce50c70fc5a8.png)

