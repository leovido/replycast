import { ReputationType } from "@/hooks/useReputation";

interface ReputationFilterProps {
  reputationType: ReputationType;
  onReputationTypeChange: (type: ReputationType) => void;
  isDarkTheme: boolean;
}

export function ReputationFilter({
  reputationType,
  onReputationTypeChange,
  isDarkTheme,
}: ReputationFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-medium ${
          isDarkTheme ? "text-white/80" : "text-gray-700"
        }`}
      >
        Reputation:
      </span>
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          onClick={() => onReputationTypeChange("quotient")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            reputationType === "quotient"
              ? isDarkTheme
                ? "bg-purple-600 text-white"
                : "bg-purple-500 text-white"
              : isDarkTheme
              ? "text-white/60 hover:text-white/80 hover:bg-white/10"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          Quotient
        </button>
        <button
          onClick={() => onReputationTypeChange("openrank")}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            reputationType === "openrank"
              ? isDarkTheme
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : isDarkTheme
              ? "text-white/60 hover:text-white/80 hover:bg-white/10"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          OpenRank
        </button>
      </div>
    </div>
  );
}
