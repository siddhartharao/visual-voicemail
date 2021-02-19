/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMailbox = /* GraphQL */ `
  subscription OnCreateMailbox {
    onCreateMailbox {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMailbox = /* GraphQL */ `
  subscription OnUpdateMailbox {
    onUpdateMailbox {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMailbox = /* GraphQL */ `
  subscription OnDeleteMailbox {
    onDeleteMailbox {
      id
      mailbox
      emailAddress
      createdAt
      updatedAt
    }
  }
`;
export const onCreateVoicemail = /* GraphQL */ `
  subscription OnCreateVoicemail {
    onCreateVoicemail {
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
export const onUpdateVoicemail = /* GraphQL */ `
  subscription OnUpdateVoicemail {
    onUpdateVoicemail {
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
export const onDeleteVoicemail = /* GraphQL */ `
  subscription OnDeleteVoicemail {
    onDeleteVoicemail {
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
