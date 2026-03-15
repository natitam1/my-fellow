import React from "react";
import { Search, Filter, RefreshCw, ChevronDown } from "lucide-react";
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
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-xs">
      <div className="flex-1 relative w-full md:w-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none min-w-[120px]">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 appearance-none hover:bg-gray-100 focus:bg-white transition-all cursor-pointer outline-none"
          >
            <option value="all">All Teams</option>
            {TEAM_NAMES.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
        </div>

        <div className="relative flex-1 md:flex-none min-w-[100px]">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 appearance-none hover:bg-gray-100 focus:bg-white transition-all cursor-pointer outline-none"
          >
            <option value="all">All Years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
        </div>

        <div className="relative flex-1 md:flex-none min-w-[140px]">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 appearance-none hover:bg-gray-100 focus:bg-white transition-all cursor-pointer outline-none"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
        </div>

        <button
          onClick={onReset}
          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-100"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default UsersFilter;
