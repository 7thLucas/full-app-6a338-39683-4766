import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum ShiftStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Declined = "declined",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_shifts",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
export class Shift extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  staffId!: string;

  @prop({ type: String, required: true })
  staffName!: string;

  @prop({ type: String, required: true })
  staffEmail!: string;

  @prop({ type: String, required: true })
  role!: string;

  /** ISO date string for the shift day: "2026-06-18" */
  @prop({ type: String, required: true })
  date!: string;

  /** "09:00" */
  @prop({ type: String, required: true })
  startTime!: string;

  /** "17:00" */
  @prop({ type: String, required: true })
  endTime!: string;

  @prop({ type: String, enum: ShiftStatus, default: ShiftStatus.Pending })
  status!: ShiftStatus;

  @prop({ type: String, required: false, default: "" })
  notes!: string;

  /** ID of manager who created the shift */
  @prop({ type: String, required: true })
  createdBy!: string;
}

export const ShiftModel = getModelForClass(Shift);
