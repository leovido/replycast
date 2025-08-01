interface FiltersProps {
  viewMode: "list" | "grid";
  dayFilter: "all" | "today" | "3days" | "7days";
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
  onViewModeChange: (mode: "list" | "grid") => void;
  onDayFilterChange: (filter: "all" | "today" | "3days" | "7days") => void;
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
}

export function Filters({
  viewMode,
  dayFilter,
  sortOption,
  onViewModeChange,
  onDayFilterChange,
  onSortOptionChange,
}: FiltersProps) {
  return (
    <div className="glass rounded-2xl p-4 mt-6 border border-white/20">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span className="text-white/80 text-sm font-medium mr-2">View:</span>
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
          <span className="text-white/80 text-sm font-medium mr-2">Sort:</span>
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