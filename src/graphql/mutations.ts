/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMailbox = /* GraphQL */ `
  mutation CreateMailbox(
    $input: CreateMailboxInput!
    $condition: ModelMailboxConditionInput
  ) {
    createMailbox(input: $input, condition: $condition) {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const updateMailbox = /* GraphQL */ `
  mutation UpdateMailbox(
    $input: UpdateMailboxInput!
    $condition: ModelMailboxConditionInput
  ) {
    updateMailbox(input: $input, condition: $condition) {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const deleteMailbox = /* GraphQL */ `
  mutation DeleteMailbox(
    $input: DeleteMailboxInput!
    $condition: ModelMailboxConditionInput
  ) {
    deleteMailbox(input: $input, condition: $condition) {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const createVoicemail = /* GraphQL */ `
  mutation CreateVoicemail(
    $input: CreateVoicemailInput!
    $condition: ModelVoicemailConditionInput
  ) {
    createVoicemail(input: $input, condition: $condition) {
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
export const updateVoicemail = /* GraphQL */ `
  mutation UpdateVoicemail(
    $input: UpdateVoicemailInput!
    $condition: ModelVoicemailConditionInput
  ) {
    updateVoicemail(input: $input, condition: $condition) {
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
export const deleteVoicemail = /* GraphQL */ `
  mutation DeleteVoicemail(
    $input: DeleteVoicemailInput!
    $condition: ModelVoicemailConditionInput
  ) {
    deleteVoicemail(input: $input, condition: $condition) {
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
