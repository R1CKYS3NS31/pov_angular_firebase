export interface UserName {
  first: string;
  last: string;
  full?: string;
}

export interface User {
  id: string;
  uid?: string; // Firebase Auth UID
  name: UserName;
  displayName: string;
  email: string;
  description?: string;
  displayPicture?: string;
  isUser: boolean;
  createdAt?: string;
  updatedAt?: string;
  exists?: boolean;
}

export interface Profile extends User {
  // Add any profile specific fields here if they differ from User
}
