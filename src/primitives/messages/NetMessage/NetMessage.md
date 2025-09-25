# NetMessage

The `NetMessage` is a class that represents a message in the Scintilla network.

```typescript
const message = new NetMessage({
    kind: 'PEER_INFO',
    cluster: 'core.banking',
    payload: new Uint8Array([1, 2, 3, 4, 5]),
    version: 1,
});
```

## Methods

### toHex

```typescript
const hex = message.toHex(); // Returns a hex string (e.g. 'a1d691a8010007756e6b6e6f776ee3b0c44200')
```


### fromHex

```typescript
const message = NetMessage.fromHex(hex); // Returns a NetMessage objec from a hex string
```


### toUint8Array

```typescript
const uint8Array = message.toUint8Array(); // Returns a Uint8Array representation of the message
```

### toHash

```typescript
const hash = message.toHash(); // Returns a hash of the message (e.g. '89467b4f4176083bd07f9bdbaeace5bdbde912414bb758680b6d5c7ebae4f1d4')
```

### setPayload

```typescript
message.setPayload(payload); // Sets the payload of the message (e.g. new Uint8Array([1, 2, 3, 4, 5]))
```


## Specification

A NetMessage is composed of the following parts:

- Chain Magic Number
- Version
- Kind
- Cluster
- Checksum
- Payload Length
- Payload

## Chain Magic Number

The `NetMessage` chain magic number is a 4-byte array that represents the chain of the message.
This is used to identify the chain of the message and is used to determine the network of the message.

## Version

The `NetMessage` version is a variable-length integer that represents the version of the message.
This is used to identify the version of the message and is used to determine the version of the message.

## Kind

The `NetMessage` kind is a variable-length integer that represents the type of message.  
This is done so that each node can quickly determine the type of message and handle it accordingly.

```bash
UNKNOWN: 0,
PEER_INFO: 1,
REQUEST: 2,
RESPONSE: 3,
ACKHANDSHAKE: 4,
EPOCHBLOCK: 5,
CLUSTERBLOCK: 6,
HASHPROOF: 7,
TRANSACTION: 8,
TRANSITION: 9,
TRANSFER: 10,
STATEMENT: 11,
HANDSHAKE: 12,
QUORUMDECISION: 13,
QUORUMDECISIONVOTE: 14,
RELAYBLOCK: 15,
VOUCHER: 16
```

## Cluster

The `NetMessage` cluster is a string that represents the cluster of the message.
This is used to identify the cluster of the message and is used to determine the cluster of the message.


## Checksum

The `NetMessage` checksum is a 4-byte array that represents the checksum of the message.
This is used to verify the integrity of the message and is used to determine the checksum of the message.


## Payload Length

The `NetMessage` payload length is a variable-length integer that represents the length of the payload.
This is used to identify the length of the payload and is used to determine the length of the payload.


## Payload

The `NetMessage` payload is a variable-length array that represents the payload of the message.
This is used to represent the data of the message and is used to determine the payload of the message.
