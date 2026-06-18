import { redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, Form, useFetcher } from "react-router";
import { useState } from "react";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppShell } from "~/components/layout/AppShell";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";
import { StaffService } from "~/features/scheduling/services/shift.service";
import { ShiftService } from "~/features/scheduling/services/shift.service";
import { UserRole } from "~/modules/authentication/authentication.types";
import { getRoleColor, getRoleColorLight, getInitials, formatDate, formatTime } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  let profile = await StaffService.getById(user.id);

  // If no profile, create one on the fly
  if (!profile) {
    profile = await StaffService.upsert(user.id, {
      displayName: user.username,
      email: user.email,
      role: user.role === UserRole.Admin ? "Manager" : "Staff",
    });
  }

  const myShifts = await ShiftService.getByStaff(user.id);
  const today = new Date().toISOString().split("T")[0];
  const upcomingShifts = myShifts
    .filter((s: any) => s.date >= today)
    .slice(0, 5);

  const confirmedCount = myShifts.filter((s: any) => s.status === "confirmed").length;
  const pendingCount = myShifts.filter((s: any) => s.status === "pending").length;

  return { user, profile, upcomingShifts, confirmedCount, pendingCount, totalShifts: myShifts.length };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "update-profile") {
    const displayName = String(formData.get("displayName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    if (displayName) {
      await StaffService.upsert(user.id, {
        displayName,
        email: user.email,
        phone,
      });
    }
    return { ok: true };
  }

  return { ok: false };
}

export default function ProfilePage() {
  const { user, profile, upcomingShifts, confirmedCount, pendingCount, totalShifts } =
    useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const [editMode, setEditMode] = useState(false);
  const fetcher = useFetcher();

  const isAdmin = user.role === UserRole.Admin;
  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");
  const roleColor = getRoleColor(profile?.role ?? "Staff");
  const roleBg = getRoleColorLight(profile?.role ?? "Staff");
  const displayName = profile?.displayName ?? user.username;

  const saveSuccess = fetcher.state === "idle" && (fetcher.data as any)?.ok;
  if (saveSuccess && editMode) {
    setEditMode(false);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-10 pb-6" style={{ background: primaryColor }}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            {getInitials(displayName)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            <p className="text-white/70 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                {profile?.role ?? (isAdmin ? "Manager" : "Staff")}
              </span>
              {isAdmin && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5A623] text-white">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <p className="text-2xl font-bold text-[#1A1A1A]">{totalShifts}</p>
            <p className="text-xs text-[#6B6560] font-medium">Total</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <p className="text-2xl font-bold text-[#4CAF7D]">{confirmedCount}</p>
            <p className="text-xs text-[#6B6560] font-medium">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <p className="text-2xl font-bold text-[#F5A623]">{pendingCount}</p>
            <p className="text-xs text-[#6B6560] font-medium">Pending</p>
          </div>
        </div>

        {/* Edit profile */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1A1A1A]">Profile</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm font-medium"
              style={{ color: primaryColor }}
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <fetcher.Form method="post" className="flex flex-col gap-3">
              <input type="hidden" name="intent" value="update-profile" />
              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Display name</label>
                <input
                  name="displayName"
                  type="text"
                  defaultValue={displayName}
                  className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+44 7700 900000"
                  className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-11 w-full rounded-lg text-white font-semibold text-sm"
                style={{ background: primaryColor }}
              >
                Save changes
              </button>
            </fetcher.Form>
          ) : (
            <div
              className="bg-white rounded-xl p-4 flex flex-col gap-3"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
            >
              <div className="flex justify-between">
                <span className="text-xs text-[#6B6560]">Name</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{displayName}</span>
              </div>
              <div className="border-t border-[#E8E2DA]" />
              <div className="flex justify-between">
                <span className="text-xs text-[#6B6560]">Email</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{user.email}</span>
              </div>
              <div className="border-t border-[#E8E2DA]" />
              <div className="flex justify-between">
                <span className="text-xs text-[#6B6560]">Role</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: roleBg, color: roleColor }}
                >
                  {profile?.role ?? "Staff"}
                </span>
              </div>
              {profile?.phone && (
                <>
                  <div className="border-t border-[#E8E2DA]" />
                  <div className="flex justify-between">
                    <span className="text-xs text-[#6B6560]">Phone</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">{profile.phone}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Upcoming shifts */}
        {upcomingShifts.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-3">Your upcoming shifts</h2>
            <div className="flex flex-col gap-2">
              {upcomingShifts.map((shift: any) => (
                <div
                  key={shift._id}
                  className="bg-white rounded-xl p-3.5 flex items-center gap-3"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="flex-shrink-0 w-1 self-stretch rounded-full"
                    style={{ background: getRoleColor(shift.role), minHeight: "40px" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{formatDate(shift.date)}</p>
                    <p className="text-xs text-[#6B6560]">
                      {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium flex items-center gap-1 flex-shrink-0"
                    style={{
                      color:
                        shift.status === "confirmed" ? "#4CAF7D" :
                        shift.status === "declined" ? "#E53935" : "#F5A623",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          shift.status === "confirmed" ? "#4CAF7D" :
                          shift.status === "declined" ? "#E53935" : "#F5A623",
                      }}
                    />
                    {shift.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sign out */}
        <Form method="post" action="/auth/logout">
          <button
            type="submit"
            className="w-full h-11 rounded-lg border border-[#E8E2DA] text-[#E53935] font-medium text-sm bg-white hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </Form>
      </div>
    </AppShell>
  );
}
