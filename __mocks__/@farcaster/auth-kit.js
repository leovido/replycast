// Mock for @farcaster/auth-kit
const React = require("react");

export const SignInButton = jest.fn(({ onSuccess, onError, ...props }) => {
  return React.createElement(
    "button",
    {
      "data-testid": "siwf-button",
      onClick: () => {
        // Mock successful sign-in
        if (onSuccess) {
          onSuccess({
            fid: 42,
            username: "alice",
            displayName: "Alice",
            pfpUrl: "https://example.com/avatar.png",
          });
        }
      },
      ...props,
    },
    "Sign In with Farcaster"
  );
});

export const useSignIn = jest.fn(() => ({
  signIn: jest.fn(),
  connect: jest.fn(),
  reconnect: jest.fn(),
  isSuccess: false,
  isError: false,
  error: null,
  data: null,
  channelToken: null,
  url: "https://warpcast.com/~/sign-in-with-farcaster?nonce=test",
  validSignature: false,
}));

export default {
  SignInButton,
  useSignIn,
};
