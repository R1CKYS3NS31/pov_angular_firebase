import { QueryDocumentSnapshot } from "firebase/firestore";

export interface QuerySnapshotCustom<T> {
  size: number;
  empty: boolean;
  content: T[];
  lastVisible: QueryDocumentSnapshot | null;
  last: boolean;
}