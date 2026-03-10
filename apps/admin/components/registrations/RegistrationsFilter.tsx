import React from "react";
import {
  Search,
  RotateCcw,
  Filter,
  Calendar,
  Users as UsersIcon,
} from "lucide-react";
import { DEPARTMENTS, YEARS, TEAM_NAMES } from "../../app/users/constants";

interface Event {
  _id: string;
  title: string;
}

interface RegistrationsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  events: Event[];
  eventId: string;
  setEventId: (value: string) => void;
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  onReset: () => void;
}

const RegistrationsFilter = ({
  search,
  setSearch,
  events,
  eventId,
  setEventId,
  teamFilter,
  setTeamFilter,
  yearFilter,
  setYearFilter,
  departmentFilter,
  setDepartmentFilter,
  onReset,
}: RegistrationsFilterProps) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 group min-w-[300px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-[#ff6719] transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search by attendee name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-[#ff6719] transition-all outline-none text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Event Filter */}
          <div className="relative group min-w-[180px]">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-gray-50 border-transparent rounded-2xl text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-[#ff6719] transition-all outline-none cursor-pointer"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="relative group min-w-[140px]">
            <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-gray-50 border-transparent rounded-2xl text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-[#ff6719] transition-all outline-none cursor-pointer"
            >
              <option value="all">All Teams</option>
              {TEAM_NAMES.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-5 py-3 bg-gray-50 border-transparent rounded-2xl text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-[#ff6719] transition-all outline-none cursor-pointer min-w-[120px]"
          >
            <option value="all">All Years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-5 py-3 bg-gray-50 border-transparent rounded-2xl text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-[#ff6719] transition-all outline-none cursor-pointer min-w-[150px]"
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
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ff6719]/5 hover:bg-[#ff6719]/10 text-[#ff6719] rounded-2xl text-sm font-bold transition-all border border-[#ff6719]/10 hover:border-[#ff6719]/20 active:scale-95 group ml-auto xl:ml-0"
            title="Reset All Filters"
          >
            <RotateCcw
              size={16}
              className="group-hover:-rotate-45 transition-transform"
            />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationsFilter;
