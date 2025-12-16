import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase"; // Assuming db is exported from firebase.ts

// Types
export interface Project {
  id?: string;
  userId: string;
  name: string;
  client: string;
  hourlyRate: number;
  status: 'active' | 'completed' | 'archived';
  color: string;
  createdAt?: any;
}

export interface TimeLog {
  id?: string;
  userId: string;
  projectId: string;
  startTime: any;
  endTime: any | null;
  duration: number; // in seconds
  description: string;
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  settings: {
    currency?: string;
    theme?: 'light' | 'dark' | 'system';
    [key: string]: any;
  };
  createdAt?: any;
  lastLogin?: any;
}

// Projects API
export const addProject = async (project: Project) => {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding project: ", e);
    throw e;
  }
};

export const getProjects = async (userId: string) => {
  try {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (e) {
    console.error("Error getting projects: ", e);
    throw e;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error("Error updating project: ", e);
    throw e;
  }
};

export const deleteProject = async (id: string) => {
  try {
    await deleteDoc(doc(db, "projects", id));
  } catch (e) {
    console.error("Error deleting project: ", e);
    throw e;
  }
};

// Time Logs API
export const addTimeLog = async (log: TimeLog) => {
  try {
    const docRef = await addDoc(collection(db, "timeLogs"), {
      ...log,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding time log: ", e);
    throw e;
  }
};

export const getTimeLogs = async (userId: string) => {
  try {
    const q = query(
      collection(db, "timeLogs"),
      where("userId", "==", userId),
      orderBy("startTime", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeLog));
  } catch (e) {
    console.error("Error getting time logs: ", e);
    throw e;
  }
};

export const updateTimeLog = async (id: string, updates: Partial<TimeLog>) => {
  try {
    const docRef = doc(db, "timeLogs", id);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error("Error updating time log: ", e);
    throw e;
  }
};

export const deleteTimeLog = async (id: string) => {
  try {
    await deleteDoc(doc(db, "timeLogs", id));
  } catch (e) {
    console.error("Error deleting time log: ", e);
    throw e;
  }
};

// User API
export const createUserProfile = async (user: UserProfile) => {
  try {
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.error("Error creating user profile: ", e);
    throw e;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting user profile: ", e);
    throw e;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error("Error updating user profile: ", e);
    throw e;
  }
};

