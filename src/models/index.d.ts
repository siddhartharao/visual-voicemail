import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Mailbox {
  readonly id: string;
  readonly mailbox: string;
  readonly emailAddress?: string;
  constructor(init: ModelInit<Mailbox>);
  static copyOf(source: Mailbox, mutator: (draft: MutableModel<Mailbox>) => MutableModel<Mailbox> | void): Mailbox;
}

export declare class Voicemail {
  readonly id: string;
  readonly mailbox?: Mailbox;
  readonly callerID?: string;
  readonly duration: number;
  readonly timestamp: string;
  readonly transcript?: string;
  readonly buckey: string;
  readonly key: string;
  constructor(init: ModelInit<Voicemail>);
  static copyOf(source: Voicemail, mutator: (draft: MutableModel<Voicemail>) => MutableModel<Voicemail> | void): Voicemail;
}