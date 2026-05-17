import {
  saveDocData,
  deleteDocData,
  loadDocDataById,
  loadDocsData,
  setDocData,
  loadDocsDataWhere,
  updateDocData,
} from "../config/firebase-firestore";
import { getUserFirebase } from "./user-firebase";
import { type PoV, type PoVComment } from "../../models/pov.model";
import { type User } from "../../models/user.model";
import { type OrderByDirection } from "firebase/firestore";
import { type QuerySnapshotCustom } from "../../models/snapshot.model";

const collectionName = "povs";

interface GetPoVsParams {
  size?: number;
  sortBy?: string;
  sortOrder?: OrderByDirection;
  lastVisible?: any;
}

/**
 * Save a new PoV and populate author.
 */
export const savePoVFirebase = async (pov: Partial<PoV> = {}): Promise<PoV> => {
  const { title, description, points, author } = pov;
  const povData = {
    title: title || "",
    titleLower: (title || "").toLowerCase(), // For case-insensitive search
    description: description || "",
    points: points || "", // points of view from the author - string
    author: author || "",
    published: false,
    likes: [],
    likesCount: 0,
    comments: [],
    commentsCount: 0,
  };

  return await saveDocData(collectionName, "", povData)
    .then(async (snapshot) => await getPoVFirebase(snapshot.id))
    .catch((error) => {
      console.warn(`Failed to save PoV: `, error);
      throw error;
    });
};

/**
 * Get all PoVs with populated authors using cursor pagination.
 */
export const getPoVsFirebase = async ({
  size = 12,
  sortBy = "createdAt",
  sortOrder = "desc",
  lastVisible = null,
}: GetPoVsParams = {}): Promise<QuerySnapshotCustom<PoV>> => {
  return await loadDocsData<PoV>(
    collectionName,
    size,
    sortBy,
    sortOrder,
    lastVisible,
  )
    .then(async (snapshot) => {
      const populatePromises = snapshot.content.map((doc) => povPopulate(doc));
      const populatedDocs = await Promise.all(populatePromises);
      return {
        ...snapshot,
        content: populatedDocs,
      };
    })
    .catch((error) => {
      console.warn(`Failed to get PoVs: `, error);
      throw error;
    });
};

/**
 * Get published PoVs with populated authors using cursor pagination.
 */
export const getPoVsPublishedFirebase = async ({
  size = 12,
  sortBy = "createdAt",
  sortOrder = "desc",
  lastVisible = null,
}: GetPoVsParams = {}): Promise<QuerySnapshotCustom<PoV>> => {
  return await loadDocsDataWhere<PoV>(
    collectionName,
    size,
    [
      {
        field: "published",
        operator: "==",
        value: true,
      },
    ],
    sortBy,
    sortOrder,
    lastVisible,
  )
    .then(async (snapshot) => {
      const populatePromises = snapshot.content.map((doc) => povPopulate(doc));
      const populatedDocs = await Promise.all(populatePromises);
      return {
        ...snapshot,
        content: populatedDocs,
      };
    })
    .catch((error) => {
      console.warn(`Failed to get published PoVs: `, error);
      throw error;
    });
};

/**
 * Search published PoVs by title using titleLower and cursor pagination.
 */
export const searchPoVsByTitleFirebase = async ({
  searchTitle,
  size = 12,
  sortBy = "createdAt",
  sortOrder = "desc",
  lastVisible = null,
}: GetPoVsParams & { searchTitle?: string } = {}): Promise<QuerySnapshotCustom<PoV>> => {
  const searchTerm = (searchTitle || "").toLowerCase();
  return await loadDocsDataWhere<PoV>(
    collectionName,
    size,
    [
      {
        field: "titleLower",
        operator: ">=", // prefix search
        value: searchTerm,
      },
      {
        field: "titleLower",
        operator: "<=",
        value: searchTerm + "\uf8ff",
      },
      {
        field: "published",
        operator: "==",
        value: true,
      },
    ],
    sortBy,
    sortOrder,
    lastVisible,
  )
    .then(async (snapshot) => {
      const populatePromises = snapshot.content.map((doc) => povPopulate(doc));
      const populatedDocs = await Promise.all(populatePromises);
      return {
        ...snapshot,
        content: populatedDocs,
      };
    })
    .catch((error) => {
      console.warn(`Failed to search PoVs by title: `, error);
      throw error;
    });
};

/**
 * Get my PoVs (published or not) using cursor pagination.
 */
export const getMyPoVsFirebase = async (
  authorId: string,
  {
    size = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
    lastVisible = null,
  }: GetPoVsParams = {},
): Promise<QuerySnapshotCustom<PoV>> => {
  return await loadDocsDataWhere<PoV>(
    collectionName,
    size,
    [
      {
        field: "author",
        operator: "==",
        value: authorId,
      },
    ],
    sortBy,
    sortOrder,
    lastVisible,
  )
    .then(async (snapshot) => {
      const populatePromises = snapshot.content.map((doc) => povPopulate(doc));
      const populatedDocs = await Promise.all(populatePromises);
      return {
        ...snapshot,
        content: populatedDocs,
      };
    })
    .catch((error) => {
      console.warn(`Failed to get my PoVs: `, error);
      throw error;
    });
};

/**
 * Get PoVs by author using cursor pagination.
 */
export const getPoVsByAuthorFirebase = async (
  authorId: string,
  {
    size = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
    lastVisible = null,
  }: GetPoVsParams = {},
): Promise<QuerySnapshotCustom<PoV>> => {
  return await loadDocsDataWhere<PoV>(
    collectionName,
    size,
    [
      {
        field: "author",
        operator: "==",
        value: authorId,
      },
      {
        field: "published",
        operator: "==",
        value: true,
      },
    ],
    sortBy,
    sortOrder,
    lastVisible,
  )
    .then(async (snapshot) => {
      const populatePromises = snapshot.content.map((doc) => povPopulate(doc));
      const populatedDocs = await Promise.all(populatePromises);
      return {
        ...snapshot,
        content: populatedDocs,
      };
    })
    .catch((error) => {
      console.warn(`Failed to get PoVs by author: `, error);
      throw error;
    });
};

/**
 * Get a single PoV with populated author.
 */
export const getPoVFirebase = async (povId: string): Promise<PoV> => {
  return await loadDocDataById<PoV>(collectionName, povId)
    .then(async (snapshot) => await povPopulate(snapshot))
    .catch((error) => {
      console.warn(`Failed to get PoV: `, error);
      throw error;
    });
};

/**
 * Update PoV.
 */
export const updatePoVFirebase = async (povId: string, pov: Partial<PoV>): Promise<PoV> => {
  const updatedPov = {
    ...pov,
    titleLower: (pov.title || "").toLowerCase(),
  };
  return await setDocData(collectionName, povId, updatedPov)
    .then(async () => await getPoVFirebase(povId))
    .catch((error) => {
      console.warn(`Failed to update PoV: `, error);
      throw error;
    });
};

/**
 * Delete PoV.
 */
export const deletePoVFirebase = async (povId: string): Promise<{ id: string; success: boolean }> => {
  return await deleteDocData(collectionName, povId).catch((error) => {
    console.warn(`Failed to delete PoV: `, error);
    throw error;
  });
};

export const likePoVFirebase = async (povId: string, userId: string): Promise<PoV> => {
  return await getPoVFirebase(povId)
    .then(async (pov) => {
      const updatedLikes = Array.from(new Set([...(pov.likes || []), userId]));
      return await updateDocData(
        collectionName,
        povId,
        {
          likes: updatedLikes,
          likesCount: updatedLikes.length,
        }
      )
        .then(async () => await getPoVFirebase(povId))
        .catch((error) => {
          console.warn(`Failed to get the liked PoV: `, error);
          throw error;
        });
    })
    .catch((error) => {
      console.warn(`Failed to get the PoV to like: `, error);
      throw error;
    });
};

export const unLikePoVFirebase = async (povId: string, userId: string): Promise<PoV> => {
  return await getPoVFirebase(povId)
    .then(async (pov) => {
      const updatedLikes = (pov.likes || []).filter((id) => id !== userId);
      return await updateDocData(
        collectionName,
        povId,
        {
          likes: updatedLikes,
          likesCount: updatedLikes.length,
        }
      )
        .then(async () => await getPoVFirebase(povId))
        .catch((error) => {
          console.warn(`Failed to update the unliked PoV: `, error);
          throw error;
        });
    })
    .catch((error) => {
      console.warn(`Failed to get the PoV to unlike: `, error);
      throw error;
    });
};

export const commentOnPoVFirebase = async (povId: string, account: User, commentData: { comment: string }): Promise<PoV> => {
  return await getPoVFirebase(povId)
    .then(async (pov) => {
      const newComment: PoVComment = {
        id: Date.now(),
        postedBy: {
          id: account.id || account.uid || "",
          name: account.name || {
            first: "Guest",
            last: "User",
          },
          displayPicture: account.displayPicture || "",
        },
        comment: commentData.comment,
        postedAt: Date.now(),
      };

      const updatedComments = [...(pov.comments || []), newComment];
      return await updateDocData(
        collectionName,
        povId,
        {
          comments: updatedComments,
          commentsCount: updatedComments.length,
        }
      )
        .then(async () => await getPoVFirebase(povId))
        .catch((error) => {
          console.warn(`Failed to update the commenting on PoV: `, error);
          throw error;
        });
    })
    .catch((error) => {
      console.warn(`Failed to get the PoV to comment on: `, error);
      throw error;
    });
};

export const uncommentPoVFirebase = async (povId: string, commentId: string | number): Promise<PoV> => {
  return await getPoVFirebase(povId)
    .then(async (pov) => {
      const updatedComments = (pov.comments || []).filter(
        (comment) => comment.id !== commentId,
      );
      return await updateDocData(
        collectionName,
        povId,
        {
          comments: updatedComments,
          commentsCount: updatedComments.length,
        }
      )
        .then(async () => await getPoVFirebase(povId))
        .catch((error) => {
          console.warn(`Failed to update the uncommenting on PoV: `, error);
          throw error;
        });
    })
    .catch((error) => {
      console.warn(`Failed to get the PoV to uncomment on: `, error);
      throw error;
    });
};

/**
 * Helper to populate PoV author.
 */
const povPopulate = async (povData: PoV): Promise<PoV> => {
  if (!povData?.author || typeof povData.author !== "string") {
    return {
      ...povData,
      author: typeof povData.author === "object" ? povData.author : ({} as User),
    };
  }

  const authorId = povData.author;

  return await getUserFirebase(authorId)
    .then((author) => {
      return {
        ...povData,
        author,
      };
    })
    .catch((error) => {
      console.warn(`Failed to load author ${authorId}:`, error);
      return {
        ...povData,
        author: { id: authorId } as User, // Return partial user if fetch fails
      };
    });
};

/**
 * Migration function to add likesCount and commentsCount to existing PoVs.
 */
export const migratePovsCounts = async () => {
  const querySnapshot = await loadDocsData<PoV>(collectionName, 1000); // Load all
  const updatePromises = querySnapshot.content.map(async (pov) => {
    return await updateDocData(collectionName, pov.id, {
      likesCount: (pov.likes || []).length,
      commentsCount: (pov.comments || []).length,
    });
  });
  return await Promise.all(updatePromises);
};
