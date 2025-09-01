# 🚀 Simple ReplyCast Contract Deployment

Since we had issues with Hardhat configuration, here's the **easiest way** to deploy your smart contract:

## 🎯 **Option 1: Remix IDE (Recommended)**

### Step 1: Go to Remix

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new file called `ReplyCastRegistry.sol`

### Step 2: Copy the Contract Code

Copy this optimized contract code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReplyCastRegistry {
    struct UserAnalytics {
        uint48 totalReplies;
        uint48 averageResponseTime;
        uint48 lastActive;
        uint48 streakDays;
        uint48 totalEngagement;
        bool isRegistered;
    }

    struct ReplyRecord {
        uint48 timestamp;
        uint48 responseTime;
        uint48 engagementScore;
        string castHash;
    }

    mapping(uint256 => UserAnalytics) public userAnalytics;
    mapping(uint256 => ReplyRecord[]) public replyHistory;
    mapping(address => uint256) public addressToFid;

    uint256 public totalUsers;
    uint256 public totalReplies;
    uint256 public totalEngagement;

    address public owner;

    event UserRegistered(address indexed user, uint256 fid);
    event ReplyRecorded(uint256 indexed fid, uint256 responseTime, uint256 engagement);
    event StreakUpdated(uint256 indexed fid, uint256 newStreak);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ContractDeployed(address indexed owner, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        emit ContractDeployed(msg.sender, block.timestamp);
    }

    function registerUser(uint256 _fid) external {
        require(!userAnalytics[_fid].isRegistered, "User already registered");
        require(_fid != 0, "Invalid FID");

        userAnalytics[_fid] = UserAnalytics(0, 0, uint48(block.timestamp), 0, 0, true);
        addressToFid[msg.sender] = _fid;
        totalUsers++;

        emit UserRegistered(msg.sender, _fid);
    }

    function recordReply(uint256 _fid, uint256 _responseTime, uint256 _engagementScore, string memory _castHash) external {
        require(userAnalytics[_fid].isRegistered, "User not registered");
        require(_responseTime != 0, "Invalid response time");
        require(_engagementScore != 0 && _engagementScore <= 100, "Invalid engagement score");
        require(bytes(_castHash).length != 0, "Invalid cast hash");

        UserAnalytics storage analytics = userAnalytics[_fid];
        ReplyRecord memory newReply = ReplyRecord(
            uint48(block.timestamp),
            uint48(_responseTime),
            uint48(_engagementScore),
            _castHash
        );

        analytics.totalReplies++;
        analytics.averageResponseTime = uint48((analytics.averageResponseTime + _responseTime) >> 1);
        analytics.lastActive = uint48(block.timestamp);
        analytics.totalEngagement = uint48(analytics.totalEngagement + _engagementScore);

        if (block.timestamp - analytics.lastActive <= 1 days) {
            analytics.streakDays++;
        } else {
            analytics.streakDays = 1;
        }

        replyHistory[_fid].push(newReply);
        totalReplies++;
        totalEngagement += _engagementScore;

        emit ReplyRecorded(_fid, _responseTime, _engagementScore);
        emit StreakUpdated(_fid, analytics.streakDays);
    }

    function getUserStats(uint256 _fid) external view returns (UserAnalytics memory) {
        return userAnalytics[_fid];
    }

    function getReplyHistory(uint256 _fid) external view returns (ReplyRecord[] memory) {
        return replyHistory[_fid];
    }

    function getGlobalStats() external view returns (uint256 _totalUsers, uint256 _totalReplies, uint256 _totalEngagement) {
        return (totalUsers, totalReplies, totalEngagement);
    }

    function transferOwnership(address _newOwner) external payable onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
}
```

### Step 3: Compile

1. Go to "Solidity Compiler" tab
2. Set compiler version to `0.8.20`
3. Click "Compile ReplyCastRegistry.sol"

### Step 4: Deploy

1. Go to "Deploy & Run Transactions" tab
2. Set environment to "Injected Provider - MetaMask"
3. Make sure MetaMask is connected to **Base Sepolia** testnet
4. Click "Deploy"

### Step 5: Get Contract Address

After deployment, copy the contract address and update your Mini App:

```typescript
// In components/FarcasterApp.tsx
const [contractAddress, setContractAddress] = useState(
  "YOUR_DEPLOYED_CONTRACT_ADDRESS"
);
```

## 🌐 **Network Setup**

### Base Sepolia Testnet

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

### Get Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request testnet ETH

## 🏆 **Onchain Summer Awards Ready**

Your contract will now:

- ✅ Provide a **smart contract address** (not a token)
- ✅ Generate **Base blockspace usage**
- ✅ Track **user engagement** on-chain
- ✅ Be **open source** (MIT license)
- ✅ Create **measurable transaction volume**

## 📱 **Test Your Integration**

1. Start your Mini App: `pnpm run dev`
2. Go to the "On-Chain" tab
3. Connect your wallet and register
4. Test the functionality

## 🔍 **Verify on Basescan**

1. Go to [Base Sepolia Explorer](https://sepolia.basescan.org/)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"

---

**That's it!** You now have a deployed smart contract address for your Onchain Summer Awards submission. 🎉
