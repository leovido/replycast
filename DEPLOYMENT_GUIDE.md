# Quick Deployment Guide for ReplyCast Contract

## Step 1: Create Environment File

Create a `.env` file in your project root:

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

## Step 2: Get Your Private Key

1. Open MetaMask
2. Click on your account (top right)
3. Go to "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key (starts with 0x...)

## Step 3: Get Testnet ETH

For Base Sepolia testnet:

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request testnet ETH

## Step 4: Deploy to Testnet

```bash
# Compile the contract
npx hardhat compile

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy-simple.js --network baseSepolia
```

## Step 5: Update Your Mini App

After deployment, copy the contract address and update it in `components/FarcasterApp.tsx`:

```typescript
const [contractAddress, setContractAddress] = useState(
  "YOUR_DEPLOYED_CONTRACT_ADDRESS"
);
```

## Step 6: Test the Integration

1. Start your development server: `pnpm run dev`
2. Open the app and go to the "On-Chain" tab
3. Connect your wallet and register
4. Test the functionality

## Step 7: Deploy to Mainnet (Optional)

Once you're satisfied with the testnet deployment:

```bash
# Deploy to Base Mainnet
npx hardhat run scripts/deploy-simple.js --network baseMainnet
```

## Troubleshooting

### "Hardhat only supports ESM projects"

- This is fixed now with the updated configuration

### "Insufficient funds"

- Get more testnet ETH from the faucet

### "Invalid private key"

- Make sure your private key starts with 0x and is 64 characters long

### "Network not found"

- Make sure you have the correct RPC URLs in your .env file

## Contract Address for Submission

After successful deployment, you'll get a contract address like:
`0x1234567890abcdef1234567890abcdef12345678`

Use this address for your Onchain Summer Awards submission!
