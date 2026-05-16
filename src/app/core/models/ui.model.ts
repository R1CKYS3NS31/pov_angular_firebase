export type NotificationSeverity = "success" | "error" | "warning" | "info";

export interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  duration: number;
  isAuthError?: boolean;
}

export type ThemeType = "light" | "dark";

export interface ThemeState {
  themeType: ThemeType;
}
