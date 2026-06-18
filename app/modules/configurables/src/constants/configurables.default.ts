/*
 * Default Configurable Data — seeded into Mongo on first boot.
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  restaurantName: string;
  restaurantTagline: string;
  welcomeMessage: string;
  defaultShiftStartTime: string;
  defaultShiftEndTime: string;
  staffRoles: string[];
  enableShiftConfirmation: boolean;
  showReservationsTab: boolean;
  showInventoryTab: boolean;
  managerContactEmail: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "MiCasa",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#C1440E",
    secondary: "#8F2E06",
    accent: "#F5A623",
  },
  restaurantName: "MiCasa",
  restaurantTagline: "Your team, in sync.",
  welcomeMessage: "Good to see you. Here's your schedule.",
  defaultShiftStartTime: "09:00",
  defaultShiftEndTime: "17:00",
  staffRoles: ["Manager", "Chef", "Waiter", "Bar", "Host", "Kitchen"],
  enableShiftConfirmation: true,
  showReservationsTab: false,
  showInventoryTab: false,
  managerContactEmail: "manager@micasa.app",
};
