import React, { useState } from 'react';
import { Box } from '@mui/material';
import LeftSidebar from '../components/LeftSidebar';
import PlanList from '../components/PlanList';
import AZPlanDetail from '../components/AZPlanDetail';
import MinimizedSidebar from '../components/MinimizedSidebar';

const MainPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCommentAdded = () => {
    // This could trigger a refresh or update if needed
  };

  const handlePlanUpdate = () => {
    // Refresh or update plans when needed
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#ffebee' }}>
      {/* Left Sidebar - User info, current info, reference info */}
      <LeftSidebar />
      
      {/* Plan List - Shows available plans */}
      <PlanList 
        selectedPlan={selectedPlan}
        onPlanSelect={handlePlanSelect}
      />
      
      {/* Main Content - A-Z Plan Details */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {selectedPlan ? (
          <AZPlanDetail 
            plan={selectedPlan}
            onPlanUpdate={handlePlanUpdate}
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
              <Box variant="h5" component="div" gutterBottom>
                Select a Plan to Get Started
              </Box>
              <Box variant="body2">
                Choose a plan from the list to view and manage your A-Z sections
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Right Sidebar - Minimized Statistics and comments */}
      <MinimizedSidebar 
        selectedPlan={selectedPlan}
        onCommentAdded={handleCommentAdded}
      />
    </Box>
  );
};

export default MainPage;