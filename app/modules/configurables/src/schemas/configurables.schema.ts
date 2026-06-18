/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
      minLength: 1,
      maxLength: 100,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        { fieldName: "primary", type: "color", required: true, label: "Primary" },
        { fieldName: "secondary", type: "color", required: true, label: "Secondary" },
        { fieldName: "accent", type: "color", required: true, label: "Accent" },
      ],
    },
    {
      fieldName: "restaurantName",
      type: "string",
      required: true,
      label: "Restaurant Name",
      minLength: 1,
      maxLength: 100,
    },
    {
      fieldName: "restaurantTagline",
      type: "string",
      required: false,
      label: "Restaurant Tagline",
      maxLength: 200,
    },
    {
      fieldName: "welcomeMessage",
      type: "string",
      required: false,
      label: "Welcome Message",
      maxLength: 300,
    },
    {
      fieldName: "defaultShiftStartTime",
      type: "string",
      required: false,
      label: "Default Shift Start Time (HH:MM)",
      maxLength: 5,
    },
    {
      fieldName: "defaultShiftEndTime",
      type: "string",
      required: false,
      label: "Default Shift End Time (HH:MM)",
      maxLength: 5,
    },
    {
      fieldName: "staffRoles",
      type: "array",
      required: false,
      label: "Staff Roles",
      item: { type: "string", required: true },
    },
    {
      fieldName: "enableShiftConfirmation",
      type: "boolean",
      required: false,
      label: "Enable Shift Confirmation by Staff",
    },
    {
      fieldName: "showReservationsTab",
      type: "boolean",
      required: false,
      label: "Show Reservations Tab",
    },
    {
      fieldName: "showInventoryTab",
      type: "boolean",
      required: false,
      label: "Show Inventory Tab",
    },
    {
      fieldName: "managerContactEmail",
      type: "string",
      required: false,
      label: "Manager Contact Email",
      maxLength: 200,
    },
  ],
};
