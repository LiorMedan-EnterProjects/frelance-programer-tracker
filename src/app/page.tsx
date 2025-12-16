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
import { useAuth } from "@/context/AuthContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Footer from "@/components/Footer";

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
            background: (theme) => theme.palette.mode === 'light'
              ? 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)'
              : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  background: (theme) => theme.palette.mode === 'light'
                    ? '-webkit-linear-gradient(45deg, #2563eb 30%, #ec4899 90%)'
                    : '-webkit-linear-gradient(45deg, #60a5fa 30%, #f472b6 90%)',
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  pb: 1, // Padding for g letters
                }}
              >
                Track Time. Manage Projects. <br /> Get Paid.
              </Typography>
              <Typography variant="h5" color="text.secondary" maxWidth="md">
                The ultimate tool for freelance developers to streamline their workflow,
                track billable hours, and maximize productivity.
              </Typography>
              <Stack direction="row" spacing={2} pt={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  Learn More
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Typography variant="h2" align="center" mb={8}>
              Everything you need to succeed
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '50%', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <CardContent>
                      <Typography variant="h5" component="h3" gutterBottom fontWeight="600">
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
