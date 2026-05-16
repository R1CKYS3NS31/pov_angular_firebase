import { computed, inject, Injectable, signal } from "@angular/core";
import { onAuthStateChangedFirebase, signInUserWithEmailAndPassword, signInWithGoogleAuth, signUpUserWithEmailAndPassword } from "../firebase/config/firebase-auth";
import { getUserFirebase, setUserFirebase } from "../firebase/controller/user-firebase";
import { reauthenticateUserFirebase, signOutFirebaseUser, updateUserPasswordFirebase } from "../firebase/config/firebase-auth";
import { NotificationService } from "./notification.service";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "../models/user.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private notificationService = inject(NotificationService);

    private userSignal = signal<User | null>(null);
    private loadingSignal = signal<boolean>(true);
    private authLoadingSignal = signal<boolean>(false);

    public readonly user = computed<User | null>(() => this.userSignal());
    public readonly loading = computed<boolean>(() => this.loadingSignal() || this.authLoadingSignal());
    public readonly isAuthenticated = computed<boolean>(() => !!this.userSignal());

    constructor() {
        onAuthStateChangedFirebase(async (currentUser: FirebaseUser | null) => {
            if (currentUser) {
                await getUserFirebase(currentUser.uid)
                    .then((userFirestore) => {
                        this.userSignal.set(userFirestore);
                        // console.log(userFirestore);
                    })
                    .catch((error) => {
                        this.notificationService.handleApiError(error);
                        this.userSignal.set(null);
                    })
                    .finally(() => {
                        this.loadingSignal.set(false);
                    })
            } else {
                this.userSignal.set(null);
                this.loadingSignal.set(false);
            }
        });
    }

    public updateAccountData(user: User) {
        this.userSignal.set(user);
    }

    async handleSignUp(userData: any) {
        const { email, password, name, description } = userData;
        const displayName = `${name?.first || ""} ${name?.last || ""}`.trim();
        this.authLoadingSignal.set(true);

        try {
            const firebaseUser = await signUpUserWithEmailAndPassword(
                email,
                password,
                displayName,
                ""
            );

            const userFirestore = await setUserFirebase({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || displayName,
                displayPicture: firebaseUser.photoURL || "",
                name: {
                    first: name?.first || firebaseUser.displayName?.split(" ")[0] || "",
                    last: name?.last || firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                },
                description: description || "",
            });

            this.userSignal.set(userFirestore);
            this.notificationService.notify("Account created and signed in successfully!", "success");
            return userFirestore;
        } catch (error: any) {
            this.notificationService.handleApiError(error);
            throw error;
        } finally {
            this.authLoadingSignal.set(false);
        }
    }

    async handleSignIn(email: string, password: string) {
        this.authLoadingSignal.set(true);
        try {
            const firebaseUser = await signInUserWithEmailAndPassword(email, password);
            const userFirestore = await getUserFirebase(firebaseUser.uid);
            this.userSignal.set(userFirestore);
            this.notificationService.notify("Signed in successfully!", "success");
            return userFirestore;
        } catch (error: any) {
            this.notificationService.handleApiError(error);
            throw error;
        } finally {
            this.authLoadingSignal.set(false);
        }
    }

    async handleGoogleSignIn() {
        this.authLoadingSignal.set(true);
        try {
            const { user: firebaseUser, isNewUser } = await signInWithGoogleAuth();
            if (isNewUser) {
                const userFirestore = await setUserFirebase({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName: firebaseUser.displayName || "",
                    displayPicture: firebaseUser.photoURL || "",
                    name: {
                        first: firebaseUser.displayName?.split(" ")[0] || "",
                        last: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                    },
                    description: "",
                });
                this.userSignal.set(userFirestore);
                this.notificationService.notify("Account created and signed in successfully!", "success");
                return userFirestore;
            }

            const userFirestore = await getUserFirebase(firebaseUser.uid);
            this.userSignal.set(userFirestore);
            this.notificationService.notify("Signed in successfully!", "success");
            return userFirestore;
        } catch (error: any) {
            this.notificationService.handleApiError(error);
            throw error;
        } finally {
            this.authLoadingSignal.set(false);
        }
    }

    async handleSignOut() {
        this.authLoadingSignal.set(true);
        try {
            await signOutFirebaseUser();
            this.userSignal.set(null);
            this.notificationService.notify("User account signed out successfully!", "success");
        } catch (error: any) {
            this.notificationService.handleApiError(error);
            throw error;
        } finally {
            this.authLoadingSignal.set(false);
        }
    }

    async handleUpdatePassword(currentPassword: string, newPassword: string) {
        this.authLoadingSignal.set(true);
        try {
            await reauthenticateUserFirebase(currentPassword);
            await updateUserPasswordFirebase(newPassword);
            this.notificationService.notify("Password updated successfully!", "success");
        } catch (error: any) {
            this.notificationService.handleApiError(error);
            throw error;
        } finally {
            this.authLoadingSignal.set(false);
        }
    }
}
