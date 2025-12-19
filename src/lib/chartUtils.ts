import { Project, TimeLog } from "./firestore";

export interface ProjectChartData {
    name: string;
    value: number; // Hours
    color: string;
    [key: string]: any;
}

export interface WeeklyChartData {
    day: string; // "Sun", "Mon" etc.
    hours: number;
    date: string; // Full date for tooltip
    [key: string]: any;
}

export const prepareProjectData = (projects: Project[], logs: TimeLog[]): ProjectChartData[] => {
    const projectMap = new Map<string, number>();

    // Initialize all projects with 0 hours
    projects.forEach(p => {
        if (p.id) projectMap.set(p.id, 0);
    });

    // Sum duration (seconds) for each project
    logs.forEach(log => {
        if (projectMap.has(log.projectId)) {
            const current = projectMap.get(log.projectId) || 0;
            projectMap.set(log.projectId, current + log.duration);
        }
    });

    // Convert to array and format hours
    return projects
        .map(p => ({
            name: p.name,
            value: Number(((projectMap.get(p.id!) || 0) / 3600).toFixed(1)), // Convert seconds to hours
            color: p.color || '#3f51b5'
        }))
        .filter(item => item.value > 0) // Only show projects with activity
        .sort((a, b) => b.value - a.value); // Sort desc
};

export const prepareWeeklyActivity = (logs: TimeLog[]): WeeklyChartData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hebrewDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

    const today = new Date();
    const last7Days: WeeklyChartData[] = [];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(0, 0, 0, 0);

        last7Days.push({
            day: hebrewDays[d.getDay()],
            hours: 0,
            date: d.toLocaleDateString('he-IL')
        });
    }

    // Aggregate logs
    logs.forEach(log => {
        if (!log.startTime) return;

        // Handle Timestamp or date string/number
        const logDate = log.startTime.toDate ? log.startTime.toDate() : new Date(log.startTime);
        const logDayStr = logDate.toLocaleDateString('he-IL');

        const dayEntry = last7Days.find(d => d.date === logDayStr);
        if (dayEntry) {
            dayEntry.hours += log.duration / 3600;
        }
    });

    // Round hours
    return last7Days.map(d => ({
        ...d,
        hours: Number(d.hours.toFixed(1))
    }));
};
