import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    chef: "#1E40AF",
    Chef: "#1E40AF",
    waiter: "#166534",
    Waiter: "#166534",
    bar: "#92400E",
    Bar: "#92400E",
    host: "#6B21A8",
    Host: "#6B21A8",
    kitchen: "#0F766E",
    Kitchen: "#0F766E",
    manager: "#C1440E",
    Manager: "#C1440E",
  };
  return roleColors[role] ?? "#6B6560";
}

export function getRoleColorLight(role: string): string {
  const roleColors: Record<string, string> = {
    chef: "#DBEAFE",
    Chef: "#DBEAFE",
    waiter: "#DCFCE7",
    Waiter: "#DCFCE7",
    bar: "#FEF3C7",
    Bar: "#FEF3C7",
    host: "#F3E8FF",
    Host: "#F3E8FF",
    kitchen: "#CCFBF1",
    Kitchen: "#CCFBF1",
    manager: "#FFF1EE",
    Manager: "#FFF1EE",
  };
  return roleColors[role] ?? "#F5F0E8";
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}
