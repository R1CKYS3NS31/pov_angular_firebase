import { computed, inject, Injectable, signal } from "@angular/core";
import { onAuthStateChangedFirebase, signInUserWithEmailAndPassword, signInWithGoogleAuth, signUpUserWithEmailAndPassword } from "../firebase/config/firebase-auth";
import { deleteUserFirebase, getUserFirebase, setUserFirebase, updateUserFirebase } from "../firebase/controller/user-firebase";
import { reauthenticateUserFirebase, signOutFirebaseUser, updateUserPasswordFirebase } from "../firebase/config/firebase-auth";
import { NotificationService } from "./notification.service";
import { type User as FirebaseUser } from "firebase/auth";
import { type User } from "../models/user.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private notificationService = inject(NotificationService);

    private readonly guestUser: User = {
        id: "",
        name: {
            first: "Guest",
            last: "User",
            full: "Guest User"
        },
        displayName: "Guest User",
        email: "",
        displayPicture: "",
        description: "I am a new PoV supporter ready to explore different perspectives!",
    };

    private userSignal = signal<User>({ ...this.guestUser });
    private isAuthenticatedSignal = signal<boolean>(false);
    private loadingSignal = signal<boolean>(true);

    // Todo: confirm that it is account.id not account.uid
    public readonly account = computed<User>(() => this.userSignal());
    public readonly loading = computed<boolean>(() => this.loadingSignal());
    public readonly isAuthenticated = computed<boolean>(() => this.isAuthenticatedSignal());

    constructor() {
        this.loadingSignal.set(true);

        onAuthStateChangedFirebase((currentUser: FirebaseUser | null) => {
            // console.log("AuthState - currentUser", currentUser);
            if (currentUser) {
                getUserFirebase(currentUser.uid)
                    .then((userFirestore) => {
                        this.userSignal.set({ ...userFirestore, id: currentUser.uid });
                        this.isAuthenticatedSignal.set(true);
                        // console.log("AuthState - userFirestore", userFirestore);
                    })
                    .catch((error) => {
                        this.notificationService.handleApiError(error);
                        this.userSignal.set({ ...this.guestUser });
                        this.isAuthenticatedSignal.set(false);
                    })
                    .finally(() => {
                        this.loadingSignal.set(false);
                    });
            } else {
                this.userSignal.set({ ...this.guestUser });
                this.isAuthenticatedSignal.set(false);
                this.loadingSignal.set(false);
            }
        });
    }

    handleSignUp(userData: any) {
        const { email, password, name, description } = userData;
        const displayName = `${name?.first || ""} ${name?.last || ""}`.trim();
        this.loadingSignal.set(true);

        return signUpUserWithEmailAndPassword(email, password, displayName, "")
            .then((firebaseUser) =>
                setUserFirebase({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email || "",
                    displayName: firebaseUser?.displayName || displayName,
                    displayPicture: firebaseUser?.photoURL || "",
                    name: {
                        first: name?.first || firebaseUser?.displayName?.split(" ")[0] || "",
                        last: name?.last || firebaseUser?.displayName?.split(" ").slice(1).join(" ") || "",
                        full: `${name?.first || firebaseUser?.displayName?.split(" ")[0] || ""} ${name?.last || firebaseUser?.displayName?.split(" ").slice(1).join(" ") || ""}`.trim(),
                    },
                    description: description || "",
                }),
            )
            .then((userFirestore) => {
                this.userSignal.set(userFirestore);
                this.isAuthenticatedSignal.set(true);
                this.notificationService.notify("Account created and signed in successfully!", "success");
                return userFirestore;
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    handleSignIn(email: string, password: string) {
        this.loadingSignal.set(true);

        return signInUserWithEmailAndPassword(email, password)
            .then((firebaseUser) => getUserFirebase(firebaseUser.uid))
            .then((userFirestore) => {
                this.userSignal.set(userFirestore);
                this.isAuthenticatedSignal.set(true);
                this.notificationService.notify("Signed in successfully!", "success");
                return userFirestore;
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    handleGoogleSignIn() {
        this.loadingSignal.set(true);

        return signInWithGoogleAuth()
            .then(({ user, isNewUser }) => {
                if (isNewUser) {
                    return setUserFirebase({
                        uid: user.uid,
                        email: user.email || "",
                        displayName: user.displayName || "",
                        displayPicture: user.photoURL || "",
                        name: {
                            first: user.displayName?.split(" ")[0] || "",
                            last: user.displayName?.split(" ").slice(1).join(" ") || "",
                            full: `${user.displayName?.split(" ")[0] || ""} ${user.displayName?.split(" ").slice(1).join(" ") || ""}`.trim(),
                        },
                        description: "",
                    }).then((userFirestore) => {
                        this.userSignal.set(userFirestore);
                        this.isAuthenticatedSignal.set(true);
                        this.notificationService.notify("Account created and signed in successfully!", "success");
                        return userFirestore;
                    });
                }

                return getUserFirebase(user.uid).then((userFirestore) => {
                    this.userSignal.set(userFirestore);
                    this.isAuthenticatedSignal.set(true);
                    this.notificationService.notify("Signed in successfully!", "success");
                    return userFirestore;
                });
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    updateAccount(userData: Partial<User>) {
        const account = this.account();

        if (!this.isAuthenticated() || !account?.id) {
            this.notificationService.notify("You must be logged in to update your account!", "error");
            return;
        }

        this.loadingSignal.set(true);
        return updateUserFirebase(account.id, userData)
            .then((updatedUser) => {
                this.userSignal.update((user) => ({
                    ...user,
                    ...updatedUser,
                }));
                this.notificationService.notify("User account updated successfully!", "success");
                return updatedUser;
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    deleteAccount() {
        const account = this.account();

        if (!this.isAuthenticated() || !account?.id) {
            this.notificationService.notify("You must be logged in to delete your account!", "error");
            return;
        }

        this.loadingSignal.set(true);
        return deleteUserFirebase(account.id)
            .then(() => this.handleSignOut())
            .then(() => {
                this.notificationService.notify("User account deleted successfully!", "success");
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    handleSignOut() {
        this.loadingSignal.set(true);

        return signOutFirebaseUser()
            .then(() => {
                this.userSignal.set({
                    id: "",
                    name: {
                        first: "Guest",
                        last: "User",
                        full: "Guest User",
                    },
                    displayName: "Guest User",
                    email: "",
                    displayPicture: "",
                    description: "I am a new PoV supporter ready to explore different perspectives!",
                });
                this.isAuthenticatedSignal.set(false);
                this.notificationService.notify("User account signed out successfully!", "success");
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    handleUpdatePassword(currentPassword: string, newPassword: string) {
        this.loadingSignal.set(true);

        return reauthenticateUserFirebase(currentPassword)
            .then(() => updateUserPasswordFirebase(newPassword))
            .then(() => {
                this.notificationService.notify("Password updated successfully!", "success");
            })
            .catch((error) => {
                this.notificationService.handleApiError(error);
                throw error;
            })
            .finally(() => {
                this.loadingSignal.set(false);
            });
    }

    // async handlePasswordReset(email: string) {
    //     this.loadingSignal.set(true);
    //     await sendPasswordResetEmailFirebase(email)
    //         .then(() => {
    //             this.notificationService.notify("Password reset email sent successfully!", "success");
    //         }).catch(error => {
    //             this.notificationService.handleApiError(error);
    //             throw error;
    //         }).finally(() => {
    //             this.loadingSignal.set(false);
    //         })
    // }
}
