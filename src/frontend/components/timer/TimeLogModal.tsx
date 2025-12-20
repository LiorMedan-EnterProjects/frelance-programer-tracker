import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Project, Task, getProjectTasks } from '@/backend/firestore';
import { Timestamp } from 'firebase/firestore';

interface TimeLogModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (logData: any) => Promise<void>;
    log?: any; // TimeLog but loose for now
    projects: Project[];
    userId: string;
}

export default function TimeLogModal({ open, onClose, onSave, log, projects, userId }: TimeLogModalProps) {
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Load initial data when log provided
    useEffect(() => {
        if (open) {
            if (log) {
                // Edit Mode
                setSelectedProject(log.projectId || '');
                setSelectedTaskId(log.taskId || '');
                setDescription(log.description || '');

                // Parse dates
                let start = new Date();
                let end = new Date();

                if (log.startTime) {
                    start = log.startTime.toDate ? log.startTime.toDate() : new Date(log.startTime);
                }
                if (log.endTime) {
                    end = log.endTime.toDate ? log.endTime.toDate() : new Date(log.endTime);
                }

                setDate(start.toISOString().split('T')[0]);
                setStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                setEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            } else {
                // Create Mode - Defaults
                setSelectedProject('');
                setSelectedTaskId('');
                setDescription('');
                setDate(new Date().toISOString().split('T')[0]);
                setStartTime('09:00');
                setEndTime('10:00');
            }
        }
    }, [open, log]);

    // Fetch tasks when project changes
    useEffect(() => {
        const fetchTasks = async () => {
            if (selectedProject) {
                setLoadingTasks(true);
                try {
                    const projectTasks = await getProjectTasks(userId, selectedProject);
                    setTasks(projectTasks);
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                } finally {
                    setLoadingTasks(false);
                }
            } else {
                setTasks([]);
            }
        };
        fetchTasks();
    }, [selectedProject, userId]);

    const handleSubmit = async () => {
        if (!selectedProject) return;

        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        if (duration <= 0) {
            alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
            return;
        }

        const task = tasks.find(t => t.id === selectedTaskId);

        const logData = {
            projectId: selectedProject,
            taskId: selectedTaskId || undefined,
            taskName: task ? task.name : undefined,
            start, // Pass Date objects, caller handles Timestamp conversion if needed or we do it here
            end,
            startTime: Timestamp.fromDate(start),
            endTime: Timestamp.fromDate(end),
            duration,
            description
        };

        await onSave(logData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth dir="rtl">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="div" variant="h6" fontWeight="bold">
                    {log ? 'ערוך דיווח שעות' : 'הוספת זמן ידנית'}
                </Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>פרויקט</InputLabel>
                        <Select
                            value={selectedProject}
                            label="פרויקט"
                            onChange={(e) => {
                                setSelectedProject(e.target.value);
                                setSelectedTaskId(''); // Reset task on project change
                            }}
                        >
                            {projects.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>משימה</InputLabel>
                        <Select
                            value={selectedTaskId}
                            label="משימה"
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            disabled={!selectedProject || loadingTasks}
                        >
                            <MenuItem value=""><em>ללא</em></MenuItem>
                            {tasks.map((t) => (
                                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="תיאור"
                        size="small"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                    <TextField
                        type="date"
                        label="תאריך"
                        size="small"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            type="time"
                            label="התחלה"
                            size="small"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="time"
                            label="סיום"
                            size="small"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>ביטול</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!selectedProject}>
                    שמור
                </Button>
            </DialogActions>
        </Dialog>
    );
}
