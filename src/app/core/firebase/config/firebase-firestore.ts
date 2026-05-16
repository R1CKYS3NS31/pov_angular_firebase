import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  orderBy,
  startAfter,
  getCountFromServer,
  type DocumentData,
  type FirestoreDataConverter,
  QueryDocumentSnapshot,
  type OrderByDirection,
  type WhereFilterOp,
} from "firebase/firestore";
import { firebaseApp } from "./firebase-config";

const firestore = getFirestore(firebaseApp);

/**
 * Recursively converts Firestore Timestamp instances to plain ISO strings.
 */
const toPlain = (value: any): any => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toPlain(v)])
    );
  return value;
};

/**
 * Firestore data converter applied to every collection reference.
 */
const firestoreConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      exists: snapshot.exists(),
      ...toPlain(data),
    } as T;
  },
});

/** Returns a collection reference with the converter pre-attached. */
const getCol = <T extends DocumentData>(name: string) =>
  collection(firestore, name).withConverter(firestoreConverter<T>());

export interface QuerySnapshotCustom<T> {
  size: number;
  empty: boolean;
  content: T[];
  lastVisible: QueryDocumentSnapshot | null;
  last: boolean;
}

/**
 * Save data to a collection.
 */
export const saveDocData = async <T extends DocumentData>(
  collectionName: string,
  pathSegment: string = "",
  docData: T
) => {
  const colRef = pathSegment
    ? collection(firestore, collectionName, pathSegment)
    : collection(firestore, collectionName);

  return await addDoc(colRef, {
    ...docData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
    .then((docRef) => ({
      id: docRef.id,
      path: docRef.path,
    }))
    .catch((error) => {
      throw error;
    });
};

/**
 * Load documents from a collection using cursor pagination.
 */
export const loadDocsData = async <T extends DocumentData>(
  collectionName: string,
  size: number = 12,
  sortBy: string = "createdAt",
  sortDirection: OrderByDirection = "desc",
  lastVisible: QueryDocumentSnapshot | null = null
): Promise<QuerySnapshotCustom<T>> => {
  const colRef = getCol<T>(collectionName);

  const queryConstraints: any[] = [orderBy(sortBy, sortDirection), limit(size)];
  if (lastVisible) {
    queryConstraints.push(startAfter(lastVisible));
  }

  const q = query(colRef, ...queryConstraints);

  return await getDocs(q)
    .then((snapshot) => {
      const docs = snapshot.docs;
      const lastDoc = docs[docs.length - 1] || null;

      return {
        size: docs.length,
        empty: docs.length === 0,
        content: docs.map((d) => d.data()),
        lastVisible: lastDoc,
        last: docs.length < size,
      };
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * Load a single document by ID.
 */
export const loadDocDataById = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  ...pathSegments: string[]
): Promise<T> => {
  const docRef = doc(firestore, collectionName, docId, ...pathSegments).withConverter(
    firestoreConverter<T>()
  );

  return await getDoc(docRef)
    .then((snap) =>
      snap.exists()
        ? snap.data()!
        : ({ id: snap.id, exists: false } as unknown as T)
    )
    .catch((error) => {
      throw error;
    });
};

export interface FilterConstraint {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

/**
 * Load documents with a simple WHERE filter using cursor pagination.
 */
export const loadDocsDataWhere = async <T extends DocumentData>(
  collectionName: string,
  size: number = 12,
  filters: FilterConstraint[] = [],
  sortBy: string = "createdAt",
  sortDirection: OrderByDirection = "desc",
  lastVisible: QueryDocumentSnapshot | null = null
): Promise<QuerySnapshotCustom<T>> => {
  const colRef = getCol<T>(collectionName);
  const filterConstraints = filters.map(({ field, operator, value }) =>
    where(field, operator, value)
  );

  const queryConstraints: any[] = [
    ...filterConstraints,
    orderBy(sortBy, sortDirection),
    limit(size),
  ];
  if (lastVisible) {
    queryConstraints.push(startAfter(lastVisible));
  }

  const q = query(colRef, ...queryConstraints);

  return await getDocs(q)
    .then((snapshot) => {
      const docs = snapshot.docs;
      const lastDoc = docs[docs.length - 1] || null;

      return {
        size: docs.length,
        empty: docs.length === 0,
        content: docs.map((d) => d.data()),
        lastVisible: lastDoc,
        last: docs.length < size,
      };
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * Set (overwrite/merge) a document by ID.
 */
export const setDocData = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  docData: T = {} as T,
  ...pathSegments: string[]
) => {
  const docRef = doc(firestore, collectionName, docId, ...pathSegments);

  return await setDoc(
    docRef,
    {
      ...docData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
    .then(() => ({
      id: docId,
      success: true,
    }))
    .catch((error) => {
      throw error;
    });
};

/**
 * Update a document by ID.
 */
export const updateDocData = async (
  collectionName: string,
  docId: string,
  docData: DocumentData = {},
  ...pathSegments: string[]
) => {
  const docRef = doc(firestore, collectionName, docId, ...pathSegments);

  return await updateDoc(docRef, {
    ...docData,
    updatedAt: serverTimestamp(),
  })
    .then(() => ({
      id: docId,
      success: true,
    }))
    .catch((error) => {
      throw error;
    });
};

/**
 * Delete a document by ID.
 */
export const deleteDocData = async (
  collectionName: string,
  docId: string,
  ...pathSegments: string[]
) => {
  const docRef = doc(firestore, collectionName, docId, ...pathSegments);

  return await deleteDoc(docRef)
    .then(() => ({
      id: docId,
      success: true,
    }))
    .catch((error) => {
      throw error;
    });
};

/**
 * Get total count of documents in a collection.
 */
export const getDocsCount = async (collectionName: string): Promise<number> => {
  const colRef = collection(firestore, collectionName);
  const snapshot = await getCountFromServer(colRef);
  return snapshot.data().count;
};
