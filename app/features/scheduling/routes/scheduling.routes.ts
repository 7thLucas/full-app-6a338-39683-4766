import { Router, type Request, type Response } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { ShiftService, StaffService } from "../services/shift.service";
import { ShiftModel, ShiftStatus } from "../models/shift.model";
import type { PublicUser } from "~/modules/authentication/authentication.types";
import { UserRole } from "~/modules/authentication/authentication.types";

const router = Router();

function queryStr(val: string | string[] | undefined): string | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

/** GET /api/shifts — all shifts (authenticated) */
router.get("/api/shifts", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const week = queryStr(req.query.week as string | string[] | undefined);
    let shifts;

    if (user.role === UserRole.Admin) {
      shifts = week ? await ShiftService.getByWeek(week) : await ShiftService.getAll();
    } else {
      shifts = await ShiftService.getByStaff(user.id);
    }

    res.json({ success: true, data: shifts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/shifts/my — staff member's own shifts */
router.get("/api/shifts/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const shifts = await ShiftService.getByStaff(user.id);
    res.json({ success: true, data: shifts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/shifts/:id */
router.get("/api/shifts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const shift = await ShiftService.getById(id);
    if (!shift) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: shift });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /api/shifts — create shift (admin only) */
router.post("/api/shifts", requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const shift = await ShiftService.create({ ...req.body, createdBy: user.id });
    res.status(201).json({ success: true, data: shift });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/** PUT /api/shifts/:id — update shift details (admin only) */
router.put("/api/shifts/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const shift = await ShiftService.update(id, req.body);
    if (!shift) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: shift });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/** PATCH /api/shifts/:id/status — staff confirms or declines their shift */
router.patch("/api/shifts/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const { status } = req.body;

    if (!Object.values(ShiftStatus).includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const id = req.params.id as string;
    let shift;
    if (user.role === UserRole.Admin) {
      shift = await ShiftModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    } else {
      shift = await ShiftService.updateStatus(id, user.id, status);
    }

    if (!shift) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: shift });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/** DELETE /api/shifts/:id — soft delete (admin only) */
router.delete("/api/shifts/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await ShiftService.delete(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── Staff ────────────────────────────────────────────────────────────────────

/** GET /api/staff — all staff profiles (authenticated) */
router.get("/api/staff", requireAuth, async (_req: Request, res: Response) => {
  try {
    const staff = await StaffService.getAll();
    res.json({ success: true, data: staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/staff/me — current user's profile */
router.get("/api/staff/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const profile = await StaffService.getById(user.id);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** PUT /api/staff/me — update own profile */
router.put("/api/staff/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as PublicUser;
    const { displayName, phone, role } = req.body;
    const profile = await StaffService.upsert(user.id, {
      displayName: displayName ?? user.username,
      email: user.email,
      role: role ?? "Staff",
      phone,
    });
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/** POST /api/staff — create/upsert a staff profile (admin only) */
router.post("/api/staff", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, displayName, email, role, phone } = req.body;
    const profile = await StaffService.upsert(userId, { displayName, email, role, phone });
    res.status(201).json({ success: true, data: profile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
