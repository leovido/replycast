import React from "react";

export const AuthKitProvider = ({ children }) => <>{children}</>;

export const SignInButton = ({ onSuccess, onError, className }) => {
  return (
    <button
      data-testid="siwf-button"
      className={className}
      onClick={() => {
        try {
          onSuccess &&
            onSuccess({ fid: 42, username: "alice", displayName: "Alice" });
        } catch (e) {
          onError && onError(e);
        }
      }}
    >
      Sign in with Farcaster
    </button>
  );
};