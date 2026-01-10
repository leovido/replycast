import React, { useState, useRef, useEffect, useCallback } from "react";
import type { ThemeMode } from "@/types/types";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isDarkTheme: boolean;
  themeMode: ThemeMode;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search conversations...",
  isDarkTheme,
  themeMode,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSearch]);

  // Debounced search
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, 250);
    },
    [onSearch]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Only search if 3+ characters
    if (value.length >= 3) {
      debouncedSearch(value);
    } else if (value.length === 0) {
      // Clear search immediately when empty
      onSearch("");
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const getContainerClass = () => {
    const baseClass = "relative flex items-center";
    return `${baseClass} ${className}`;
  };

  const getInputClass = () => {
    const baseClass =
      "w-full pl-12 pr-20 py-3.5 text-base rounded-lg border outline-none transition-colors duration-150";
    const themeClass = isDarkTheme
      ? "bg-gray-800/50 text-white placeholder-gray-400 border-gray-700/50 focus:border-gray-600 focus:bg-gray-800"
      : "bg-white text-gray-900 placeholder-gray-500 border-gray-200 focus:border-gray-300 focus:bg-white";

    return `${baseClass} ${themeClass}`;
  };

  const getActiveButtonClass = () => {
    const baseClass =
      "flex items-center justify-center w-11 h-11 rounded-md transition-colors duration-150";
    return isDarkTheme
      ? `${baseClass} bg-red-500/20 text-red-400`
      : `${baseClass} bg-red-100 text-red-600`;
  };

  const getInactiveButtonClass = () => {
    const baseClass =
      "flex items-center justify-center w-11 h-11 rounded-md transition-colors duration-150";
    return isDarkTheme
      ? `${baseClass} bg-gray-700/50 hover:bg-gray-700 text-gray-300`
      : `${baseClass} bg-gray-100 hover:bg-gray-200 text-gray-600`;
  };

  const getButtonClass = (isActive = false) => {
    return isActive ? getActiveButtonClass() : getInactiveButtonClass();
  };

  return (
    <div className={getContainerClass()}>
      {/* Search Icon */}
      <div className="absolute left-4 z-10 pointer-events-none">
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={"text-gray-400"}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className={getInputClass()}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Action Buttons */}
      <div className="absolute right-2 flex items-center gap-2">
        {/* Voice Search Button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={getButtonClass(isListening)}
            aria-label={isListening ? "Stop listening" : "Start voice search"}
            title={isListening ? "Stop listening" : "Start voice search"}
          >
            {isListening ? (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            ) : (
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        )}

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={getButtonClass()}
            aria-label="Clear search"
            title="Clear search"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Voice Search Status */}
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isDarkTheme
                ? "bg-red-500/20 text-red-400"
                : "bg-red-100 text-red-600"
            }`}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening...
          </div>
        </div>
      )}
    </div>
  );
}

// TypeScript declaration for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
