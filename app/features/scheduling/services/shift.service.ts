import { ShiftModel, ShiftStatus } from "../models/shift.model";
import { StaffProfileModel } from "../models/staff-profile.model";

export interface CreateShiftDto {
  staffId: string;
  staffName: string;
  staffEmail: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateShiftDto {
  role?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export const ShiftService = {
  async getAll() {
    return ShiftModel.find({ deletedAt: null }).sort({ date: 1, startTime: 1 }).lean();
  },

  async getByStaff(staffId: string) {
    return ShiftModel.find({ staffId, deletedAt: null }).sort({ date: 1, startTime: 1 }).lean();
  },

  async getByWeek(weekStart: string) {
    // weekStart is ISO date string "YYYY-MM-DD" (Monday)
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    return ShiftModel.find({
      deletedAt: null,
      date: { $gte: startStr, $lt: endStr },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();
  },

  async create(dto: CreateShiftDto) {
    return ShiftModel.create({
      ...dto,
      status: ShiftStatus.Pending,
      notes: dto.notes ?? "",
    });
  },

  async update(shiftId: string, dto: UpdateShiftDto) {
    return ShiftModel.findByIdAndUpdate(shiftId, dto, { new: true }).lean();
  },

  async updateStatus(shiftId: string, staffId: string, status: ShiftStatus) {
    return ShiftModel.findOneAndUpdate(
      { _id: shiftId, staffId },
      { status },
      { new: true }
    ).lean();
  },

  async delete(shiftId: string) {
    return ShiftModel.findByIdAndUpdate(shiftId, { deletedAt: new Date() }).lean();
  },

  async getById(shiftId: string) {
    return ShiftModel.findById(shiftId).lean();
  },
};

export const StaffService = {
  async getAll() {
    return StaffProfileModel.find({ isActive: true, deletedAt: null })
      .sort({ displayName: 1 })
      .lean();
  },

  async getById(userId: string) {
    return StaffProfileModel.findOne({ userId, deletedAt: null }).lean();
  },

  async upsert(userId: string, data: { displayName: string; email: string; role?: string; phone?: string }) {
    return StaffProfileModel.findOneAndUpdate(
      { userId },
      { userId, ...data, isActive: true },
      { upsert: true, new: true }
    ).lean();
  },

  async update(userId: string, data: Partial<{ displayName: string; role: string; phone: string }>) {
    return StaffProfileModel.findOneAndUpdate({ userId }, data, { new: true }).lean();
  },
};
