/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateMailboxInput = {
  id?: string | null,
  mailbox: string,
  emailAddress?: string | null,
};

export type ModelMailboxConditionInput = {
  mailbox?: ModelStringInput | null,
  emailAddress?: ModelStringInput | null,
  and?: Array< ModelMailboxConditionInput | null > | null,
  or?: Array< ModelMailboxConditionInput | null > | null,
  not?: ModelMailboxConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Mailbox = {
  __typename: "Mailbox",
  id?: string,
  mailbox?: string,
  emailAddress?: string | null,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateMailboxInput = {
  id: string,
  mailbox?: string | null,
  emailAddress?: string | null,
};

export type DeleteMailboxInput = {
  id?: string | null,
};

export type CreateVoicemailInput = {
  id?: string | null,
  state?: VoicemailState | null,
  mailboxID?: string | null,
  callerID?: string | null,
  duration?: number | null,
  timestamp?: string | null,
  transcript?: string | null,
  bucket?: string | null,
  key?: string | null,
  targetLanguage?: string | null,
};

export enum VoicemailState {
  Created = "Created",
  LanguageSelected = "LanguageSelected",
  MailboxSelected = "MailboxSelected",
  Recorded = "Recorded",
  Transcribed = "Transcribed",
}


export type ModelVoicemailConditionInput = {
  state?: ModelVoicemailStateInput | null,
  mailboxID?: ModelIDInput | null,
  callerID?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  timestamp?: ModelStringInput | null,
  transcript?: ModelStringInput | null,
  bucket?: ModelStringInput | null,
  key?: ModelStringInput | null,
  targetLanguage?: ModelStringInput | null,
  and?: Array< ModelVoicemailConditionInput | null > | null,
  or?: Array< ModelVoicemailConditionInput | null > | null,
  not?: ModelVoicemailConditionInput | null,
};

export type ModelVoicemailStateInput = {
  eq?: VoicemailState | null,
  ne?: VoicemailState | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Voicemail = {
  __typename: "Voicemail",
  id?: string,
  state?: VoicemailState | null,
  mailboxID?: string | null,
  mailbox?: Mailbox,
  callerID?: string | null,
  duration?: number | null,
  timestamp?: string | null,
  transcript?: string | null,
  bucket?: string | null,
  key?: string | null,
  targetLanguage?: string | null,
  createdAt?: string,
  updatedAt?: string,
};

export type UpdateVoicemailInput = {
  id: string,
  state?: VoicemailState | null,
  mailboxID?: string | null,
  callerID?: string | null,
  duration?: number | null,
  timestamp?: string | null,
  transcript?: string | null,
  bucket?: string | null,
  key?: string | null,
  targetLanguage?: string | null,
};

export type DeleteVoicemailInput = {
  id: string,
};

export type ModelMailboxFilterInput = {
  id?: ModelIDInput | null,
  mailbox?: ModelStringInput | null,
  emailAddress?: ModelStringInput | null,
  and?: Array< ModelMailboxFilterInput | null > | null,
  or?: Array< ModelMailboxFilterInput | null > | null,
  not?: ModelMailboxFilterInput | null,
};

export type ModelMailboxConnection = {
  __typename: "ModelMailboxConnection",
  items?:  Array<Mailbox | null > | null,
  nextToken?: string | null,
};

export type ModelVoicemailFilterInput = {
  id?: ModelIDInput | null,
  state?: ModelVoicemailStateInput | null,
  mailboxID?: ModelIDInput | null,
  callerID?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  timestamp?: ModelStringInput | null,
  transcript?: ModelStringInput | null,
  bucket?: ModelStringInput | null,
  key?: ModelStringInput | null,
  targetLanguage?: ModelStringInput | null,
  and?: Array< ModelVoicemailFilterInput | null > | null,
  or?: Array< ModelVoicemailFilterInput | null > | null,
  not?: ModelVoicemailFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelVoicemailConnection = {
  __typename: "ModelVoicemailConnection",
  items?:  Array<Voicemail | null > | null,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type CreateMailboxMutationVariables = {
  input?: CreateMailboxInput,
  condition?: ModelMailboxConditionInput | null,
};

export type CreateMailboxMutation = {
  createMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateMailboxMutationVariables = {
  input?: UpdateMailboxInput,
  condition?: ModelMailboxConditionInput | null,
};

export type UpdateMailboxMutation = {
  updateMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteMailboxMutationVariables = {
  input?: DeleteMailboxInput,
  condition?: ModelMailboxConditionInput | null,
};

export type DeleteMailboxMutation = {
  deleteMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateVoicemailMutationVariables = {
  input?: CreateVoicemailInput,
  condition?: ModelVoicemailConditionInput | null,
};

export type CreateVoicemailMutation = {
  createVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateVoicemailMutationVariables = {
  input?: UpdateVoicemailInput,
  condition?: ModelVoicemailConditionInput | null,
};

export type UpdateVoicemailMutation = {
  updateVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteVoicemailMutationVariables = {
  input?: DeleteVoicemailInput,
  condition?: ModelVoicemailConditionInput | null,
};

export type DeleteVoicemailMutation = {
  deleteVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetMailboxQueryVariables = {
  id?: string,
};

export type GetMailboxQuery = {
  getMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListMailboxsQueryVariables = {
  filter?: ModelMailboxFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListMailboxsQuery = {
  listMailboxs?:  {
    __typename: "ModelMailboxConnection",
    items?:  Array< {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetVoicemailQueryVariables = {
  id?: string,
};

export type GetVoicemailQuery = {
  getVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListVoicemailsQueryVariables = {
  id?: string | null,
  filter?: ModelVoicemailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListVoicemailsQuery = {
  listVoicemails?:  {
    __typename: "ModelVoicemailConnection",
    items?:  Array< {
      __typename: "Voicemail",
      id: string,
      state?: VoicemailState | null,
      mailboxID?: string | null,
      callerID?: string | null,
      duration?: number | null,
      timestamp?: string | null,
      transcript?: string | null,
      bucket?: string | null,
      key?: string | null,
      targetLanguage?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type VoicemailsByStateQueryVariables = {
  state?: VoicemailState | null,
  timestamp?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelVoicemailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type VoicemailsByStateQuery = {
  voicemailsByState?:  {
    __typename: "ModelVoicemailConnection",
    items?:  Array< {
      __typename: "Voicemail",
      id: string,
      state?: VoicemailState | null,
      mailboxID?: string | null,
      callerID?: string | null,
      duration?: number | null,
      timestamp?: string | null,
      transcript?: string | null,
      bucket?: string | null,
      key?: string | null,
      targetLanguage?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type OnCreateMailboxSubscription = {
  onCreateMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateMailboxSubscription = {
  onUpdateMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteMailboxSubscription = {
  onDeleteMailbox?:  {
    __typename: "Mailbox",
    id: string,
    mailbox: string,
    emailAddress?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateVoicemailSubscription = {
  onCreateVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateVoicemailSubscription = {
  onUpdateVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteVoicemailSubscription = {
  onDeleteVoicemail?:  {
    __typename: "Voicemail",
    id: string,
    state?: VoicemailState | null,
    mailboxID?: string | null,
    mailbox?:  {
      __typename: "Mailbox",
      id: string,
      mailbox: string,
      emailAddress?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    callerID?: string | null,
    duration?: number | null,
    timestamp?: string | null,
    transcript?: string | null,
    bucket?: string | null,
    key?: string | null,
    targetLanguage?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
