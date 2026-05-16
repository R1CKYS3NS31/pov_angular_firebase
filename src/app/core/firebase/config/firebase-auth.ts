import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
  type NextOrObserver,
} from "firebase/auth";
import { firebaseApp } from "./firebase-config";

const auth = getAuth(firebaseApp);
auth.useDeviceLanguage();

/**
 * Sign in with Google Popup.
 */
export const signInWithGoogleAuth = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider)
    .then((result) => {
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser || false;
      return { user: result.user, isNewUser };
    });
};

/**
 * Sign up with email/password and set profile.
 */
export const signUpUserWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string,
  displayPicture?: string
): Promise<FirebaseUser> => {
  return await createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
    const user = userCredential.user;
    await updateProfile(user, {
      displayName,
      photoURL: displayPicture,
    });
    return user;
  });
};

/**
 * Sign in with email/password.
 */
export const signInUserWithEmailAndPassword = async (email: string, password: string): Promise<FirebaseUser> => {
  return await signInWithEmailAndPassword(auth, email, password).then((userCredential) => userCredential.user);
};

/**
 * Sign out.
 */
export const signOutFirebaseUser = async (): Promise<void> => {
  return await signOut(auth);
};

/**
 * Check if user is signed in.
 */
export const isUserSignedIn = (): boolean => !!auth.currentUser;

/**
 * Subscribe to auth state changes.
 */
export const onAuthStateChangedFirebase = (callback: NextOrObserver<FirebaseUser>) => {
  const unsubscribe = onAuthStateChanged(auth, callback);
  return unsubscribe;
};

/**
 * Get current user.
 */
export const getCurrentUser = (): FirebaseUser | null => auth.currentUser;

/**
 * Update current user's profile.
 */
export const updateUserProfile = async (displayName: string, displayPicture?: string): Promise<FirebaseUser> => {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("User not signed in"));

  await updateProfile(user, {
    displayName,
    photoURL: displayPicture,
  });
  return user;
};

/**
 * Update current user's email.
 */
export const updateUserEmailFirebase = async (email: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("User not signed in"));

  return await updateEmail(user, email);
};

/**
 * Update current user's password.
 */
export const updateUserPasswordFirebase = async (password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("User not signed in"));

  return await updatePassword(user, password);
};

/**
 * Reauthenticate current user.
 */
export const reauthenticateUserFirebase = async (currentPassword: string): Promise<any> => {
  const user = auth.currentUser;
  if (!user || !user.email)
    return Promise.reject(new Error("User not signed in or email missing"));

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  return await reauthenticateWithCredential(user, credential);
};

/**
 * Send email verification.
 */
export const sendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("User not signed in"));

  return await sendEmailVerification(user);
};

/**
 * Send password reset email.
 */
export const sendResetPasswordEmail = async (email: string): Promise<void> => {
  return await sendPasswordResetEmail(auth, email);
};

/**
 * Delete user account.
 */
export const deleteUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("User not signed in"));

  return await deleteUser(user);
};
