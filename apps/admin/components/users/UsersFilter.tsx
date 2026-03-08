import React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { DEPARTMENTS, YEARS, TEAM_NAMES } from "../../app/users/constants";

interface UsersFilterProps {
  search: string;
  setSearch: (value: string) => void;
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  onReset: () => void;
}

const UsersFilter = ({
  search,
  setSearch,
  teamFilter,
  setTeamFilter,
  yearFilter,
  setYearFilter,
  departmentFilter,
  setDepartmentFilter,
  onReset,
}: UsersFilterProps) => {
  return (
    <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-2">
      <div className="flex-1 relative w-full md:w-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Live search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#ff6719]/20 transition-all font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto px-2 md:px-0">
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 appearance-none hover:border-gray-200 focus:ring-2 focus:ring-[#ff6719]/10 transition-all cursor-pointer"
          >
            <option value="all">All Teams</option>
            {TEAM_NAMES.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 appearance-none hover:border-gray-200 focus:ring-2 focus:ring-[#ff6719]/10 transition-all cursor-pointer"
        >
          <option value="all">All Years</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 appearance-none hover:border-gray-200 focus:ring-2 focus:ring-[#ff6719]/10 transition-all cursor-pointer"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button
          onClick={onReset}
          className="p-2.5 text-gray-400 hover:text-[#ff6719] hover:bg-orange-50 rounded-xl transition-all"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default UsersFilter;
