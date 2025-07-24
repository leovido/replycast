import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid } = req.body;

  if (!fid) {
    return res.status(400).json({ error: 'FID is required' });
  }

  try {
    // Generate a new key pair for the signer
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey;

    // Create deadline (24 hours from now)
    const deadline = Math.floor(Date.now() / 1000) + 86400;

    // Create the message to sign for the signer request
    const requestFid = fid;
    const domain = {
      name: 'Farcaster SignerRequestValidator',
      version: '1',
      chainId: 10, // Optimism
      verifyingContract: '0x00000000FC700472606ED4fA22623Acf62c60553' as `0x${string}`,
    };

    const types = {
      SignerRequest: [
        { name: 'requestFid', type: 'uint256' },
        { name: 'key', type: 'bytes' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const value = {
      requestFid: BigInt(requestFid),
      key: publicKey,
      deadline: BigInt(deadline),
    };

    // This should be signed by the user's custody address
    // For now, we'll return the unsigned request and let the client handle signing
    const requestData = {
      publicKey,
      requestFid,
      deadline,
      domain,
      types,
      value,
    };

    // Create deeplink URL for Warpcast
    const deeplinkUrl = `https://warpcast.com/~/signer-requests/new?token=${encodeURIComponent(
      Buffer.from(JSON.stringify(requestData)).toString('base64')
    )}`;

    // Store the private key securely (in production, use proper encryption)
    // For demo purposes, we'll return a token that can be used to track this request
    const token = Buffer.from(JSON.stringify({ 
      publicKey, 
      privateKey, 
      requestFid, 
      deadline 
    })).toString('base64');

    res.status(200).json({
      token,
      publicKey,
      deeplinkUrl,
      deadline,
      requestFid,
    });
  } catch (error) {
    console.error('Error creating signer request:', error);
    res.status(500).json({ error: 'Failed to create signer request' });
  }
}