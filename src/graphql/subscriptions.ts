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
export const onUpdateVoicemail = /* GraphQL */ `
  subscription OnUpdateVoicemail {
    onUpdateVoicemail {
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
export const onDeleteVoicemail = /* GraphQL */ `
  subscription OnDeleteVoicemail {
    onDeleteVoicemail {
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
