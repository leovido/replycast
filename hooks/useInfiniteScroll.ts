import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  loading: boolean;
  loadMoreConversations: () => void;
}

export function useInfiniteScroll({
  hasMore,
  isLoadingMore,
  loading,
  loadMoreConversations,
}: UseInfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = observerRef.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMoreConversations();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(current);

    return () => {
      observer.unobserve(current);
    };
  }, [hasMore, isLoadingMore, loading, loadMoreConversations]);

  return { observerRef };
}