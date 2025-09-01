# ReplyCast Smart Contract Deployment Guide

This guide will help you deploy the ReplyCast Registry smart contract for your Onchain Summer Awards submission.

## Prerequisites

1. **Node.js and pnpm** (already installed)
2. **MetaMask** or another Web3 wallet
3. **Base Sepolia testnet ETH** (for testing)
4. **Base Mainnet ETH** (for production)

## Setup

### 1. Install Hardhat and dependencies

```bash
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### 2. Create environment file

Create a `.env` file in the root directory:

```env
# Your wallet private key (keep this secret!)
PRIVATE_KEY=your_private_key_here

# Base Sepolia RPC URL (for testing)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base Mainnet RPC URL (for production)
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Basescan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Get Base Sepolia testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request testnet ETH

### 4. Get Base Mainnet ETH

1. Bridge ETH from Ethereum mainnet to Base using [Base Bridge](https://bridge.base.org/)
2. Or buy ETH directly on Base through Coinbase

## Deployment

### Test Deployment (Base Sepolia)

```bash
# Compile the contract
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy-contract.js --network baseSepolia
```

### Production Deployment (Base Mainnet)

```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy-contract.js --network baseMainnet
```

## Update Your Mini App

After deployment, update the contract address in `components/FarcasterApp.tsx`:

```typescript
const [contractAddress, setContractAddress] = useState('YOUR_DEPLOYED_CONTRACT_ADDRESS');
```

## Contract Features

The ReplyCast Registry contract provides:

- **User Registration**: Users can register with their FID
- **Reply Tracking**: Record reply analytics on-chain
- **Engagement Scoring**: Track user engagement metrics
- **Streak Tracking**: Monitor daily reply streaks
- **Global Statistics**: View platform-wide metrics

## Onchain Summer Awards Requirements

This contract satisfies the Onchain Summer Awards requirements:

✅ **Smart Contract Address**: Provides a non-token contract address  
✅ **Base Blockspace Usage**: Generates transactions on Base network  
✅ **Open Source**: MIT licensed contract code  
✅ **User Engagement**: Tracks Farcaster user interactions  
✅ **Transaction Volume**: Creates measurable on-chain activity  

## Contract Address

After deployment, your contract address will be displayed in the console. Use this address for your hackathon submission.

## Verification

The deployment script automatically attempts to verify the contract on Basescan. If verification fails, you can manually verify:

1. Go to [Basescan](https://basescan.org/) (mainnet) or [Base Sepolia](https://sepolia.basescan.org/) (testnet)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in the verification details

## Testing

You can test the contract functions using the Basescan interface or by integrating with your Mini App.

## Security Notes

- Keep your private key secure and never commit it to version control
- Test thoroughly on Base Sepolia before deploying to mainnet
- The contract includes basic access controls and input validation
- Consider adding more advanced features like upgradeability if needed

## Support

For questions about the deployment process, refer to:
- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Onchain Summer Awards](https://onchain-summer-awards.devfolio.co/overview)
