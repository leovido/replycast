require("@testing-library/jest-dom");

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props) {
    return require("react").createElement("img", props);
  },
}));

// Mock the Farcaster SDK
jest.mock("@farcaster/miniapp-sdk", () => ({
  sdk: {
    actions: {
      ready: jest.fn(),
      composeCast: jest.fn(),
      viewCast: jest.fn(),
    },
    isInMiniApp: jest.fn(),
    context: {
      user: {
        fid: 203666,
        username: "testuser",
        displayName: "Test User",
      },
    },
  },
}));
