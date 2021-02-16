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
      buckey
      key
      createdAt
      updatedAt
    }
  }
`;
export const listVoicemails = /* GraphQL */ `
  query ListVoicemails(
    $filter: ModelVoicemailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVoicemails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        callerID
        duration
        timestamp
        transcript
        buckey
        key
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
