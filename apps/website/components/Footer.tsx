import Link from "next/link";
import {
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa6";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-8 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Left Column: Brand and Social */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                My Fellow
              </span>
            </Link>

            <div className="flex items-center space-x-4 text-gray-400">
              <Link href="#" className="hover:text-gray-600 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-gray-600 transition-colors">
                <FaXTwitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-gray-600 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-gray-600 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-gray-600 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </Link>
            </div>

            <div className="pt-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 transition-colors bg-gray-50/50">
                <Globe className="w-4 h-4" />
                <span className="font-medium">English (US)</span>
              </button>
            </div>

            <div className="mt-auto pt-4 text-gray-500 space-y-3">
              <button className="hover:underline transition-all">
                Cookie settings
              </button>
              <p>© {new Date().getFullYear()} 4kILO ECSF, Inc.</p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1: Company */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold text-gray-900 mb-2">Fellowship</h3>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About ECSF
              </Link>
              <Link
                href="/teams"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ministry Teams
              </Link>
              <Link
                href="/security"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Security
              </Link>
              <Link
                href="/status"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Status
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms & privacy
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Your privacy rights
              </Link>
            </div>

            {/* Column 2: Download */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                iOS & Android
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Mac & Windows
              </Link>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
              <Link
                href="/support"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Help center
              </Link>
              <Link
                href="/devotions"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Daily Devotionals
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Community
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Integrations
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Documentation
              </Link>
            </div>

            {/* Column 4: App Features */}
            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold text-gray-900 mb-2">
                My Fellow for
              </h3>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Events & RSVPs
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Digital Giving (Chapa)
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Team Leaders
              </Link>
              <div className="pt-4">
                <Link
                  href="#"
                  className="font-medium text-gray-900 hover:underline flex items-center group transition-all"
                >
                  Explore more
                  <span className="ml-1 translate-x-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
