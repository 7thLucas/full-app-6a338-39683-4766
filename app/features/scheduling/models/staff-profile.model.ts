import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * StaffProfile extends the base user with restaurant-specific fields.
 * Links to tbl_users via userId.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_staff_profiles",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
export class StaffProfile extends CommonTypegooseEntity {
  @prop({ type: String, required: true, unique: true })
  userId!: string;

  @prop({ type: String, required: true })
  displayName!: string;

  @prop({ type: String, required: true })
  email!: string;

  @prop({ type: String, required: true, default: "Staff" })
  role!: string;

  @prop({ type: String, required: false, default: "" })
  phone!: string;

  @prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const StaffProfileModel = getModelForClass(StaffProfile);
