import { NextApiRequest, NextApiResponse } from 'next';
import { 
  makeCastAdd, 
  getSSLHubRpcClient, 
  FarcasterNetwork,
  CastType,
  NobleEd25519Signer,
} from '@farcaster/hub-nodejs';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, parentHash, signerToken } = req.body;

  if (!text || !signerToken) {
    return res.status(400).json({ error: 'Text and signer token are required' });
  }

  if (text.length > 320) {
    return res.status(400).json({ error: 'Text must be 320 characters or less' });
  }

  try {
    // Decode the signer token to get the private key and other data
    const signerData = JSON.parse(Buffer.from(signerToken, 'base64').toString());
    const { privateKey, requestFid } = signerData;

    // Create a wallet from the private key
    const wallet = new ethers.Wallet(privateKey);
    const signerPrivateKey = new Uint8Array(Buffer.from(privateKey.slice(2), 'hex'));
    
    // Create a proper signer
    const signer = new NobleEd25519Signer(signerPrivateKey);

    // Get current timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Create the cast message
    const castAddBody = {
      text,
      embeds: [],
      embedsDeprecated: [],
      mentions: [],
      mentionsPositions: [],
      parentCastId: parentHash ? { 
        fid: 0, // This should be the parent cast's FID, but we'll use 0 for simplicity
        hash: new Uint8Array(Buffer.from(parentHash.slice(2), 'hex'))
      } : undefined,
      type: CastType.CAST,
    };

    // Create the cast message using Farcaster Hub utilities
    const castMessage = await makeCastAdd(
      castAddBody,
      { fid: requestFid, network: FarcasterNetwork.MAINNET },
      signer
    );

    if (castMessage.isErr()) {
      throw new Error(`Failed to create cast message: ${castMessage.error}`);
    }

    // For demonstration, we'll log the message instead of submitting to a hub
    // In production, you would submit to a Farcaster hub:
    
    // Example with a hub client:
    // const client = getSSLHubRpcClient('hub.farcaster.xyz');
    // const result = await client.submitMessage(castMessage.value);
    
    console.log('Cast message created successfully:', {
      hash: Buffer.from(castMessage.value.hash).toString('hex'),
      fid: requestFid,
      text,
      timestamp
    });

    // Generate a mock hash for the response
    const mockHash = '0x' + Buffer.from(castMessage.value.hash).toString('hex');

    res.status(200).json({
      success: true,
      cast: {
        text,
        parentHash: parentHash || null,
        authorFid: requestFid,
        timestamp,
        hash: mockHash,
      },
      message: 'Cast created successfully (demo mode)',
    });
  } catch (error) {
    console.error('Error creating cast:', error);
    res.status(500).json({ 
      error: 'Failed to create cast',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}