import { initializeApp } from "firebase/app";
import { environment } from "../../../../environments/environment";

// Initialize Firebase
export const firebaseApp = initializeApp(environment.firebase);
