import { redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, Form } from "react-router";
import { useState } from "react";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AppShell } from "~/components/layout/AppShell";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";
import { StaffService } from "~/features/scheduling/services/shift.service";
import { ShiftService } from "~/features/scheduling/services/shift.service";
import { UserRole } from "~/modules/authentication/authentication.types";
import { UserModel } from "~/modules/authentication/authentication.model";
import { getRoleColor, getRoleColorLight, getInitials } from "~/lib/utils";
import bcrypt from "bcryptjs";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  if (user.role !== UserRole.Admin) return redirect("/");

  const staff = await StaffService.getAll();

  // Enrich with shift counts
  const allShifts = await ShiftService.getAll();
  const staffWithShifts = staff.map((s: any) => {
    const myShifts = allShifts.filter((shift: any) => shift.staffId === s.userId);
    const pendingCount = myShifts.filter((shift: any) => shift.status === "pending").length;
    return { ...s, shiftCount: myShifts.length, pendingCount };
  });

  return { user, staff: staffWithShifts };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== UserRole.Admin) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "create-staff") {
    const displayName = String(formData.get("displayName") ?? "");
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const role = String(formData.get("role") ?? "Staff");
    const phone = String(formData.get("phone") ?? "");
    const password = String(formData.get("password") ?? "Staff2026!");

    try {
      // Create user account
      let existingUser = await UserModel.findOne({ email });
      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
        const hash = await bcrypt.hash(password, 12);
        const newUser = await UserModel.create({
          username,
          email,
          password_hash: hash,
          role: UserRole.Authenticated,
          is_active: true,
        });
        userId = newUser.id;
      }

      await StaffService.upsert(userId, { displayName, email, role, phone });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message ?? "Failed to create staff member" };
    }
  }

  if (intent === "update-role") {
    const userId = String(formData.get("userId") ?? "");
    const role = String(formData.get("role") ?? "Staff");
    await StaffService.update(userId, { role });
    return { ok: true };
  }

  return { ok: false, error: "Unknown intent" };
}

function StaffCard({ member }: { member: any }) {
  const [showEdit, setShowEdit] = useState(false);
  const fetcher = useFetcher();
  const roleColor = getRoleColor(member.role);
  const roleBg = getRoleColorLight(member.role);

  const staffRoles = ["Manager", "Chef", "Waiter", "Bar", "Host", "Kitchen", "Staff"];

  return (
    <div
      className="bg-white rounded-xl p-4"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: roleColor }}
        >
          {getInitials(member.displayName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] truncate">{member.displayName}</p>
          <p className="text-xs text-[#6B6560] truncate">{member.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: roleBg, color: roleColor }}
            >
              {member.role}
            </span>
            {member.pendingCount > 0 && (
              <span className="text-xs text-[#F5A623] font-medium">
                {member.pendingCount} pending
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowEdit(!showEdit)}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z" fill="#6B6560" />
          </svg>
        </button>
      </div>

      {showEdit && (
        <div className="mt-3 pt-3 border-t border-[#E8E2DA]">
          <p className="text-xs font-medium text-[#6B6560] mb-2">Change role</p>
          <fetcher.Form method="post" className="flex gap-2">
            <input type="hidden" name="intent" value="update-role" />
            <input type="hidden" name="userId" value={member.userId} />
            <select
              name="role"
              defaultValue={member.role}
              className="flex-1 h-9 rounded-lg border border-[#E8E2DA] bg-white px-2 text-xs text-[#1A1A1A] focus:outline-none"
            >
              {staffRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-[#C1440E] text-white text-xs font-semibold"
            >
              Save
            </button>
          </fetcher.Form>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#6B6560]">
            <span>{member.shiftCount} total shifts</span>
            {member.phone && <span>📞 {member.phone}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function AddStaffModal({ onClose, primaryColor }: { onClose: () => void; primaryColor: string }) {
  const fetcher = useFetcher();
  const staffRoles = ["Manager", "Chef", "Waiter", "Bar", "Host", "Kitchen", "Staff"];
  const isSubmitting = fetcher.state === "submitting";

  if (fetcher.state === "idle" && (fetcher.data as any)?.ok) {
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
          <h3 className="text-lg font-bold text-[#1A1A1A]">Add Team Member</h3>
          <button onClick={onClose} className="text-[#6B6560] p-1 rounded-lg hover:bg-[#F5F0E8]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#6B6560" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <fetcher.Form method="post" className="flex flex-col gap-3">
          <input type="hidden" name="intent" value="create-staff" />

          {(fetcher.data as any)?.error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {(fetcher.data as any).error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Full name</label>
            <input
              name="displayName"
              type="text"
              placeholder="Sofia Reyes"
              required
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="sofia@micasa.app"
              required
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Role</label>
            <select
              name="role"
              required
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            >
              {staffRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">Phone (optional)</label>
            <input
              name="phone"
              type="tel"
              placeholder="+44 7700 900000"
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6560] mb-1">
              Initial password
            </label>
            <input
              name="password"
              type="text"
              defaultValue="Staff2026!"
              className="w-full h-11 rounded-lg border border-[#E8E2DA] bg-white px-3 text-sm text-[#1A1A1A] focus:outline-none"
            />
            <p className="text-xs text-[#6B6560] mt-1">Share this with the staff member.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full rounded-lg text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {isSubmitting ? "Adding..." : "Add to Team"}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user, staff } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const [showAddModal, setShowAddModal] = useState(false);

  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");

  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-10 pb-5" style={{ background: primaryColor }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Team</h1>
            <p className="text-white/70 text-sm mt-0.5">{staff.length} member{staff.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3 pb-6">
        {staff.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#FFF1EE" }}>
              👥
            </div>
            <p className="text-[#1A1A1A] font-semibold">No team members yet</p>
            <p className="text-[#6B6560] text-sm mt-1">Add your first team member to get started.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 h-11 px-5 rounded-lg text-white text-sm font-semibold"
              style={{ background: primaryColor }}
            >
              Add team member
            </button>
          </div>
        ) : (
          staff.map((member: any) => (
            <StaffCard key={member.userId} member={member} />
          ))
        )}
      </div>

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
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
