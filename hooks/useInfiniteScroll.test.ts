import { renderHook } from "@testing-library/react";
import { useInfiniteScroll } from "./useInfiniteScroll";

describe("useInfiniteScroll", () => {
  const mockLoadMoreConversations = jest.fn();

  const defaultProps = {
    hasMore: true,
    isLoadingMore: false,
    loading: false,
    loadMoreConversations: mockLoadMoreConversations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns observerRef", () => {
    const { result } = renderHook(() => useInfiniteScroll(defaultProps));

    expect(result.current.observerRef).toBeDefined();
    expect(result.current.observerRef.current).toBeNull();
  });

  it("returns the correct interface", () => {
    const { result } = renderHook(() => useInfiniteScroll(defaultProps));

    expect(result.current).toHaveProperty("observerRef");
    expect(typeof result.current.observerRef).toBe("object");
  });
});
