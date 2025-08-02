require("@testing-library/jest-dom");

// Suppress console.error during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0];

    // Suppress specific error messages from tests
    if (
      typeof message === "string" &&
      (message.includes("Warning: ReactDOM.render is no longer supported") ||
        message.includes("Notification replies API error:") ||
        message.includes("Error checking if user replied:") ||
        message.includes("Cannot read properties of undefined") ||
        message.includes("API Error"))
    ) {
      return; // Don't log these specific errors
    }

    originalError.call(console, ...args);
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
