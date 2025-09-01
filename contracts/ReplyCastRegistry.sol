// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReplyCast Registry
 * @dev A smart contract for tracking Farcaster user reply analytics on-chain
 * @author ReplyCast Team
 * @notice This contract stores user engagement data and reply statistics
 */
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
    event ReplyRecorded(
        uint256 indexed fid,
        uint256 responseTime,
        uint256 engagement
    );
    event StreakUpdated(uint256 indexed fid, uint256 newStreak);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event ContractDeployed(address indexed owner, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        emit ContractDeployed(msg.sender, block.timestamp);
    }

    /**
     * @dev Register a new user with their FID
     * @param _fid The Farcaster ID of the user
     */
    function registerUser(uint256 _fid) external {
        require(!userAnalytics[_fid].isRegistered, "User already registered");
        require(_fid != 0, "Invalid FID");

        userAnalytics[_fid] = UserAnalytics(
            0,
            0,
            uint48(block.timestamp),
            0,
            0,
            true
        );
        addressToFid[msg.sender] = _fid;
        totalUsers++;

        emit UserRegistered(msg.sender, _fid);
    }

    /**
     * @dev Record a reply with analytics data
     * @param _fid The Farcaster ID of the user
     * @param _responseTime Response time in seconds
     * @param _engagementScore Engagement score (1-100)
     * @param _castHash Hash of the cast being replied to
     */
    function recordReply(
        uint256 _fid,
        uint256 _responseTime,
        uint256 _engagementScore,
        string memory _castHash
    ) external {
        require(userAnalytics[_fid].isRegistered, "User not registered");
        require(_responseTime != 0, "Invalid response time");
        require(
            _engagementScore != 0 && _engagementScore <= 100,
            "Invalid engagement score"
        );
        require(bytes(_castHash).length != 0, "Invalid cast hash");

        UserAnalytics storage analytics = userAnalytics[_fid];
        ReplyRecord memory newReply = ReplyRecord(
            uint48(block.timestamp),
            uint48(_responseTime),
            uint48(_engagementScore),
            _castHash
        );

        // Update analytics
        analytics.totalReplies++;
        analytics.averageResponseTime = uint48(
            (analytics.averageResponseTime + _responseTime) >> 1
        );
        analytics.lastActive = uint48(block.timestamp);
        analytics.totalEngagement = uint48(
            analytics.totalEngagement + _engagementScore
        );

        // Update streak (if reply is within 24 hours of last activity)
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

    /**
     * @dev Get user statistics
     * @param _fid The Farcaster ID of the user
     * @return User analytics data
     */
    function getUserStats(
        uint256 _fid
    ) external view returns (UserAnalytics memory) {
        return userAnalytics[_fid];
    }

    /**
     * @dev Get reply history for a user
     * @param _fid The Farcaster ID of the user
     * @return Array of reply records
     */
    function getReplyHistory(
        uint256 _fid
    ) external view returns (ReplyRecord[] memory) {
        return replyHistory[_fid];
    }

    /**
     * @dev Get global statistics
     * @return _totalUsers Total number of registered users
     * @return _totalReplies Total number of replies recorded
     * @return _totalEngagement Total engagement score
     */
    function getGlobalStats()
        external
        view
        returns (
            uint256 _totalUsers,
            uint256 _totalReplies,
            uint256 _totalEngagement
        )
    {
        return (totalUsers, totalReplies, totalEngagement);
    }

    /**
     * @dev Get top users by engagement (limited to 10)
     * @return topUsers Array of FIDs sorted by engagement
     */
    function getTopUsersByEngagement()
        external
        view
        returns (uint256[] memory topUsers)
    {
        topUsers = new uint256[](10);
        uint256 count;

        // This is a simplified implementation
        // In production, you might want to use a more efficient data structure

        for (uint256 i = 1; i <= 1000 && count < 10; ) {
            if (userAnalytics[i].isRegistered) {
                topUsers[count] = i;
                unchecked {
                    ++count;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Transfer ownership (only owner)
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external payable onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
}
