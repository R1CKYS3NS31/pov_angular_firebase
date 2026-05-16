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
            this.loadingSignal.set(true);
            // console.log("AuthState - currentUser", currentUser);
            if (currentUser) {
                await getUserFirebase(currentUser.uid)
                    .then((userFirestore) => {
                        this.userSignal.set(userFirestore);
                        // console.log("AuthState - userFirestore", userFirestore);
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

    async handleSignUp(userData: any) {
        const { email, password, name, description } = userData;
        const displayName = `${name?.first || ""} ${name?.last || ""}`.trim();
        this.authLoadingSignal.set(true);


        return await signUpUserWithEmailAndPassword(
            email,
            password,
            displayName,
            ""
        ).then(async firebaseUser => {
            // console.log(" SignUp - firebaseUser", firebaseUser)
            return await setUserFirebase({
                uid: firebaseUser?.uid,
                email: firebaseUser?.email || "",
                displayName: firebaseUser?.displayName || displayName,
                displayPicture: firebaseUser?.photoURL || "",
                name: {
                    first: name?.first || firebaseUser?.displayName?.split(" ")[0] || "",
                    last: name?.last || firebaseUser?.displayName?.split(" ").slice(1).join(" ") || "",
                },
                description: description || "",
            }).then(userFirestore => {
                // console.log(" SignUp - userFirestore", userFirestore)
                this.userSignal.set(userFirestore);
                this.notificationService.notify("Account created and signed in successfully!", "success");
                return userFirestore;
            }).catch(error => {
                this.notificationService.handleApiError(error);
                throw error;
            }).finally(() => {
                this.authLoadingSignal.set(false);
            })
        }).catch(error => {
            this.notificationService.handleApiError(error);
            throw error;
        }).finally(() => {
            this.authLoadingSignal.set(false);
        })
    }

    async handleSignIn(email: string, password: string) {
        this.authLoadingSignal.set(true);
        return await signInUserWithEmailAndPassword(email, password)
            .then(async firebaseUser => {
                // console.log(" SignIn - firebaseUser", firebaseUser)
                return await getUserFirebase(firebaseUser.uid)
                    .then(userFirestore => {
                        // console.log(" SignIn - userFirestore", userFirestore)
                        this.userSignal.set(userFirestore);
                        this.notificationService.notify("Signed in successfully!", "success");
                        return userFirestore;
                    }).catch(error => {
                        this.notificationService.handleApiError(error);
                        throw error;
                    }).finally(() => {
                        this.authLoadingSignal.set(false);
                    })
            }).catch(error => {
                this.notificationService.handleApiError(error);
                throw error;
            }).finally(() => {
                this.authLoadingSignal.set(false);
            })

    }

    async handleGoogleSignIn() {
        this.authLoadingSignal.set(true);

        await signInWithGoogleAuth()
            .then(async ({ user, isNewUser }) => {
                // console.log(" Google sign in - user and isNewUser", user, isNewUser)
                if (isNewUser) {
                    return await setUserFirebase({
                        uid: user.uid,
                        email: user.email || "",
                        displayName: user.displayName || "",
                        displayPicture: user.photoURL || "",
                        name: {
                            first: user.displayName?.split(" ")[0] || "",
                            last: user.displayName?.split(" ").slice(1).join(" ") || "",
                        },
                        description: "",
                    }).then(userFirestore => {
                        // console.log(" Google sign in - userFirestore", userFirestore)
                        this.userSignal.set(userFirestore);
                        this.notificationService.notify("Account created and signed in successfully!", "success");
                        return userFirestore;
                    }).catch(error => {
                        this.notificationService.handleApiError(error);
                        throw error;
                    }).finally(() => {
                        this.authLoadingSignal.set(false);
                    })
                }

                return await getUserFirebase(user.uid)
                    .then(async userFirestore => {
                        // console.log(" Google sign in - userFirestore", userFirestore)
                        this.userSignal.set(userFirestore);
                        this.notificationService.notify("Signed in successfully!", "success");
                        return userFirestore;
                    }).catch(error => {
                        this.notificationService.handleApiError(error);
                        throw error;
                    }).finally(() => {
                        this.authLoadingSignal.set(false);
                    })
            }).catch(error => {
                this.notificationService.handleApiError(error);
                throw error;
            }).finally(() => {
                this.authLoadingSignal.set(false);
            })
    }

    async handleSignOut() {
        this.authLoadingSignal.set(true);
        await signOutFirebaseUser()
            .then(() => {
                this.userSignal.set(null);
                this.notificationService.notify("User account signed out successfully!", "success");
            })
            .catch(error => {
                this.notificationService.handleApiError(error);
                throw error;
            }).finally(() => {
                this.authLoadingSignal.set(false);
            })
    }

    async handleUpdatePassword(currentPassword: string, newPassword: string) {
        this.authLoadingSignal.set(true);
        await reauthenticateUserFirebase(currentPassword)
            .then(async () => {
                await updateUserPasswordFirebase(newPassword);
                this.notificationService.notify("Password updated successfully!", "success");
            }).catch(error => {
                this.notificationService.handleApiError(error);
                throw error;
            }).finally(() => {
                this.authLoadingSignal.set(false);
            })
    }

    // async handlePasswordReset(email: string) {
    //     this.authLoadingSignal.set(true);
    //     await sendPasswordResetEmailFirebase(email)
    //         .then(() => {
    //             this.notificationService.notify("Password reset email sent successfully!", "success");
    //         }).catch(error => {
    //             this.notificationService.handleApiError(error);
    //             throw error;
    //         }).finally(() => {
    //             this.authLoadingSignal.set(false);
    //         })
    // }
}
