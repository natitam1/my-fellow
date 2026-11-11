"use client";

import React, { useState } from "react";

export function DevotionIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner Hint & Readout */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          SCRIPTURE_AUDIO.ENGINE
        </span>
        <span className="text-neutral-500">365 DAYS SYNC</span>
      </div>

      {/* Main Isometric Wire SVG */}
      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Base Isometric Plate */}
          <path
            d="M 180 30 L 320 100 L 180 170 L 40 100 Z"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Concentric Signal Rings */}
          <ellipse
            cx="180"
            cy="100"
            rx="90"
            ry="45"
            stroke="#FF6719"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            className={`transition-all duration-700 ${isHovered ? "opacity-90 stroke-primary" : "opacity-40"}`}
          />
          <ellipse
            cx="180"
            cy="100"
            rx="50"
            ry="25"
            stroke="#FF6719"
            strokeWidth="1.5"
            className="opacity-70"
          />

          {/* Center Floating Bible & Cross Disc */}
          <g className={`transition-transform duration-500 ${isHovered ? "-translate-y-2" : "translate-y-0"}`}>
            <circle
              cx="180"
              cy="95"
              r="28"
              fill="#FF6719"
              className="shadow-lg shadow-orange-500/30"
            />
            {/* White Cross in center */}
            <path
              d="M 180 82 L 180 108 M 172 90 L 188 90"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Floating Audio Nodes */}
            <circle cx="120" cy="75" r="7" fill="#FFFFFF" stroke="#FF6719" strokeWidth="2" />
            <circle cx="240" cy="75" r="7" fill="#FFFFFF" stroke="#FF6719" strokeWidth="2" />
            <circle cx="180" cy="140" r="7" fill="#FFFFFF" stroke="#FF6719" strokeWidth="2" />

            {/* Waveform bars */}
            <rect x="238" y="70" width="4" height="10" rx="2" fill="#FF6719" className="animate-pulse" />
            <rect x="118" y="70" width="4" height="10" rx="2" fill="#FF6719" className="animate-pulse" />
          </g>

          {/* Wire connectors with rounded elbows */}
          <path
            d="M 180 147 L 180 175 L 260 175"
            stroke="#FF6719"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
          <circle cx="260" cy="175" r="3.5" fill="#FF6719" />
          <text
            x="270"
            y="178"
            fill="#171717"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            AUDIO_STREAM // LIVE
          </text>
        </svg>
      </div>

      {/* Bottom Status strip */}
      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Campus Quiet Time</span>
        <span className="font-mono text-primary font-semibold">06:30 AM EAT</span>
      </div>
    </div>
  );
}

export function CommunityIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          ACTOR_GRAPH // CAN_POST_AS
        </span>
        <span className="text-neutral-500">8 TEAMS LINKED</span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Central Hub Actor */}
          <g className={`transition-all duration-500 ${isHovered ? "scale-105" : "scale-100"}`} style={{ transformOrigin: "180px 105px" }}>
            <circle cx="180" cy="105" r="32" fill="#FFFFFF" stroke="#FF6719" strokeWidth="2.5" />
            <circle cx="180" cy="98" r="9" fill="#FF6719" />
            <path
              d="M 166 122 C 166 114 172 112 180 112 C 188 112 194 114 194 122"
              stroke="#FF6719"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Verified badge */}
            <circle cx="198" cy="88" r="6" fill="#FF6719" />
            <path d="M 196 88 L 198 90 L 201 86" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Surrounding Connected Ministry Nodes */}
          {/* Node 1: Worship */}
          <path d="M 152 90 L 90 60" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="85" cy="58" r="16" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="85" y="62" textAnchor="middle" fill="#6B7280" fontSize="8" fontWeight="bold">WOR</text>

          {/* Node 2: Media */}
          <path d="M 208 90 L 270 60" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="275" cy="58" r="16" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="275" y="62" textAnchor="middle" fill="#6B7280" fontSize="8" fontWeight="bold">MED</text>

          {/* Node 3: Prayer */}
          <path d="M 152 120 L 90 150" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="85" cy="152" r="16" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="85" y="156" textAnchor="middle" fill="#6B7280" fontSize="8" fontWeight="bold">PRY</text>

          {/* Node 4: Charity */}
          <path d="M 208 120 L 270 150" stroke="#FF6719" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="275" cy="152" r="16" fill="#FF6719" />
          <text x="275" y="156" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">CHR</text>

          {/* Active Broadcast Wave */}
          <ellipse cx="180" cy="105" rx="55" ry="55" stroke="#FF6719" strokeWidth="1" strokeDasharray="4 4" className="opacity-40 animate-pulse" />
        </svg>
      </div>

      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Authentic Attributions</span>
        <span className="font-mono text-primary font-semibold">@FELLOW_OFFICIAL</span>
      </div>
    </div>
  );
}

export function GivingIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          PAYMENT_ROUTER // TELEBIRR_CBE
        </span>
        <span className="text-neutral-500">100% AUDITED</span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Isometric Vault Stack */}
          <g className={`transition-transform duration-500 ${isHovered ? "-translate-y-1" : "translate-y-0"}`}>
            {/* Layer 1 (Bottom) */}
            <path d="M 180 140 L 280 185 L 180 210 L 80 185 Z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
            <path d="M 80 185 L 80 195 L 180 220 L 280 195 L 280 185 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />

            {/* Layer 2 (Middle) */}
            <path d="M 180 100 L 280 145 L 180 170 L 80 145 Z" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
            <path d="M 80 145 L 80 155 L 180 180 L 280 155 L 280 145 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />

            {/* Layer 3 (Top Card with Heart) */}
            <path d="M 180 60 L 280 105 L 180 130 L 80 105 Z" fill="#FFFFFF" stroke="#FF6719" strokeWidth="2" />
            <path d="M 80 105 L 80 115 L 180 140 L 280 115 L 280 105 Z" fill="#FF6719" opacity="0.8" />

            {/* Golden Giving Heart Icon */}
            <path
              d="M 180 92 C 176 84 165 84 165 92 C 165 100 180 108 180 108 C 180 108 195 100 195 92 C 195 84 184 84 180 92 Z"
              fill="#FF6719"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </g>

          {/* Digital Receipt Wire */}
          <path d="M 180 50 L 180 25 L 250 25" stroke="#FF6719" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="250" cy="25" r="3" fill="#FF6719" />
          <text x="260" y="28" fill="#171717" fontSize="10" fontFamily="monospace" fontWeight="bold">
            NEEDY_STUDENT_FUND
          </text>
        </svg>
      </div>

      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Student Welfare Support</span>
        <span className="font-mono text-primary font-semibold">ETB 0 FEE</span>
      </div>
    </div>
  );
}

export function EventsIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          CONFERENCE_TICKET // PASS.IO
        </span>
        <span className="text-neutral-500">SEATS RESERVED</span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Isometric Conference Pass Card */}
          <g className={`transition-transform duration-500 ${isHovered ? "rotate-1" : "rotate-0"}`} style={{ transformOrigin: "180px 110px" }}>
            <rect x="70" y="50" width="220" height="120" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="220" y1="50" x2="220" y2="170" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="220" cy="50" r="10" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
            <circle cx="220" cy="170" r="10" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />

            {/* Ticket Header & Text */}
            <rect x="95" y="70" width="30" height="6" rx="3" fill="#FF6719" />
            <rect x="95" y="85" width="90" height="10" rx="3" fill="#171717" />
            <rect x="95" y="105" width="70" height="6" rx="3" fill="#9CA3AF" />
            <rect x="95" y="125" width="80" height="6" rx="3" fill="#D1D5DB" />

            {/* QR / Barcode Pattern */}
            <g transform="translate(240, 75)">
              <rect x="0" y="0" width="4" height="65" fill="#171717" />
              <rect x="7" y="0" width="2" height="65" fill="#171717" />
              <rect x="12" y="0" width="6" height="65" fill="#171717" />
              <rect x="22" y="0" width="3" height="65" fill="#171717" />
              <rect x="28" y="0" width="8" height="65" fill="#171717" />
            </g>
          </g>
        </svg>
      </div>

      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Annual Spiritual Retreat</span>
        <span className="font-mono text-primary font-semibold">DIGITAL PASS READY</span>
      </div>
    </div>
  );
}

export function StoreIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          FELLOWSHIP_STORE // LITERATURE
        </span>
        <span className="text-neutral-500">CAMPUS PICKUP</span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Base Isometric Plate */}
          <path
            d="M 180 40 L 310 105 L 180 170 L 50 105 Z"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Isometric Merchandise Box / Book Stack */}
          <g className={`transition-transform duration-500 ${isHovered ? "-translate-y-2" : "translate-y-0"}`}>
            {/* 3D Bible / Book */}
            <path d="M 120 100 L 170 75 L 210 95 L 160 120 Z" fill="#FF6719" stroke="#EA580C" strokeWidth="1.5" />
            <path d="M 120 100 L 120 112 L 160 132 L 160 120 Z" fill="#C2410C" stroke="#9A3412" strokeWidth="1.5" />
            <path d="M 160 120 L 160 132 L 210 107 L 210 95 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />
            {/* Book Ribbon */}
            <line x1="165" y1="85" x2="185" y2="128" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />

            {/* Fellowship Hoodie / Merch Card */}
            <g transform="translate(195, 65)">
              <rect x="0" y="0" width="75" height="55" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
              <circle cx="37" cy="20" r="10" fill="#FFF7ED" stroke="#FF6719" strokeWidth="1.2" />
              <path d="M 33 20 L 41 20 M 37 16 L 37 24" stroke="#FF6719" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="15" y="36" width="45" height="4" rx="2" fill="#171717" />
              <rect x="22" y="44" width="31" height="3" rx="1.5" fill="#9CA3AF" />
            </g>
          </g>

          {/* Price Tag Pill */}
          <rect x="80" y="145" width="85" height="24" rx="12" fill="#171717" />
          <circle cx="92" cy="157" r="3" fill="#FFFFFF" />
          <text x="102" y="161" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
            0% MARKUP
          </text>

          {/* Delivery Route */}
          <path d="M 270 120 L 270 155 L 200 155" stroke="#FF6719" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="200" cy="155" r="3" fill="#FF6719" />
          <text x="208" y="170" fill="#6B7280" fontSize="9" fontFamily="monospace">
            4 KILO COMPOUND
          </text>
        </svg>
      </div>

      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Campus Bookstore</span>
        <span className="font-mono text-primary font-semibold">STUDENT SUBSIDIZED</span>
      </div>
    </div>
  );
}

export function AdminIsoFigure() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[420px] aspect-4/3 rounded-3xl bg-neutral-50/80 border border-neutral-200/80 p-6 flex flex-col justify-between overflow-hidden shadow-xs hover:border-primary/40 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400">
        <span className="uppercase text-neutral-500 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          ADMIN_PORTAL // GOVERNANCE
        </span>
        <span className="text-neutral-500">RBAC SECURED</span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 360 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto select-none"
        >
          {/* Dashboard Window Frame */}
          <g className={`transition-transform duration-500 ${isHovered ? "scale-102" : "scale-100"}`} style={{ transformOrigin: "180px 110px" }}>
            <rect x="50" y="30" width="260" height="150" rx="14" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
            
            {/* Window Chrome Header */}
            <path d="M 50 44 C 50 36.268 56.268 30 64 30 L 296 30 C 303.732 30 310 36.268 310 44 L 310 52 L 50 52 Z" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
            <circle cx="65" cy="41" r="3.5" fill="#EF4444" />
            <circle cx="77" cy="41" r="3.5" fill="#F59E0B" />
            <circle cx="89" cy="41" r="3.5" fill="#10B981" />
            <rect x="130" y="37" width="100" height="8" rx="4" fill="#E5E7EB" />

            {/* Sidebar */}
            <line x1="110" y1="52" x2="110" y2="180" stroke="#F3F4F6" strokeWidth="1.5" />
            <rect x="62" y="65" width="36" height="5" rx="2.5" fill="#FF6719" />
            <rect x="62" y="78" width="30" height="4" rx="2" fill="#D1D5DB" />
            <rect x="62" y="89" width="34" height="4" rx="2" fill="#D1D5DB" />
            <rect x="62" y="100" width="28" height="4" rx="2" fill="#D1D5DB" />

            {/* Metric KPI cards */}
            <rect x="125" y="65" width="52" height="30" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
            <rect x="131" y="71" width="22" height="3" rx="1.5" fill="#9CA3AF" />
            <text x="131" y="87" fill="#171717" fontSize="10" fontWeight="bold">1,240</text>

            <rect x="185" y="65" width="52" height="30" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
            <rect x="191" y="71" width="22" height="3" rx="1.5" fill="#9CA3AF" />
            <text x="191" y="87" fill="#FF6719" fontSize="10" fontWeight="bold">100%</text>

            <rect x="245" y="65" width="52" height="30" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
            <rect x="251" y="71" width="22" height="3" rx="1.5" fill="#9CA3AF" />
            <text x="251" y="87" fill="#10B981" fontSize="10" fontWeight="bold">ACTIVE</text>

            {/* Chart Area */}
            <path
              d="M 125 145 L 155 125 L 185 135 L 215 110 L 245 120 L 275 100 L 297 105"
              stroke="#FF6719"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Grid baseline */}
            <line x1="125" y1="155" x2="297" y2="155" stroke="#E5E7EB" strokeWidth="1" />
            <line x1="125" y1="130" x2="297" y2="130" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        </svg>
      </div>

      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">Fellowship Back-Office</span>
        <span className="font-mono text-primary font-semibold">100% INTEGRATED</span>
      </div>
    </div>
  );
}
