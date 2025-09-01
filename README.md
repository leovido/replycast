# ReplyCast Smart Contract

A gas-optimized smart contract for tracking Farcaster user reply analytics on the Base network.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file with:

```bash
# Your wallet private key (keep this secret!)
PRIVATE_KEY=your_private_key_here

# Base Sepolia RPC URL (for testing)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base Mainnet RPC URL (for production)
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Basescan API key for contract verification (optional)
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Get Testnet ETH

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### 4. Deploy to Testnet

```bash
npm run deploy:testnet
```

### 5. Deploy to Mainnet

```bash
npm run deploy:mainnet
```

## 📋 Available Scripts

- `npm run compile` - Compile the smart contract
- `npm run deploy:testnet` - Deploy to Base Sepolia testnet
- `npm run deploy:mainnet` - Deploy to Base Mainnet
- `npm run verify:testnet` - Verify contract on Basescan (testnet)
- `npm run verify:mainnet` - Verify contract on Basescan (mainnet)
- `npm run test` - Run tests
- `npm run clean` - Clean build artifacts

## 🔒 Security Features

- ✅ Access control with `onlyOwner` modifier
- ✅ Input validation for all parameters
- ✅ Gas-optimized using uint48 for timestamps
- ✅ Bit shifting for division by 2
- ✅ Unchecked blocks for safe operations
- ✅ Comprehensive event logging
- ✅ Payable functions for gas optimization

## 📊 Contract Functions

### User Management

- `registerUser(uint256 _fid)` - Register a new user
- `getUserStats(uint256 _fid)` - Get user analytics

### Analytics

- `recordReply(uint256 _fid, uint256 _responseTime, uint256 _engagementScore, string _castHash)` - Record reply data
- `getReplyHistory(uint256 _fid)` - Get user's reply history

### Global Stats

- `getGlobalStats()` - Get platform-wide statistics
- `getTopUsersByEngagement()` - Get top users by engagement

### Admin

- `transferOwnership(address _newOwner)` - Transfer contract ownership

## 🌐 Networks

- **Base Sepolia Testnet**: Chain ID 84532
- **Base Mainnet**: Chain ID 8453

## 📱 Integration with Mini App

After deployment, update your Mini App with the contract address:

```typescript
// In components/FarcasterApp.tsx
const [contractAddress, setContractAddress] = useState(
  "YOUR_DEPLOYED_CONTRACT_ADDRESS"
);
```

## 🔍 Verification

The deployment script automatically attempts to verify your contract on Basescan. If it fails, you can manually verify:

1. Go to [Basescan](https://basescan.org/) (mainnet) or [Base Sepolia](https://sepolia.basescan.org/) (testnet)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"

## 📈 Gas Optimizations

- **uint48 for timestamps**: Saves storage costs
- **Bit shifting**: `>> 1` instead of `/ 2`
- **Unchecked increments**: Safe loop optimizations
- **Payable functions**: Reduces gas costs
- **Named returns**: Eliminates local variables

## 🏆 Onchain Summer Awards

This contract is designed to meet the Onchain Summer Awards requirements:

- ✅ Non-token smart contract address
- ✅ Base network integration
- ✅ User engagement tracking
- ✅ Open source (MIT license)
- ✅ Gas-optimized for efficiency

## 📞 Support

For questions about deployment or integration, refer to:

- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Onchain Summer Awards](https://onchain-summer-awards.devfolio.co/overview)
