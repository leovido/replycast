interface FiltersProps {
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  sortOption:
    | "newest"
    | "oldest"
    | "fid-asc"
    | "fid-desc"
    | "short"
    | "medium"
    | "long"
    | "quotient-asc"
    | "quotient-desc"
    | "openrank-asc"
    | "openrank-desc";
  onSortOptionChange: (
    option:
      | "newest"
      | "oldest"
      | "fid-asc"
      | "fid-desc"
      | "short"
      | "medium"
      | "long"
      | "quotient-asc"
      | "quotient-desc"
      | "openrank-asc"
      | "openrank-desc"
  ) => void;
  dayFilter: "today" | "all" | "3days" | "7days";
  onDayFilterChange: (filter: "today" | "all" | "3days" | "7days") => void;
  reputationType: "quotient" | "openrank";
  onReputationTypeChange: (type: "quotient" | "openrank") => void;
  isDarkTheme: boolean;
}

export function Filters({
  viewMode,
  onViewModeChange,
  sortOption,
  onSortOptionChange,
  dayFilter,
  onDayFilterChange,
  reputationType,
  onReputationTypeChange,
  isDarkTheme,
}: FiltersProps) {
  return (
    <div className="px-6 pb-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={`${
            isDarkTheme
              ? "bg-white/10 backdrop-blur-sm border border-white/20"
              : "bg-white/60 backdrop-blur-sm border border-gray-200"
          } rounded-xl p-4`}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  isDarkTheme ? "text-white/80" : "text-gray-700"
                }`}
              >
                View:
              </span>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  onClick={() => onViewModeChange("list")}
                  className={`px-3 py-1.5 transition-colors ${
                    viewMode === "list"
                      ? isDarkTheme
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : isDarkTheme
                      ? "text-white/60 hover:text-white/80"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={`px-3 py-1.5 transition-colors ${
                    viewMode === "grid"
                      ? isDarkTheme
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : isDarkTheme
                      ? "text-white/60 hover:text-white/80"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  isDarkTheme ? "text-white/80" : "text-gray-700"
                }`}
              >
                Day:
              </span>
              <select
                value={dayFilter}
                onChange={(e) =>
                  onDayFilterChange(
                    e.target.value as "today" | "all" | "3days" | "7days"
                  )
                }
                className={`px-3 py-1.5 rounded border transition-colors ${
                  isDarkTheme
                    ? "bg-white/10 border-white/20 text-white focus:border-blue-400"
                    : "bg-white/80 border-gray-200 text-gray-700 focus:border-blue-500"
                }`}
              >
                <option value="today">Today</option>
                <option value="3days">3 Days</option>
                <option value="7days">7 Days</option>
                <option value="all">All</option>
              </select>
            </div>

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

            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${
                  isDarkTheme ? "text-white/80" : "text-gray-700"
                }`}
              >
                Sort:
              </span>
              <select
                value={sortOption}
                onChange={(e) =>
                  onSortOptionChange(
                    e.target.value as
                      | "newest"
                      | "oldest"
                      | "fid-asc"
                      | "fid-desc"
                      | "short"
                      | "medium"
                      | "long"
                      | "quotient-asc"
                      | "quotient-desc"
                      | "openrank-asc"
                      | "openrank-desc"
                  )
                }
                className={`px-3 py-1.5 rounded border transition-colors ${
                  isDarkTheme
                    ? "bg-white/10 border-white/20 text-white focus:border-blue-400"
                    : "bg-white/80 border-gray-200 text-gray-700 focus:border-blue-500"
                }`}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="fid-asc">FID ↑</option>
                <option value="fid-desc">FID ↓</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                <option value="quotient-asc">Quotient ↑</option>
                <option value="quotient-desc">Quotient ↓</option>
                <option value="openrank-asc">OpenRank ↑</option>
                <option value="openrank-desc">OpenRank ↓</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
