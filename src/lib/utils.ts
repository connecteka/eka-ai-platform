import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800",
    "In-Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-emerald-100 text-emerald-800",
    Cancelled: "bg-red-100 text-red-800",
    "On-Hold": "bg-gray-100 text-gray-700",
    Draft: "bg-gray-100 text-gray-700",
    Finalized: "bg-blue-100 text-blue-800",
    Paid: "bg-emerald-100 text-emerald-800",
    Active: "bg-emerald-100 text-emerald-800",
    Expired: "bg-red-100 text-red-800",
  }
  return colors[status] || "bg-gray-100 text-gray-700"
}
