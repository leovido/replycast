import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Decode the token to get the request data
    const requestData = JSON.parse(Buffer.from(token, 'base64').toString());
    const { publicKey, requestFid } = requestData;

    // In a real implementation, you would:
    // 1. Store signer requests in a database with proper state tracking
    // 2. Use webhooks or polling to check status with Warpcast
    // 3. Verify the signer was actually approved on-chain

    // For now, we'll simulate checking the status
    // In production, you'd query the Farcaster Key Registry contract or use Warpcast API
    
    // Check if the key exists in the Farcaster Key Registry
    // This is a simplified simulation - in production you'd make actual blockchain calls
    const isApproved = await checkSignerApprovalStatus(publicKey, requestFid);

    const state = isApproved ? 'approved' : 'pending';

    res.status(200).json({
      state,
      publicKey,
      requestFid,
      userFid: isApproved ? requestFid : undefined,
    });
  } catch (error) {
    console.error('Error checking signer status:', error);
    res.status(500).json({ error: 'Failed to check signer status' });
  }
}

// Simulate checking signer approval status
// In production, this would query the actual Farcaster Key Registry contract
async function checkSignerApprovalStatus(publicKey: string, requestFid: number): Promise<boolean> {
  // This is a placeholder - in a real implementation you would:
  // 1. Connect to Optimism network
  // 2. Query the Key Registry contract at 0x00000000fc1237824fb747abde0ff18990e59b7e
  // 3. Check if the public key is registered for the given FID
  
  // For demo purposes, randomly approve after some time
  return Math.random() > 0.5;
}