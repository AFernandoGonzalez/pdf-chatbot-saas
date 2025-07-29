"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full p-4 bg-white shadow flex justify-between">
      <Link href="/" className="text-xl font-bold">
        PDF Chat
      </Link>
      <Link href="/upload" className="text-blue-600">
        Upload PDF
      </Link>
    </nav>
  );
}