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
  getDoc,
  arrayUnion
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

export interface SubTask {
  id: string;
  name: string;
  status: 'active' | 'completed';
}

export interface Task {
  id?: string;
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  isCompleted: boolean; // Keep for backward compatibility (mapped from status)
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: number | null;
  createdAt: number;
  subTasks: SubTask[];
}

export interface TimeLog {
  id?: string;
  userId: string;
  projectId: string;
  taskId?: string;
  subTaskId?: string;
  taskName?: string; // Denormalized for display
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

// Tasks API
export const addTask = async (userId: string, projectId: string, name: string, description: string = '', priority: 'high' | 'medium' | 'low' = 'medium', dueDate: number | null = null, status: 'todo' | 'in-progress' | 'done' = 'todo') => {
  try {
    const taskRef = doc(collection(db, `users/${userId}/projects/${projectId}/tasks`));
    const task: Task = {
      id: taskRef.id,
      projectId,
      userId,
      name,
      description,
      isCompleted: status === 'done',
      status: status, // Use provided status
      priority,
      dueDate,
      createdAt: Date.now(),
      subTasks: []
    };
    await setDoc(taskRef, task);
    return task;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
};

export const addSubTask = async (userId: string, projectId: string, taskId: string, subTaskName: string) => {
  try {
    const taskRef = doc(db, "users", userId, "projects", projectId, "tasks", taskId);
    const newSubTask: SubTask = {
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      name: subTaskName,
      status: 'active'
    };
    await updateDoc(taskRef, {
      subTasks: arrayUnion(newSubTask)
    });
    return newSubTask;
  } catch (e) {
    console.error("Error adding sub-task: ", e);
    throw e;
  }
};

export const getProjectTasks = async (userId: string, projectId: string) => {
  try {
    const tasksRef = collection(db, "users", userId, "projects", projectId, "tasks");
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (e) {
    console.error("Error getting project tasks: ", e);
    return [];
  }
};

export const getAllUserTasks = async (userId: string, projects: Project[]) => {
  try {
    const allTasks: Task[] = [];
    // Helper to fetch tasks for one project
    const fetchForProject = async (projectId: string) => {
      const tasksRef = collection(db, "users", userId, "projects", projectId, "tasks");
      const snapshot = await getDocs(tasksRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    };

    // Run in parallel
    const results = await Promise.all(projects.map(async (p) => {
      if (p.id) return await fetchForProject(p.id);
      return [];
    }));

    results.forEach(tasks => allTasks.push(...tasks));
    return allTasks;
  } catch (e) {
    console.error("Error getting all user tasks:", e);
    return [];
  }
};

export const updateTaskStatus = async (userId: string, projectId: string, taskId: string, status: 'todo' | 'in-progress' | 'done') => {
  try {
    const taskRef = doc(db, `users/${userId}/projects/${projectId}/tasks`, taskId);
    await updateDoc(taskRef, {
      status,
      isCompleted: status === 'done' // Auto-update legacy field
    });
  } catch (error) {
    console.error("Error updating task status: ", error);
    throw error;
  }
};

export const updateTask = async (userId: string, projectId: string, taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(db, "users", userId, "projects", projectId, "tasks", taskId);
    await updateDoc(taskRef, updates);
  } catch (e) {
    console.error("Error updating task: ", e);
    throw e;
  }
};

export const deleteTask = async (userId: string, projectId: string, taskId: string) => {
  try {
    const taskRef = doc(db, "users", userId, "projects", projectId, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (e) {
    console.error("Error deleting task: ", e);
    throw e;
  }
};

export const updateSubTask = async (userId: string, projectId: string, taskId: string, subTasks: SubTask[]) => {
  try {
    const taskRef = doc(db, "users", userId, "projects", projectId, "tasks", taskId);
    await updateDoc(taskRef, { subTasks });
  } catch (e) {
    console.error("Error updating sub-tasks: ", e);
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

