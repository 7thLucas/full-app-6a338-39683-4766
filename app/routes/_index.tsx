import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppShell } from "~/components/layout/AppShell";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";
import { ShiftService } from "~/features/scheduling/services/shift.service";
import { StaffService } from "~/features/scheduling/services/shift.service";
import { UserRole } from "~/modules/authentication/authentication.types";
import { getMonday, toDateStr, formatDate, formatTime, getRoleColor, getRoleColorLight, getInitials } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const today = toDateStr(new Date());
  const monday = getMonday(new Date());
  const weekStart = toDateStr(monday);

  let shifts: any[] = [];
  let staffCount = 0;

  if (user.role === UserRole.Admin) {
    shifts = await ShiftService.getByWeek(weekStart);
    const staff = await StaffService.getAll();
    staffCount = staff.length;
  } else {
    shifts = await ShiftService.getByStaff(user.id);
  }

  const todayShifts = shifts.filter((s: any) => s.date === today);
  const upcomingShifts = shifts
    .filter((s: any) => s.date >= today)
    .slice(0, 5);

  const pendingCount = shifts.filter((s: any) => s.status === "pending").length;

  return {
    user,
    todayShifts,
    upcomingShifts,
    pendingCount,
    staffCount,
    weekStart,
    today,
  };
}

function ShiftCard({ shift }: { shift: any }) {
  const roleColor = getRoleColor(shift.role);
  const roleBg = getRoleColorLight(shift.role);

  return (
    <div
      className="bg-white rounded-xl p-4 flex items-center gap-3"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
    >
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ background: roleColor, minHeight: "48px" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: roleBg, color: roleColor }}
          >
            {shift.role}
          </span>
          {shift.status === "confirmed" && (
            <span className="text-xs text-[#4CAF7D] font-medium">Confirmed</span>
          )}
          {shift.status === "pending" && (
            <span className="text-xs text-[#F5A623] font-medium">Pending</span>
          )}
          {shift.status === "declined" && (
            <span className="text-xs text-red-500 font-medium">Declined</span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{shift.staffName}</p>
        <p className="text-xs text-[#6B6560] mt-0.5">
          {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="bg-white rounded-xl p-4 flex flex-col gap-1"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
    >
      <span className="text-2xl font-bold" style={{ color: color ?? "#1A1A1A" }}>
        {value}
      </span>
      <span className="text-xs text-[#6B6560] font-medium">{label}</span>
    </div>
  );
}

export default function IndexPage() {
  const { user, todayShifts, upcomingShifts, pendingCount, staffCount, today } =
    useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();

  const isAdmin = user.role === UserRole.Admin;
  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");
  const welcomeMsg = loading
    ? "Good to see you."
    : (config?.welcomeMessage ?? "Good to see you. Here's your schedule.");
  const appName = loading ? "MiCasa" : (config?.appName ?? "MiCasa");

  const todayFormatted = new Date(today + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-10 pb-6" style={{ background: primaryColor }}>
        <p className="text-white/70 text-sm font-medium mb-0.5">{todayFormatted}</p>
        <h1 className="text-2xl font-bold text-white">{welcomeMsg}</h1>
        <p className="text-white/80 text-sm mt-1">
          {user.username}
          {isAdmin && (
            <span className="ml-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              Manager
            </span>
          )}
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Today's shifts"
            value={todayShifts.length}
            color={primaryColor}
          />
          {isAdmin ? (
            <StatCard label="Team members" value={staffCount} />
          ) : (
            <StatCard
              label="Pending confirmation"
              value={pendingCount}
              color={pendingCount > 0 ? "#F5A623" : "#4CAF7D"}
            />
          )}
        </div>

        {/* Today's shifts */}
        {todayShifts.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-3">Today</h2>
            <div className="flex flex-col gap-2">
              {todayShifts.map((shift: any) => (
                <ShiftCard key={shift._id} shift={shift} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingShifts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#1A1A1A]">Upcoming</h2>
              <Link
                to="/schedule"
                className="text-sm font-medium"
                style={{ color: primaryColor }}
              >
                See all
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingShifts.slice(0, 3).map((shift: any) => (
                <div
                  key={shift._id}
                  className="bg-white rounded-xl p-3.5 flex items-center gap-3"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
                >
                  <div
                    className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: getRoleColor(shift.role) }}
                  >
                    {getInitials(shift.staffName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{shift.staffName}</p>
                    <p className="text-xs text-[#6B6560]">
                      {formatDate(shift.date)} · {formatTime(shift.startTime)}–{formatTime(shift.endTime)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: getRoleColorLight(shift.role),
                      color: getRoleColor(shift.role),
                    }}
                  >
                    {shift.role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {todayShifts.length === 0 && upcomingShifts.length === 0 && (
          <div className="text-center py-16">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "#FFF1EE" }}
            >
              📋
            </div>
            <p className="text-[#1A1A1A] font-semibold">No shifts scheduled</p>
            <p className="text-[#6B6560] text-sm mt-1">
              {isAdmin ? "Create a shift to get started." : "Check back later."}
            </p>
            {isAdmin && (
              <Link
                to="/schedule"
                className="mt-4 inline-flex h-11 items-center px-5 rounded-lg text-sm font-semibold text-white"
                style={{ background: primaryColor }}
              >
                Go to Schedule
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
