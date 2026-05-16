import { type User } from "./user.model";

export interface PoVComment {
  id: number | string;
  postedBy: {
    id: string;
    name: {
      first: string;
      last: string;
      full?: string;
    };
    displayPicture?: string;
  };
  comment: string;
  postedAt: number | string;
}

export interface PoV {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  points: string;
  author: string | User;
  published: boolean;
  likes?: string[];
  likesCount: number;
  comments?: PoVComment[];
  commentsCount: number;
  createdAt?: string;
  updatedAt?: string;
  exists?: boolean;
  isLocal?: boolean;
}

export interface PoVSnapshot {
  size: number;
  empty: boolean;
  content: PoV[];
  lastVisible: any; // Firestore document snapshot
  last: boolean;
}
