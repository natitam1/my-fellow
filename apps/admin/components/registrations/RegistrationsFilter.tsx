import React from "react";
import {
  Search,
  RotateCcw,
  Filter,
  Calendar,
  Users as UsersIcon,
  ChevronDown,
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
    <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3 shadow-xs">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 group min-w-[300px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600 transition-colors"
          />
          <input
            type="text"
            placeholder="Search by attendee name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Event Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none cursor-pointer"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
          </div>

          {/* Team Filter */}
          <div className="relative min-w-[120px]">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none cursor-pointer"
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

          {/* Year Filter */}
          <div className="relative min-w-[100px]">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all outline-none cursor-pointer"
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

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all border border-amber-100 active:scale-95 group"
            title="Reset All Filters"
          >
            <RotateCcw
              size={13}
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
