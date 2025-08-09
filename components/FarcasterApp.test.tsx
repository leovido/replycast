import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FarcasterApp from "./FarcasterApp";

jest.mock("@farcaster/miniapp-sdk");

jest.mock("@farcaster/auth-kit", () => ({
  __esModule: true,
  AuthKitProvider: ({ children }: any) => children,
  SignInButton: ({ onSuccess, className }: any) => (
    <button
      data-testid="siwf-button"
      className={className}
      onClick={() => onSuccess({ fid: 7, username: "test" })}
    >
      SIWF
    </button>
  ),
}));

jest.mock("../hooks/useFarcasterData", () => ({
  useFarcasterData: () => ({
    allConversations: [],
    userOpenRank: null,
    loading: false,
    error: null,
    handleRefresh: jest.fn(),
    hasMore: false,
    loadMoreConversations: jest.fn(),
    isLoadingMore: false,
    isRefreshing: false,
  }),
}));

jest.mock("../hooks/useOpenRank", () => ({
  useOpenRank: () => ({
    fetchOpenRankRanks: jest.fn(),
    clearCache: jest.fn(),
    openRankRanks: new Map(),
  }),
}));

jest.mock("../hooks/useAnalytics", () => ({
  useAppAnalytics: () => ({
    trackAppOpened: jest.fn(),
    trackTabChanged: jest.fn(),
    trackThemeChanged: jest.fn(),
    trackSettingsOpened: jest.fn(),
    trackMarkAsRead: jest.fn(),
    trackDiscardCast: jest.fn(),
    trackRefreshData: jest.fn(),
    trackAppError: jest.fn(),
    trackCastViewed: jest.fn(),
  }),
  ANALYTICS_ACTIONS: {},
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ""} {...props} />;
  },
}));

describe("FarcasterApp auth flow", () => {
  it("renders SIWF button initially and triggers sign-in", async () => {
    render(<FarcasterApp />);

    const button = await screen.findByTestId("siwf-button");
    fireEvent.click(button);

    expect(await screen.findByText(/Inbox/i)).toBeInTheDocument();
  });
});