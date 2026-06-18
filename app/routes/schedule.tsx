import { redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, useSearchParams, Link } from "react-router";
import { useState } from "react";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppShell } from "~/components/layout/AppShell";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";
import { ShiftService } from "~/features/scheduling/services/shift.service";
import { StaffService } from "~/features/scheduling/services/shift.service";
import { ShiftStatus } from "~/features/scheduling/models/shift.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import {
  getMonday, toDateStr, formatDate, formatTime,
  getRoleColor, getRoleColorLight, getInitials, getWeekDays,
} from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const url = new URL(request.url);
  const weekParam = url.searchParams.get("week");
  const today = new Date();

  let weekStart: Date;
  if (weekParam) {
    weekStart = new Date(weekParam + "T00:00:00");
  } else {
    weekStart = getMonday(today);
  }

  const weekStartStr = toDateStr(weekStart);
  let shifts: any[] = [];

  if (user.role === UserRole.Admin) {
    shifts = await ShiftService.getByWeek(weekStartStr);
  } else {
    const allMyShifts = await ShiftService.getByStaff(user.id);
    // Filter to the selected week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = toDateStr(weekEnd);
    shifts = allMyShifts.filter((s: any) => s.date >= weekStartStr && s.date < weekEndStr);
  }

  const staff = user.role === UserRole.Admin ? await StaffService.getAll() : [];
  const weekDays = getWeekDays(weekStart);

  // Previous and next week
  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    user,
    shifts,
    staff,
    weekStartStr,
    weekDays: weekDays.map(d => toDateStr(d)),
    prevWeek: toDateStr(prevWeek),
    nextWeek: toDateStr(nextWeek),
    today: toDateStr(today),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "confirm") {
    const shiftId = String(formData.get("shiftId") ?? "");
    await ShiftService.updateStatus(shiftId, user.id, ShiftStatus.Confirmed);
    return { ok: true };
  }

  if (intent === "decline") {
    const shiftId = String(formData.get("shiftId") ?? "");
    await ShiftService.updateStatus(shiftId, user.id, ShiftStatus.Declined);
    return { ok: true };
  }

  if (intent === "create" && user.role === UserRole.Admin) {
    await ShiftService.create({
      staffId: String(formData.get("staffId") ?? ""),
      staffName: String(formData.get("staffName") ?? ""),
      staffEmail: String(formData.get("staffEmail") ?? ""),
      role: String(formData.get("role") ?? "Staff"),
      date: String(formData.get("date") ?? ""),
      startTime: String(formData.get("startTime") ?? "09:00"),
      endTime: String(formData.get("endTime") ?? "17:00"),
      notes: String(formData.get("notes") ?? ""),
      createdBy: user.id,
    });
    return { ok: true };
  }

  if (intent === "delete" && user.role === UserRole.Admin) {
    const shiftId = String(formData.get("shiftId") ?? "");
    await ShiftService.delete(shiftId);
    return { ok: true };
  }

  return { ok: false, error: "Unknown action" };
}

function DayColumn({ date, shifts, isToday, isAdmin, staffList, onAddShift }: {
  date: string;
  shifts: any[];
  isToday: boolean;
  isAdmin: boolean;
  staffList: any[];
  onAddShift: (date: string) => void;
}) {
  const fetcher = useFetcher();
  const d = new Date(date + "T00:00:00");
  const dayName = d.toLocaleDateString("en-GB", { weekday: "short" });
  const dayNum = d.getDate();

  return (
    <div className="flex-shrink-0 w-[140px]">
      {/* Day header */}
      <div
        className="mb-2 text-center rounded-xl py-2"
        style={{
          background: isToday ? "#C1440E" : "transparent",
        }}
      >
        <p className="text-xs font-medium" style={{ color: isToday ? "rgba(255,255,255,0.8)" : "#6B6560" }}>
          {dayName}
        </p>
        <p className="text-lg font-bold" style={{ color: isToday ? "#fff" : "#1A1A1A" }}>
          {dayNum}
        </p>
      </div>

      {/* Shifts for this day */}
      <div className="flex flex-col gap-2">
        {shifts.map((shift) => (
          <ShiftPill key={shift._id} shift={shift} isAdmin={isAdmin} />
        ))}

        {isAdmin && (
          <button
            onClick={() => onAddShift(date)}
            className="w-full h-9 rounded-lg border-2 border-dashed border-[#E8E2DA] flex items-center justify-center text-[#6B6560] text-xs hover:border-[#C1440E] hover:text-[#C1440E] transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

function ShiftPill({ shift, isAdmin }: { shift: any; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const fetcher = useFetcher();
  const roleColor = getRoleColor(shift.role);
  const roleBg = getRoleColorLight(shift.role);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left rounded-xl p-2.5 transition-all"
        style={{ background: roleBg, border: `1.5px solid ${roleColor}20` }}
      >
        <div
          className="text-[10px] font-bold mb-1 truncate"
          style={{ color: roleColor }}
        >
          {shift.role}
        </div>
        <div className="text-xs font-semibold text-[#1A1A1A] truncate leading-tight">
          {shift.staffName}
        </div>
        <div className="text-[10px] text-[#6B6560] mt-0.5">
          {formatTime(shift.startTime)}
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background:
                shift.status === "confirmed" ? "#4CAF7D" :
                shift.status === "declined" ? "#E53935" : "#F5A623",
            }}
          />
          <span className="text-[10px] text-[#6B6560] capitalize">{shift.status}</span>
        </div>
      </button>

      {expanded && (
        <div
          className="mt-1 rounded-xl p-3 bg-white"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
        >
          <p className="text-xs font-semibold text-[#1A1A1A]">{shift.staffName}</p>
          <p className="text-xs text-[#6B6560] mt-0.5">
            {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
          </p>
          {shift.notes && (
            <p className="text-xs text-[#6B6560] mt-1 italic">{shift.notes}</p>
          )}
          {isAdmin && (
            <fetcher.Form method="post" className="mt-2">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="shiftId" value={shift._id} />
              <button
                type="submit"
                className="text-xs text-red-500 font-medium hover:underline"
              >
                Remove shift
              </button>
            </fetcher.Form>
          )}
        </div>
      )}
    </div>
  );
}

function AddShiftModal({ date, staffList, onClose, primaryColor }: {
  date: string;
  staffList: any[];
  onClose: () => void;
  primaryColor: string;
}) {
  const fetcher = useFetcher();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const staffRoles = ["Manager", "Chef", "Waiter", "Bar", "Host", "Kitchen"];

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = staffList.find((s: any) => s.userId === e.target.value);
    setSelectedStaff(found ?? null);
  };

  const isSubmitting = fetcher.state === "submitting";

  // Close on success
  if (fetcher.state === "idle" && fetcher.data?.ok) {
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-2xl p-5 pb-8"
        style={{ boxShadow: "0 -4px 32px rgba(0,0,0,0.14)", animation: "slideUp 300ms ease-out" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Add Shift</h3>
          <button onClick={onClose} className="text-[#6B6560] p-1 rounded-lg hover:bg-[#F5F0E8]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <fetcher.Form method="post" className="flex flex-col gap-3">
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="staffName" value={selectedStaff?.displayName ?? ""} />
          <input type="hidden" name="staffEmail" value={selectedStaff?.email ?? ""} />

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Date</label>
            <p className="text-sm font-semibold text-[#1A1A1A]">{formatDate(date)}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Staff member</label>
            {staffList.length === 0 ? (
              <p className="text-sm text-[#6B6560]">No staff added yet. Add team members first.</p>
            ) : (
              <select
                name="staffId"
                required
                onChange={handleStaffChange}
                className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
              >
                <option value="">Select staff</option>
                {staffList.map((s: any) => (
                  <option key={s.userId} value={s.userId}>
                    {s.displayName} — {s.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Role</label>
            <select
              name="role"
              required
              defaultValue={selectedStaff?.role ?? ""}
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            >
              <option value="">Select role</option>
              {staffRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1">Start</label>
              <input
                name="startTime"
                type="time"
                defaultValue="09:00"
                required
                className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B6560] mb-1">End</label>
              <input
                name="endTime"
                type="time"
                defaultValue="17:00"
                required
                className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Notes (optional)</label>
            <input
              name="notes"
              type="text"
              placeholder="Any special instructions..."
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || staffList.length === 0}
            className="mt-2 h-12 w-full rounded-lg text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {isSubmitting ? "Adding..." : "Add Shift"}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

function StaffShiftCard({ shift, isStaff }: { shift: any; isStaff: boolean }) {
  const fetcher = useFetcher();
  const roleColor = getRoleColor(shift.role);
  const roleBg = getRoleColorLight(shift.role);

  return (
    <div
      className="bg-white rounded-xl p-4"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: roleBg, color: roleColor }}
            >
              {shift.role}
            </span>
            <span
              className="text-xs font-medium flex items-center gap-1"
              style={{
                color:
                  shift.status === "confirmed" ? "#4CAF7D" :
                  shift.status === "declined" ? "#E53935" : "#F5A623",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  background:
                    shift.status === "confirmed" ? "#4CAF7D" :
                    shift.status === "declined" ? "#E53935" : "#F5A623",
                }}
              />
              {shift.status === "confirmed" ? "Confirmed" : shift.status === "declined" ? "Declined" : "Pending"}
            </span>
          </div>
          <p className="text-base font-bold text-[#1A1A1A]">{formatDate(shift.date)}</p>
          <p className="text-sm text-[#6B6560] mt-0.5">
            {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
          </p>
          {shift.notes && (
            <p className="text-xs text-[#6B6560] mt-1 italic">{shift.notes}</p>
          )}
        </div>
      </div>

      {isStaff && shift.status === "pending" && (
        <div className="flex gap-2 mt-3">
          <fetcher.Form method="post" className="flex-1">
            <input type="hidden" name="intent" value="confirm" />
            <input type="hidden" name="shiftId" value={shift._id} />
            <button
              type="submit"
              className="w-full h-9 rounded-lg bg-[#4CAF7D] text-white text-sm font-semibold"
            >
              Confirm
            </button>
          </fetcher.Form>
          <fetcher.Form method="post" className="flex-1">
            <input type="hidden" name="intent" value="decline" />
            <input type="hidden" name="shiftId" value={shift._id} />
            <button
              type="submit"
              className="w-full h-9 rounded-lg bg-[#FEE2E2] text-[#E53935] text-sm font-semibold"
            >
              Decline
            </button>
          </fetcher.Form>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const { user, shifts, staff, weekStartStr, weekDays, prevWeek, nextWeek, today } =
    useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const [searchParams] = useSearchParams();
  const [addShiftDate, setAddShiftDate] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "list">("week");

  const isAdmin = user.role === UserRole.Admin;
  const isStaff = !isAdmin;
  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");

  const weekStart = new Date(weekStartStr + "T00:00:00");
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-10 pb-4" style={{ background: primaryColor }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Schedule</h1>
          <div className="flex gap-1 bg-white/20 rounded-lg p-0.5">
            <button
              onClick={() => setView("week")}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
              style={{
                background: view === "week" ? "white" : "transparent",
                color: view === "week" ? primaryColor : "rgba(255,255,255,0.8)",
              }}
            >
              Week
            </button>
            <button
              onClick={() => setView("list")}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
              style={{
                background: view === "list" ? "white" : "transparent",
                color: view === "list" ? primaryColor : "rgba(255,255,255,0.8)",
              }}
            >
              List
            </button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={`/schedule?week=${prevWeek}`}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-sm font-semibold text-white">{weekLabel}</p>
          <Link
            to={`/schedule?week=${nextWeek}`}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4">
        {view === "week" ? (
          /* ── Week View ── */
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-3" style={{ minWidth: `${weekDays.length * 148}px` }}>
              {weekDays.map((date) => {
                const dayShifts = shifts.filter((s: any) => s.date === date);
                return (
                  <DayColumn
                    key={date}
                    date={date}
                    shifts={dayShifts}
                    isToday={date === today}
                    isAdmin={isAdmin}
                    staffList={staff}
                    onAddShift={setAddShiftDate}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* ── List View ── */
          <div className="flex flex-col gap-3 pb-4">
            {shifts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#FFF1EE" }}>
                  📋
                </div>
                <p className="text-[#1A1A1A] font-semibold">No shifts this week</p>
                {isAdmin && (
                  <p className="text-[#6B6560] text-sm mt-1">Switch to Week view to add shifts.</p>
                )}
              </div>
            ) : (
              shifts.map((shift: any) => (
                <StaffShiftCard key={shift._id} shift={shift} isStaff={isStaff} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Add shift modal */}
      {addShiftDate && (
        <AddShiftModal
          date={addShiftDate}
          staffList={staff}
          onClose={() => setAddShiftDate(null)}
          primaryColor={primaryColor}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </AppShell>
  );
}
