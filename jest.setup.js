import "@testing-library/jest-dom";

// Polyfill TextEncoder for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Silence console errors in tests to reduce noise
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const msg = args[0] || "";
    if (typeof msg === "string" && /Warning:.*not wrapped in act/.test(msg)) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalError;
});

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
        fid: 203666, // Test user FID
        username: "testuser",
        displayName: "Test User (Jest)",
      },
    },
  },
}));
