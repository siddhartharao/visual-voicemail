/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMailbox = /* GraphQL */ `
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
export const listMailboxs = /* GraphQL */ `
  query ListMailboxs(
    $filter: ModelMailboxFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMailboxs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        mailbox
        emailAddress
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getVoicemail = /* GraphQL */ `
  query GetVoicemail($id: ID!) {
    getVoicemail(id: $id) {
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
      createdAt
      updatedAt
    }
  }
`;
export const listVoicemails = /* GraphQL */ `
  query ListVoicemails(
    $id: ID
    $filter: ModelVoicemailFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listVoicemails(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const voicemailsByMailboxStateAndTime = /* GraphQL */ `
  query VoicemailsByMailboxStateAndTime(
    $mailboxID: ID
    $stateTimestamp: ModelVoicemailQueryIndexCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelVoicemailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    voicemailsByMailboxStateAndTime(
      mailboxID: $mailboxID
      stateTimestamp: $stateTimestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const voicemailsByState = /* GraphQL */ `
  query VoicemailsByState(
    $state: VoicemailState
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelVoicemailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    voicemailsByState(
      state: $state
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
