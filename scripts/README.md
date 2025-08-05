# Scripts

This directory contains utility scripts for the ReplyCast widget.

## OpenRank Checker

Check OpenRank scores and rankings for specific FIDs.

### Usage

```bash
# Check a single FID
pnpm run check-openrank 203666

# Check multiple FIDs
pnpm run check-openrank 203666 5406 196957

# Check many FIDs at once
pnpm run check-openrank 1 2 3 4 5 10 20 30 40 50
```

### Output

The script displays:

- Individual rank and score for each FID
- Summary statistics (average, best, worst rank)
- Formatted output with proper alignment

### Example Output

```
🔍 Checking OpenRank for 3 FID(s): 203666, 5406, 196957

📊 OpenRank Results:
==================================================
FID   203666 | Rank:       #567 | Score: 16,066,233,436,140,090,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000
FID     5406 | Rank:       #745 | Score: 12,630,314,624,377,677,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000
FID   196957 | Rank:       #229 | Score: 37,063,924,581,599,310,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000
==================================================

📈 Summary:
   Average Rank: #514
   Best Rank: #229
   Worst Rank: #745
```

### Features

- ✅ Batch checking multiple FIDs efficiently
- ✅ Error handling for invalid FIDs
- ✅ Formatted output with proper alignment
- ✅ Summary statistics
- ✅ Uses the same OpenRank contract as the main app
- ✅ No external dependencies beyond ethers.js
