import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateRandomId() {
  return Math.random().toString(36).substring(2, 15)
}

export const CATEGORIES = [
  { id: "web", name: "Web Exploitation" },
  { id: "crypto", name: "Cryptography" },
  { id: "forensics", name: "Digital Forensics" },
  { id: "reverse", name: "Reverse Engineering" },
  { id: "pwn", name: "Binary Exploitation" },
  { id: "misc", name: "Miscellaneous" },
  { id: "OSINT", name: "OSINT" },
  { id: "binary", name: "Binary Exploitation" },
]
