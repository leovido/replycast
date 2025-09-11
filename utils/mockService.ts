import {
  mockQuotientScores,
  mockOpenRankScores,
  mockConversations,
  mockFarcasterRepliesResponse,
  mockUser,
  getMockQuotientScores,
  getMockOpenRankScores,
  mockDelay,
  shouldUseMocks,
} from "./mockData";
import { shouldUseMocksWithFallback } from "./envChecker";

// Mock service for Quotient API
export class MockQuotientService {
  static async fetchScores(fids: number[]) {
    if (!shouldUseMocksWithFallback()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();

    // Simulate some FIDs not being found
    const foundFids = fids.filter((fid) => mockQuotientScores[fid]);
    const notFoundFids = fids.filter((fid) => !mockQuotientScores[fid]);

    if (notFoundFids.length > 0) {
      console.log(`Mock: FIDs not found: ${notFoundFids.join(", ")}`);
    }

    return getMockQuotientScores(foundFids);
  }
}

// Mock service for OpenRank API
export class MockOpenRankService {
  static async fetchRanks(fids: number[]) {
    if (!shouldUseMocksWithFallback()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();

    // Simulate some FIDs not being found
    const foundFids = fids.filter(
      (fid) => mockOpenRankScores[fid] !== undefined
    );
    const notFoundFids = fids.filter(
      (fid) => mockOpenRankScores[fid] === undefined
    );

    if (notFoundFids.length > 0) {
      console.log(`Mock: FIDs not found: ${notFoundFids.join(", ")}`);
    }

    return getMockOpenRankScores(foundFids);
  }
}

// Mock service for Farcaster API
export class MockFarcasterService {
  static async fetchReplies(
    userFid: number,
    dayFilter: string = "today",
    limit: number = 25,
    cursor?: string
  ) {
    if (!shouldUseMocksWithFallback()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();

    // Filter conversations based on day filter
    let filteredConversations = [...mockConversations];

    if (dayFilter !== "all") {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      switch (dayFilter) {
        case "today":
          filteredConversations = mockConversations.filter(
            (c) => now - c.timestamp < dayMs
          );
          break;
        case "3days":
          filteredConversations = mockConversations.filter(
            (c) => now - c.timestamp < 3 * dayMs
          );
          break;
        case "7days":
          filteredConversations = mockConversations.filter(
            (c) => now - c.timestamp < 7 * dayMs
          );
          break;
      }
    }

    // Simulate pagination
    const hasMore = cursor !== "mock-cursor-123";
    const nextCursor = hasMore ? "mock-cursor-123" : null;

    return {
      ...mockFarcasterRepliesResponse,
      unrepliedDetails: filteredConversations.slice(0, limit),
      unrepliedCount: filteredConversations.length,
      nextCursor,
    };
  }

  static async fetchUserReputation(
    userFid: number,
    reputationType: "quotient" | "openrank"
  ) {
    if (!shouldUseMocksWithFallback()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();

    if (reputationType === "quotient") {
      const score = mockQuotientScores[userFid];
      return score ? score.quotientScore : null;
    } else {
      return mockOpenRankScores[userFid] || null;
    }
  }
}

// Mock service for user authentication
export class MockAuthService {
  static async getMockUser() {
    if (!shouldUseMocksWithFallback()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();
    return mockUser;
  }
}

// Main mock service orchestrator
export class MockService {
  static isEnabled() {
    return shouldUseMocksWithFallback();
  }

  static async simulateNetworkError(probability: number = 0.1) {
    if (Math.random() < probability) {
      await mockDelay(100);
      throw new Error("Mock network error");
    }
  }

  static async simulateSlowNetwork(probability: number = 0.2) {
    if (Math.random() < probability) {
      await mockDelay(2000 + Math.random() * 3000); // 2-5 seconds
    }
  }
}
