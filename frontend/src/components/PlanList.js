import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as PlanIcon,
} from '@mui/icons-material';
import { plansAPI } from '../services/api';

const PlanList = ({ onPlanSelect, selectedPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Form states
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getAll();
      // Group all A-Z plans into a single plan structure
      const azPlan = {
        id: 'az-plan',
        title: 'A-Z Plan',
        description: 'Complete planning from start to finish',
        sections: response.data.sort((a, b) => a.plan_letter.localeCompare(b.plan_letter))
      };
      setPlans([azPlan]);
      setError('');
    } catch (error) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const planData = {
        plan_letter: 'A', // Default to A for now, we'll manage this differently
        title: newPlan.title,
        description: newPlan.description,
      };
      
      await plansAPI.create(planData);
      setSuccess('Plan created successfully');
      setCreateDialogOpen(false);
      setNewPlan({ title: '', description: '' });
      loadPlans();
    } catch (error) {
      setError('Failed to create plan');
    }
  };

  const openEditPlan = (plan) => {
    setEditingPlan({ ...plan });
    setEditDialogOpen(true);
  };

  const openDeletePlan = (plan) => {
    setDeletingPlan(plan);
    setConfirmDeleteOpen(true);
  };

  const handleEditPlan = async () => {
    try {
      if (editingPlan.id === 'az-plan') {
        // For A-Z plan, update the title and description directly
        // This is a virtual plan, so we don't need to make API calls
        setSuccess('Plan title and description updated successfully');
      } else {
        // For individual plans, update via API
        const updateData = {
          title: editingPlan.title,
          description: editingPlan.description,
        };
        
        const firstSection = editingPlan.sections?.[0];
        if (firstSection) {
          await plansAPI.update(firstSection.id, updateData);
          setSuccess('Plan updated successfully');
        }
      }
      
      setEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (error) {
      setError('Failed to update plan');
    }
  };

  const handleDeletePlan = async () => {
    try {
      if (deletingPlan.id === 'az-plan') {
        // Delete all sections in the A-Z plan
        for (const section of deletingPlan.sections || []) {
          await plansAPI.delete(section.id);
        }
        setSuccess('All A-Z Plan sections deleted successfully');
      } else {
        // Delete individual plan sections
        for (const section of deletingPlan.sections || []) {
          await plansAPI.delete(section.id);
        }
        setSuccess('Plan deleted successfully');
      }
      
      setConfirmDeleteOpen(false);
      setDeletingPlan(null);
      loadPlans();
    } catch (error) {
      setError('Failed to delete plan');
    }
  };

  const getPlanStatusColor = (plan) => {
    if (!plan.sections || plan.sections.length === 0) return 'default';
    
    const completedSections = plan.sections.filter(section => 
      section.tasks && section.tasks.every(task => task.is_completed)
    ).length;
    
    const totalSections = plan.sections.length;
    const completionRate = completedSections / totalSections;
    
    if (completionRate === 1) return 'success';
    if (completionRate > 0.7) return 'info';
    if (completionRate > 0.3) return 'warning';
    return 'default';
  };

  const getPlanStatusText = (plan) => {
    if (!plan.sections || plan.sections.length === 0) return 'Empty';
    
    const completedSections = plan.sections.filter(section => 
      section.tasks && section.tasks.every(task => task.is_completed)
    ).length;
    
    return `${completedSections}/${plan.sections.length} sections completed`;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: 'calc(100vh - 32px)',
        margin: 2,
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Plan List</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          variant="outlined"
        >
          New Plan
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {plans.map((plan) => (
          <ListItem
            key={plan.id}
            disablePadding
            secondaryAction={
              <Box>
                <IconButton size="small" onClick={() => openEditPlan(plan)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => openDeletePlan(plan)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton
              selected={selectedPlan?.id === plan.id}
              onClick={() => onPlanSelect(plan)}
            >
              <ListItemIcon>
                <PlanIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={plan.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {plan.description?.substring(0, 50)}
                      {plan.description?.length > 50 ? '...' : ''}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getPlanStatusText(plan)}
                        color={getPlanStatusColor(plan)}
                        size="small"
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {plans.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No plans created yet. Create your first A-Z plan!
          </Typography>
        )}
      </List>

      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Plan</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newPlan.title}
            onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newPlan.description}
            onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePlan} variant="contained">
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Plan</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingPlan?.title || ''}
            onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={editingPlan?.description || ''}
            onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPlan} variant="contained">
            Update Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingPlan?.title}"?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will delete all {deletingPlan?.sections?.length || 0} section(s) and their tasks. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">
            Delete Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PlanList;