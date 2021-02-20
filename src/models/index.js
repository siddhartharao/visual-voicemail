// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const VoicemailState = {
  "CREATED": "Created",
  "LANGUAGE_SELECTED": "LanguageSelected",
  "MAILBOX_SELECTED": "MailboxSelected",
  "RECORDED": "Recorded",
  "TRANSCRIBED": "Transcribed"
};

const { Mailbox, Voicemail } = initSchema(schema);

export {
  Mailbox,
  Voicemail,
  VoicemailState
};