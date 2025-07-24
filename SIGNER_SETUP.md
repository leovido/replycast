# Farcaster Signers Implementation

This document explains how the Farcaster signer functionality has been implemented in ReplyCast to enable users to reply to casts.

## Overview

Farcaster signers allow applications to post casts on behalf of users. This implementation provides:

1. **Signer Request Creation**: Generate new keypairs and create signer requests
2. **Approval Flow**: Guide users through the Warpcast approval process
3. **Status Monitoring**: Check if signers have been approved
4. **Cast Submission**: Send replies using approved signers

## Architecture

### Components

- **`useSigner` Hook** (`hooks/useSigner.ts`): Manages signer state and operations
- **`SignerSetup` Component** (`components/SignerSetup.tsx`): UI for signer setup flow
- **API Routes**:
  - `/api/signer/request`: Creates new signer requests
  - `/api/signer/status`: Checks signer approval status
  - `/api/signer/cast`: Submits casts using approved signers

### Flow

1. **User initiates signer setup**: Click "Authorize Signer" button
2. **Generate keypair**: Server creates new Ed25519 keypair
3. **Create deeplink**: Generate Warpcast URL for approval
4. **User approves**: User opens Warpcast and approves the signer
5. **Status polling**: App polls for approval status
6. **Ready to reply**: Once approved, user can reply to casts

## Implementation Details

### Signer Request Format

```typescript
interface SignerRequest {
  publicKey: string;
  requestFid: number;
  signature: string;
  deadline: number;
}
```

### Security Considerations

⚠️ **Important**: This is a demonstration implementation. For production use:

1. **Secure Key Storage**: Private keys should be encrypted and stored securely
2. **Database Integration**: Store signer requests and status in a database
3. **Proper Validation**: Verify signer approval on-chain using the Key Registry
4. **Hub Integration**: Submit casts to actual Farcaster hubs
5. **Error Handling**: Implement comprehensive error handling and retry logic

### Current Limitations

This implementation includes the following limitations that should be addressed for production:

1. **Mock Status Checking**: Signer approval status is simulated
2. **In-Memory Storage**: Signer data is stored in tokens (not persistent)
3. **No Hub Submission**: Casts are created but not submitted to hubs
4. **Basic Error Handling**: Limited error handling and recovery

## API Endpoints

### POST /api/signer/request

Creates a new signer request for a user.

**Request Body:**
```json
{
  "fid": 12345
}
```

**Response:**
```json
{
  "token": "base64-encoded-signer-data",
  "publicKey": "0x...",
  "deeplinkUrl": "https://warpcast.com/~/signer-requests/new?token=...",
  "deadline": 1234567890,
  "requestFid": 12345
}
```

### GET /api/signer/status

Checks the status of a signer request.

**Query Parameters:**
- `token`: The signer token from the request response

**Response:**
```json
{
  "state": "approved" | "pending" | "revoked",
  "publicKey": "0x...",
  "requestFid": 12345,
  "userFid": 12345
}
```

### POST /api/signer/cast

Submits a cast using an approved signer.

**Request Body:**
```json
{
  "text": "Hello Farcaster!",
  "parentHash": "0x..." // optional, for replies
  "signerToken": "base64-encoded-signer-data"
}
```

**Response:**
```json
{
  "success": true,
  "cast": {
    "text": "Hello Farcaster!",
    "parentHash": "0x...",
    "authorFid": 12345,
    "timestamp": 1234567890,
    "hash": "0x..."
  },
  "message": "Cast created successfully"
}
```

## Usage

### Setting Up a Signer

1. User visits the app and is prompted to set up a signer
2. Click "Authorize Signer" button
3. Warpcast opens with the signer request
4. User approves the request in Warpcast
5. App detects approval and enables reply functionality

### Replying to Casts

1. User clicks "Reply" on any conversation
2. App checks if signer is approved
3. If approved, opens reply modal
4. User types reply and clicks "Reply"
5. Cast is submitted using the approved signer

## Production Deployment

For production deployment, implement these improvements:

1. **Database Schema**:
   ```sql
   CREATE TABLE signers (
     id SERIAL PRIMARY KEY,
     user_fid INTEGER NOT NULL,
     public_key TEXT NOT NULL,
     private_key_encrypted TEXT NOT NULL,
     status VARCHAR(20) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     approved_at TIMESTAMP,
     deadline TIMESTAMP NOT NULL
   );
   ```

2. **Environment Variables**:
   ```env
   ENCRYPTION_KEY=your-encryption-key
   FARCASTER_HUB_URL=https://hub.farcaster.xyz
   DATABASE_URL=postgresql://...
   ```

3. **Key Registry Integration**:
   - Connect to Optimism network
   - Query Key Registry contract to verify signer approval
   - Implement webhook handlers for real-time status updates

4. **Hub Integration**:
   - Submit casts to production Farcaster hubs
   - Handle hub responses and errors
   - Implement message retry logic

## References

- [Farcaster Signer Requests Documentation](https://docs.farcaster.xyz/reference/warpcast/signer-requests)
- [Farcaster Hub API](https://docs.farcaster.xyz/reference/snapchain/api)
- [Key Registry Contract](https://docs.farcaster.xyz/reference/contracts/reference/key-registry)
- [@farcaster/hub-nodejs](https://github.com/farcasterxyz/hub-monorepo/tree/main/packages/hub-nodejs)