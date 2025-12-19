"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Footer from "@/frontend/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const features = [
    {
      title: "Project Management",
      description: "Organize your freelance projects, clients, and deadlines in one place.",
      icon: <CheckCircleIcon fontSize="large" color="primary" />,
    },
    {
      title: "Time Tracking",
      description: "Track billable hours with precision using our built-in timer.",
      icon: <AccessTimeIcon fontSize="large" color="primary" />,
    },
    {
      title: "Earnings Analytics",
      description: "Visualize your income and understand your most profitable work.",
      icon: <MonetizationOnIcon fontSize="large" color="primary" />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)'
              : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: (theme) => theme.palette.mode === 'light' ? 'primary.main' : '#60A5FA',
                  pb: 2,
                }}
              >
                עקוב אחרי הזמן. נהל פרויקטים. <br />
                <Box component="span" sx={{ color: 'text.primary' }}>קבל תשלום.</Box>
              </Typography>
              <Typography variant="h5" color="text.secondary" maxWidth="md" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1.6 }}>
                הכלי האולטימטיבי למפתחים פרילנסרים לייעול זרימת העבודה, מעקב אחר שעות לחיוב ומקסום הפרודוקטיביות.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={4}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{ px: 5, py: 1.5, fontSize: '1.2rem', borderRadius: 2 }}
                >
                  התחל עכשיו
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/#features"
                  sx={{ px: 5, py: 1.5, fontSize: '1.2rem', borderRadius: 2 }}
                >
                  למד עוד
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography variant="h2" align="center" mb={8} fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              כל מה שצריך בשביל להצליח
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    bgcolor: 'background.default',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: '50%', mb: 3, color: 'white' }}>
                    <CheckCircleIcon fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="700" mb={2}>
                      ניהול פרויקטים
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                      ארגן את הפרויקטים, הלקוחות והדדליינים במקום אחד.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    bgcolor: 'background.default',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: '50%', mb: 3, color: 'white' }}>
                    <AccessTimeIcon fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="700" mb={2}>
                      מעקב שעות
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                      עקוב אחר שעות לחיוב בדיוק רב עם הטיימר המובנה שלנו.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    bgcolor: 'background.default',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: '50%', mb: 3, color: 'white' }}>
                    <MonetizationOnIcon fontSize="large" />
                  </Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="700" mb={2}>
                      ניתוח רווחים
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                      הצג את ההכנסות שלך והבן אילו פרויקטים הם הרווחיים ביותר.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
