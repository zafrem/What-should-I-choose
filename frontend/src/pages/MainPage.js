import React, { useState } from 'react';
import { 
  Box, 
  Typography 
} from '@mui/material';
import LeftSidebar from '../components/LeftSidebar';
import ProjectList from '../components/PlanList'; 
import AZPlanDetail from '../components/AZPlanDetail';
import MinimizedSidebar from '../components/MinimizedSidebar';

const MainPage = () => {
  // Main page component for Project-Plan hierarchy
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleCommentAdded = () => {
    // This could trigger a refresh or update if needed
  };

  const handleProjectUpdate = () => {
    // Refresh or update projects when needed
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Left Sidebar - User info, current info, reference info */}
      <LeftSidebar />
      
      {/* Project List - Shows available plans under Project structure */}
      <ProjectList 
        selectedPlan={selectedProject}
        onPlanSelect={handleProjectSelect}
      />
      
      {/* Main Content - A-Z Plan Details */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {selectedProject ? (
          <AZPlanDetail 
            plan={selectedProject}
            onPlanUpdate={handleProjectUpdate}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              color: 'text.secondary',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '4rem', mb: 2 }}>🎯</Box>
              <Typography variant="h5" component="div" gutterBottom>
                Select a Project to Get Started
              </Typography>
              <Typography variant="body2">
                Choose a project from the list to view and manage your A-Z plans
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Right Sidebar - Minimized Statistics and comments */}
      <MinimizedSidebar 
        selectedPlan={selectedProject}
        onCommentAdded={handleCommentAdded}
      />
    </Box>
  );
};

export default MainPage;