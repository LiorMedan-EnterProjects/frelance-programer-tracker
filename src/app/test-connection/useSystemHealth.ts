"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    updateDoc,
    orderBy,
    Timestamp
} from 'firebase/firestore';

export type TestStatus = 'idle' | 'running' | 'success' | 'error';

export interface TestResult {
    id: string;
    name: string;
    status: TestStatus;
    details?: string;
}

export function useSystemHealth() {
    const { user } = useAuth();
    const [results, setResults] = useState<TestResult[]>([
        { id: 'auth', name: 'בדיקת אימות משתמש', status: 'idle' },
        { id: 'project_crud', name: 'פרויקטים: יצירה, קריאה, מחיקה', status: 'idle' },
        { id: 'timelog_crud', name: 'דיווח שעות: אינדקסים ושמירה', status: 'idle' }
    ]);
    const [isRunning, setIsRunning] = useState(false);

    const updateResult = (id: string, status: TestStatus, details?: string) => {
        setResults(prev => prev.map(r => r.id === id ? { ...r, status, details } : r));
    };

    const runTests = async () => {
        if (isRunning) return;
        setIsRunning(true);

        // Reset all
        setResults(prev => prev.map(r => ({ ...r, status: 'running', details: '' })));

        try {
            // --- TEST 1: AUTH ---
            if (!user) {
                updateResult('auth', 'error', 'משתמש לא מחובר');
                setIsRunning(false);
                return;
            }
            updateResult('auth', 'success', `מחובר כ: ${user.email}`);

            // --- TEST 2: PROJECT CRUD ---
            let testProjectId = '';
            try {
                // Create
                const projectRef = await addDoc(collection(db, 'projects'), {
                    name: `TEST_PROJECT_${Date.now()}`,
                    userId: user.uid,
                    status: 'active',
                    createdAt: Timestamp.now()
                });
                testProjectId = projectRef.id;

                // Read (Query)
                const q = query(
                    collection(db, 'projects'),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const found = snapshot.docs.some(d => d.id === testProjectId);

                if (!found) throw new Error('הפרויקט נוצר אך לא נמצא בשליפה');

                // Delete
                await deleteDoc(doc(db, 'projects', testProjectId));
                updateResult('project_crud', 'success', 'תהליך מלא תקין');
            } catch (e: any) {
                console.error("Project Test Failed", e);
                updateResult('project_crud', 'error', e.message);
                // Cleanup if needed
                if (testProjectId) await deleteDoc(doc(db, 'projects', testProjectId)).catch(() => { });
            }

            // --- TEST 3: TIMELOG CRUD & INDEX ---
            let testLogId = '';
            try {
                // Create dummy log
                const logRef = await addDoc(collection(db, 'timeLogs'), {
                    userId: user.uid,
                    projectId: 'TEST_PROJECT_ID', // Doesn't need to exist really, just needed for the object
                    startTime: Timestamp.now(),
                    endTime: Timestamp.now(),
                    duration: 3600,
                    description: 'Automated Test Log'
                });
                testLogId = logRef.id;

                // Test the problematic Query (Index Check)
                const qLog = query(
                    collection(db, 'timeLogs'),
                    where("userId", "==", user.uid),
                    orderBy("startTime", "desc")
                );
                const logSnapshot = await getDocs(qLog); // This will fail if index is missing
                const logFound = logSnapshot.docs.some(d => d.id === testLogId);

                if (!logFound) throw new Error('הלוג נוצר אך לא נמצא בשליפה');

                // Delete
                await deleteDoc(doc(db, 'timeLogs', testLogId));
                updateResult('timelog_crud', 'success', 'אינדקס תקין, שמירה ומחיקה עובדות');

            } catch (e: any) {
                console.error("TimeLog Test Failed", e);
                if (e.code === 'failed-precondition') {
                    updateResult('timelog_crud', 'error', 'חסר אינדקס! בדוק את הקונסול לקישור');
                } else {
                    updateResult('timelog_crud', 'error', e.message);
                }
                // Cleanup
                if (testLogId) await deleteDoc(doc(db, 'timeLogs', testLogId)).catch(() => { });
            }

        } catch (globalError: any) {
            console.error("Global Test Error", globalError);
        } finally {
            setIsRunning(false);
        }
    };

    return { results, runTests, isRunning };
}
