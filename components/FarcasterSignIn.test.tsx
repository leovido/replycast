import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FarcasterSignIn } from "./FarcasterSignIn";
import { sdk } from "@farcaster/miniapp-sdk";
import * as AuthKit from "@farcaster/auth-kit";

jest.mock("@farcaster/miniapp-sdk");

describe("FarcasterSignIn (web SIWF)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sdk.isInMiniApp as jest.Mock).mockResolvedValue(false);
  });

  it("renders SIWF button on web and calls onSignIn on success", async () => {
    const onSignIn = jest.fn();
    const onError = jest.fn();
    render(<FarcasterSignIn onSignIn={onSignIn} onError={onError} />);

    const button = await screen.findByTestId("siwf-button");
    fireEvent.click(button);

    expect(onSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ fid: 42, username: "alice" })
    );
    expect(onError).not.toHaveBeenCalled();
  });

  it("does not render on mini app when user context exists", async () => {
    (sdk.isInMiniApp as jest.Mock).mockResolvedValue(true);
    Object.defineProperty(sdk, "context", {
      get: () => Promise.resolve({ user: { fid: 1, username: "bob" } }),
    });

    const onSignIn = jest.fn();
    const onError = jest.fn();
    const { container } = render(
      <FarcasterSignIn onSignIn={onSignIn} onError={onError} />
    );

    await waitFor(() => expect(onSignIn).toHaveBeenCalled());
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("shows error when onSuccess payload is missing fid", async () => {
    const spy = jest
      .spyOn(AuthKit, "SignInButton")
      // @ts-expect-error allow overriding component signature in test
      .mockImplementation(({ onSuccess }) => (
        <button data-testid="siwf-button" onClick={() => onSuccess({})}>
          SIWF
        </button>
      ));

    const onSignIn = jest.fn();
    const onError = jest.fn();
    render(<FarcasterSignIn onSignIn={onSignIn} onError={onError} />);

    fireEvent.click(await screen.findByTestId("siwf-button"));

    expect(onSignIn).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(screen.getByText(/missing fid/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});