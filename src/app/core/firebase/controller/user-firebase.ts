import {
  deleteDocData,
  loadDocDataById,
  loadDocsData,
  setDocData,
  updateDocData,
  saveDocData,
  type QuerySnapshotCustom,
} from "../config/firebase-firestore";
import { type User } from "../../models/user.model";

const collectionName = "users";

/**
 * Create a new user with generated ID.
 */
export const saveUserFirebase = async (user: Partial<User> = {}): Promise<User> => {
  const { displayName, name, email, displayPicture, isUser } = user;

  const userData = {
    name: {
      first: name?.first || displayName?.split(" ")[0] || "",
      last: name?.last || displayName?.split(" ").slice(1).join(" ") || "",
    },
    displayName: displayName || "",
    email: email || "",
    description: user.description || "",
    displayPicture: displayPicture || "",
    isUser: isUser ?? true,
  };

  return await saveDocData(collectionName, "", userData)
    .then(async (snapshot) => await getUserFirebase(snapshot.id))
    .catch((error) => {
      console.warn(`Failed to save user: `, error);
      throw error;
    });
};

/**
 * Create or overwrite user with specific UID.
 */
export const setUserFirebase = async (user: Partial<User> & { uid: string }): Promise<User> => {
  const { uid, displayName, name, email, displayPicture, isUser } = user;

  if (!uid)
    return Promise.reject(new Error("UID is required for setUserFirebase"));

  const userData = {
    name: {
      first: name?.first || displayName?.split(" ")[0] || "",
      last: name?.last || displayName?.split(" ").slice(1).join(" ") || "",
    },
    displayName: displayName || "",
    email: email || "",
    description: user.description || "",
    displayPicture: displayPicture || "",
    isUser: isUser ?? true,
  };

  return await setDocData(collectionName, uid, userData)
    .then(async () => await getUserFirebase(uid))
    .catch((error) => {
      console.warn(`Failed to set user: `, error);
      throw error;
    });
};

/**
 * Get all users.
 */
export const getUsersFirebase = async (): Promise<QuerySnapshotCustom<User>> => {
  return await loadDocsData<User>(collectionName).catch((error) => {
    console.warn(`Failed to get users: `, error);
    throw error;
  });
};

/**
 * Get single user by ID.
 */
export const getUserFirebase = async (userId: string): Promise<User> => {
  if (!userId) return Promise.reject(new Error("User ID is required"));

  return await loadDocDataById<User>(collectionName, userId).catch((error) => {
    console.warn(`Failed to get user ${userId}: `, error);
    throw error;
  });
};

/**
 * Update user details.
 */
export const updateUserFirebase = async (userId: string, user: Partial<User>): Promise<User> => {
  if (!userId) return Promise.reject(new Error("User ID is required"));

  return await updateDocData(collectionName, userId, user)
    .then(async () => await getUserFirebase(userId))
    .catch((error) => {
      console.warn(`Failed to update user: `, error);
      throw error;
    });
};

/**
 * Delete user.
 */
export const deleteUserFirebase = async (userId: string): Promise<{ id: string; success: boolean }> => {
  if (!userId) return Promise.reject(new Error("User ID is required"));

  return await deleteDocData(collectionName, userId).catch((error) => {
    console.warn(`Failed to delete user: `, error);
    throw error;
  });
};
