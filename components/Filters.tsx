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
      | "openrank-asc"
      | "openrank-desc"
  ) => void;
  dayFilter: "today" | "all" | "3days" | "7days";
  onDayFilterChange: (filter: "today" | "all" | "3days" | "7days") => void;
  isDarkTheme: boolean;
  useOldDesign: boolean;
}

export function Filters({
  viewMode,
  onViewModeChange,
  sortOption,
  onSortOptionChange,
  dayFilter,
  onDayFilterChange,
  isDarkTheme,
  useOldDesign,
}: FiltersProps) {
  // Render old design
  if (useOldDesign) {
    return (
      <div className="glass rounded-2xl p-4 mt-6 border border-white/20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <span className="text-white/80 text-sm font-medium mr-2">
              View:
            </span>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white/20 text-white shadow-lg"
                  : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
              }`}
              aria-label="List view"
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
                aria-hidden="true"
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
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white/20 text-white shadow-lg"
                  : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
              }`}
              aria-label="Grid view"
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
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>

          {/* Day Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium mr-2">Day:</span>
            <select
              value={dayFilter}
              onChange={(e) => onDayFilterChange(e.target.value as any)}
              className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
              style={{
                fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
              }}
            >
              <option value="all" className="bg-gray-800 text-white">
                All
              </option>
              <option value="today" className="bg-gray-800 text-white">
                Today
              </option>
              <option value="3days" className="bg-gray-800 text-white">
                Last 3 days
              </option>
              <option value="7days" className="bg-gray-800 text-white">
                Last 7 days
              </option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium mr-2">
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as any)}
              className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
              style={{
                fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
              }}
            >
              <option value="newest" className="bg-gray-800 text-white">
                Newest
              </option>
              <option value="oldest" className="bg-gray-800 text-white">
                Oldest
              </option>
              <option value="fid-asc" className="bg-gray-800 text-white">
                FID: Low → High
              </option>
              <option value="fid-desc" className="bg-gray-800 text-white">
                FID: High → Low
              </option>
              <option value="short" className="bg-gray-800 text-white">
                Cast: Short (&lt;20 chars)
              </option>
              <option value="medium" className="bg-gray-800 text-white">
                Cast: Medium (20–50 chars)
              </option>
              <option value="long" className="bg-gray-800 text-white">
                Cast: Long (&gt;50 chars)
              </option>
              <option value="openrank-asc" className="bg-gray-800 text-white">
                OpenRank: Low → High
              </option>
              <option value="openrank-desc" className="bg-gray-800 text-white">
                OpenRank: High → Low
              </option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Render new design
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
