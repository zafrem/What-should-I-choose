import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Fab,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { plansAPI } from '../services/api';
import PlanDetail from './PlanDetail';
import dayjs from 'dayjs';

const MainContent = ({ onPlanSelect, selectedPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Form states
  const [newPlan, setNewPlan] = useState({
    plan_letter: '',
    title: '',
    description: '',
    start_date: null,
    end_date: null,
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await plansAPI.getAll();
      setPlans(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLetters = () => {
    const allLetters = 'BCDEFGHIJKLMNOPQRSTUVWXY'.split('');
    const usedLetters = plans.map(plan => plan.plan_letter);
    return allLetters.filter(letter => !usedLetters.includes(letter));
  };

  const handleCreatePlan = async () => {
    try {
      const planData = {
        ...newPlan,
        start_date: newPlan.start_date ? newPlan.start_date.toISOString() : null,
        end_date: newPlan.end_date ? newPlan.end_date.toISOString() : null,
      };
      
      await plansAPI.create(planData);
      setSuccess('Plan created successfully');
      setCreateDialogOpen(false);
      setNewPlan({
        plan_letter: '',
        title: '',
        description: '',
        start_date: null,
        end_date: null,
      });
      loadPlans();
    } catch (error) {
      setError('Failed to create plan');
    }
  };

  const handleEditPlan = async () => {
    try {
      const planData = {
        title: editingPlan.title,
        description: editingPlan.description,
        start_date: editingPlan.start_date ? dayjs(editingPlan.start_date).toISOString() : null,
        end_date: editingPlan.end_date ? dayjs(editingPlan.end_date).toISOString() : null,
      };
      
      await plansAPI.update(editingPlan.id, planData);
      setSuccess('Plan updated successfully');
      setEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (error) {
      setError('Failed to update plan');
    }
  };

  const handleDeletePlan = async () => {
    try {
      await plansAPI.delete(deletingPlan.id);
      setSuccess('Plan deleted successfully');
      setConfirmDeleteOpen(false);
      setDeletingPlan(null);
      if (selectedPlan && selectedPlan.id === deletingPlan.id) {
        onPlanSelect(null);
      }
      loadPlans();
    } catch (error) {
      setError('Failed to delete plan');
    }
  };

  const handleGenerateFromZ = async () => {
    try {
      setLoading(true);
      await plansAPI.generateFromZ();
      setSuccess('Plans generated from Plan Z successfully!');
      loadPlans();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to generate plans');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (plan) => {
    setEditingPlan({
      ...plan,
      start_date: plan.start_date ? dayjs(plan.start_date) : null,
      end_date: plan.end_date ? dayjs(plan.end_date) : null,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (plan) => {
    setDeletingPlan(plan);
    setConfirmDeleteOpen(true);
  };

  const getPlanStatusColor = (plan) => {
    const now = dayjs();
    const startDate = plan.start_date ? dayjs(plan.start_date) : null;
    const endDate = plan.end_date ? dayjs(plan.end_date) : null;
    
    if (!startDate || !endDate) return 'default';
    
    if (now.isBefore(startDate)) return 'info'; // Not started
    if (now.isAfter(endDate)) return 'error'; // Overdue
    if (now.isBetween(startDate, endDate)) return 'success'; // In progress
    
    return 'default';
  };

  const getPlanStatusText = (plan) => {
    const now = dayjs();
    const startDate = plan.start_date ? dayjs(plan.start_date) : null;
    const endDate = plan.end_date ? dayjs(plan.end_date) : null;
    
    if (!startDate || !endDate) return 'No schedule';
    
    if (now.isBefore(startDate)) return 'Scheduled';
    if (now.isAfter(endDate)) return 'Overdue';
    if (now.isBetween(startDate, endDate)) return 'Active';
    
    return 'Unknown';
  };

  const planZ = plans.find(p => p.plan_letter === 'Z');
  const hasValidPlanZ = planZ && planZ.description && planZ.description.trim().length > 0;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 32px)', margin: 2, gap: 2 }}>
      {/* Plans List */}
      <Paper
        elevation={2}
        sx={{
          minWidth: 350,
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          padding: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Plans</Typography>
          <Box>
            {hasValidPlanZ && (
              <Button
                size="small"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerateFromZ}
                sx={{ mr: 1 }}
                variant="outlined"
                disabled={loading}
              >
                Generate B-Y
              </Button>
            )}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              variant="contained"
            >
              Add Plan
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {plans
            .sort((a, b) => a.plan_letter.localeCompare(b.plan_letter))
            .map((plan) => (
              <ListItem
                key={plan.id}
                disablePadding
                secondaryAction={
                  plan.plan_letter !== 'A' && (
                    <Box>
                      <IconButton size="small" onClick={() => openEditDialog(plan)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => openDeleteDialog(plan)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton size="small">
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemButton
                  selected={selectedPlan?.id === plan.id}
                  onClick={() => onPlanSelect(plan)}
                >
                  <ListItemIcon>
                    <Typography variant="h6" color="primary">
                      {plan.plan_letter}
                    </Typography>
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
                          <Chip
                            label={`${plan.completed_task_count || 0}/${plan.task_count || 0} tasks`}
                            size="small"
                            sx={{ ml: 1 }}
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
              No plans created yet. Start by adding Plan Z (your goal)!
            </Typography>
          )}
        </List>

        {/* Add Plan Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {getAvailableLetters().concat(['Z']).map((letter) => (
            <MenuItem
              key={letter}
              onClick={() => {
                setNewPlan({ ...newPlan, plan_letter: letter });
                setCreateDialogOpen(true);
                setAnchorEl(null);
              }}
            >
              Plan {letter}
              {letter === 'Z' && ' (Goal)'}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      {/* Plan Detail */}
      <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedPlan ? (
          <PlanDetail plan={selectedPlan} onPlanUpdate={loadPlans} />
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
            <Typography variant="h6" gutterBottom>
              Select a plan to view details
            </Typography>
            <Typography variant="body2">
              Choose a plan from the list to see its tasks and manage content
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Plan {newPlan.plan_letter}</DialogTitle>
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
          <DateTimePicker
            label="Start Date"
            value={newPlan.start_date}
            onChange={(date) => setNewPlan({ ...newPlan, start_date: date })}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <DateTimePicker
            label="End Date"
            value={newPlan.end_date}
            onChange={(date) => setNewPlan({ ...newPlan, end_date: date })}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
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
        <DialogTitle>Edit Plan {editingPlan?.plan_letter}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingPlan?.title || ''}
            onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
            margin="normal"
            required
            disabled={editingPlan?.plan_letter === 'A'}
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
          <DateTimePicker
            label="Start Date"
            value={editingPlan?.start_date}
            onChange={(date) => setEditingPlan({ ...editingPlan, start_date: date })}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <DateTimePicker
            label="End Date"
            value={editingPlan?.end_date}
            onChange={(date) => setEditingPlan({ ...editingPlan, end_date: date })}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPlan} variant="contained">
            Update Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete Plan {deletingPlan?.plan_letter}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingPlan?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainContent;