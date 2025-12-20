import RoadmapBoard from "@/frontend/components/roadmap/RoadmapBoard";
import { Box } from "@mui/material";

export default function RoadmapPage() {
    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'hidden' }}>
            <RoadmapBoard />
        </Box>
    );
}
