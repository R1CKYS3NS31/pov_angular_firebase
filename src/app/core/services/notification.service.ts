import { inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificationSeverity } from "../models/ui.model";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  notify(message: string, severity: NotificationSeverity = 'info', isAuthError: boolean = false) {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: [`snackbar-${severity}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  closeNotification() {
    this.snackBar.dismiss();
  }

  handleApiError(err: any, customFallbackMessage: string | null = null) {
    let message = customFallbackMessage || 'An unexpected error occurred. Please try again.';
    let isAuthError = false;

    if (err?.code) {
      switch(err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          isAuthError = true;
          break;
        case 'auth/email-already-in-use':
          message = 'Email is already in use.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak.';
          break;
        default:
          message = err.message || message;
      }
    } else if (err?.status) {
      const status = err.status;
      if (status === 401 || status === 403) {
        isAuthError = true;
        message = 'Authentication failed. Please log in again.';
      } else if (status === 404) {
        message = 'Requested resource not found.';
      } else if (status >= 500) {
        message = 'Server encountered an error.';
      } else if (err.message) {
        message = err.message;
      }
    } else if (err?.message) {
      if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      } else {
        message = err.message;
      }
    }

    this.notify(message, 'error', isAuthError);
    
    // Check if in development mode (using Angular's standard isDevMode or environment.ts)
    console.error('[API Error]:', err);
  }
}
