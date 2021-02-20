import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum VoicemailState {
  CREATED = "Created",
  LANGUAGE_SELECTED = "LanguageSelected",
  MAILBOX_SELECTED = "MailboxSelected",
  RECORDED = "Recorded",
  TRANSCRIBED = "Transcribed"
}



export declare class Mailbox {
  readonly id: string;
  readonly mailbox: string;
  readonly emailAddress?: string;
  constructor(init: ModelInit<Mailbox>);
  static copyOf(source: Mailbox, mutator: (draft: MutableModel<Mailbox>) => MutableModel<Mailbox> | void): Mailbox;
}

export declare class Voicemail {
  readonly id: string;
  readonly state?: VoicemailState | keyof typeof VoicemailState;
  readonly mailboxID?: string;
  readonly mailbox?: Mailbox;
  readonly callerID?: string;
  readonly duration?: number;
  readonly timestamp?: string;
  readonly transcript?: string;
  readonly bucket?: string;
  readonly key?: string;
  readonly targetLanguage?: string;
  constructor(init: ModelInit<Voicemail>);
  static copyOf(source: Voicemail, mutator: (draft: MutableModel<Voicemail>) => MutableModel<Voicemail> | void): Voicemail;
}