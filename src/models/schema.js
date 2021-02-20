export const schema = {
    "models": {
        "Mailbox": {
            "name": "Mailbox",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "mailbox": {
                    "name": "mailbox",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "emailAddress": {
                    "name": "emailAddress",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                }
            },
            "syncable": true,
            "pluralName": "Mailboxes",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                }
            ]
        },
        "Voicemail": {
            "name": "Voicemail",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "state": {
                    "name": "state",
                    "isArray": false,
                    "type": {
                        "enum": "VoicemailState"
                    },
                    "isRequired": false,
                    "attributes": []
                },
                "mailboxID": {
                    "name": "mailboxID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": false,
                    "attributes": []
                },
                "mailbox": {
                    "name": "mailbox",
                    "isArray": false,
                    "type": {
                        "model": "Mailbox"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "association": {
                        "connectionType": "HAS_ONE",
                        "associatedWith": "id"
                    }
                },
                "callerID": {
                    "name": "callerID",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "duration": {
                    "name": "duration",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": false,
                    "attributes": []
                },
                "timestamp": {
                    "name": "timestamp",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": []
                },
                "transcript": {
                    "name": "transcript",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "bucket": {
                    "name": "bucket",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "key": {
                    "name": "key",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "targetLanguage": {
                    "name": "targetLanguage",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                }
            },
            "syncable": true,
            "pluralName": "Voicemails",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "key",
                    "properties": {
                        "fields": [
                            "id"
                        ]
                    }
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "queryIndex",
                        "fields": [
                            "mailboxID",
                            "state",
                            "timestamp"
                        ]
                    }
                }
            ]
        }
    },
    "enums": {
        "VoicemailState": {
            "name": "VoicemailState",
            "values": [
                "Created",
                "LanguageSelected",
                "MailboxSelected",
                "Recorded",
                "Transcribed"
            ]
        }
    },
    "nonModels": {},
    "version": "98be1de7587cdebfd6a69aa3a1aa6322"
};