import bcrypt from "bcryptjs";
import { createLogger } from "~/lib/logger";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { StaffProfileModel } from "../models/staff-profile.model";
import { ShiftModel, ShiftStatus } from "../models/shift.model";

const logger = createLogger("StaffSeed");

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export async function seedStaffData(): Promise<void> {
  try {
    const existing = await StaffProfileModel.findOne({});
    if (existing) {
      logger.info("Staff data already seeded, skipping.");
      return;
    }

    // Create sample staff users
    const staffMembers = [
      { username: "sofia.reyes", email: "sofia@micasa.app", displayName: "Sofia Reyes", role: "Chef", password: "Staff2026!" },
      { username: "marco.diaz", email: "marco@micasa.app", displayName: "Marco Diaz", role: "Waiter", password: "Staff2026!" },
      { username: "lena.park", email: "lena@micasa.app", displayName: "Lena Park", role: "Bar", password: "Staff2026!" },
      { username: "james.obi", email: "james@micasa.app", displayName: "James Obi", role: "Host", password: "Staff2026!" },
      { username: "ana.ferreira", email: "ana@micasa.app", displayName: "Ana Ferreira", role: "Kitchen", password: "Staff2026!" },
    ];

    const createdUsers: { userId: string; displayName: string; email: string; role: string }[] = [];

    for (const member of staffMembers) {
      const existing = await UserModel.findOne({ email: member.email });
      let userId: string;
      if (existing) {
        userId = existing.id;
      } else {
        const hash = await bcrypt.hash(member.password, 12);
        const user = await UserModel.create({
          username: member.username,
          email: member.email,
          password_hash: hash,
          role: UserRole.Authenticated,
          is_active: true,
        });
        userId = user.id;
      }

      await StaffProfileModel.findOneAndUpdate(
        { userId },
        { userId, displayName: member.displayName, email: member.email, role: member.role, isActive: true },
        { upsert: true, new: true }
      );

      createdUsers.push({ userId, displayName: member.displayName, email: member.email, role: member.role });
    }

    // Find admin user for createdBy
    const adminUser = await UserModel.findOne({ role: UserRole.Admin });
    const adminId = adminUser?.id ?? "system";

    // Seed sample shifts for current week
    const monday = getMonday(new Date());
    const shiftTemplates = [
      { dayOffset: 0, start: "09:00", end: "17:00" },
      { dayOffset: 0, start: "17:00", end: "23:00" },
      { dayOffset: 1, start: "09:00", end: "17:00" },
      { dayOffset: 1, start: "12:00", end: "20:00" },
      { dayOffset: 2, start: "09:00", end: "17:00" },
      { dayOffset: 2, start: "17:00", end: "23:00" },
      { dayOffset: 3, start: "09:00", end: "17:00" },
      { dayOffset: 4, start: "12:00", end: "20:00" },
      { dayOffset: 4, start: "17:00", end: "23:00" },
    ];

    const statusOptions = [ShiftStatus.Confirmed, ShiftStatus.Pending, ShiftStatus.Pending];

    let staffIdx = 0;
    for (const template of shiftTemplates) {
      const staffMember = createdUsers[staffIdx % createdUsers.length];
      staffIdx++;

      const shiftDate = new Date(monday);
      shiftDate.setDate(monday.getDate() + template.dayOffset);

      const status = statusOptions[staffIdx % statusOptions.length];

      await ShiftModel.create({
        staffId: staffMember.userId,
        staffName: staffMember.displayName,
        staffEmail: staffMember.email,
        role: staffMember.role,
        date: toDateStr(shiftDate),
        startTime: template.start,
        endTime: template.end,
        status,
        notes: "",
        createdBy: adminId,
      });
    }

    logger.info("✅ Sample staff and shifts seeded successfully.");
  } catch (error) {
    logger.error("❌ Failed to seed staff data:", error);
  }
}
