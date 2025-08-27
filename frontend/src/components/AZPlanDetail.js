import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Chip,
  Alert,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { tasksAPI, plansAPI, projectsAPI } from '../services/api';
import dayjs from 'dayjs';

const AZPlanDetail = ({ plan: project, onPlanUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [expandedSections, setExpandedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [sectionSelectionOpen, setSectionSelectionOpen] = useState(false);
  const [deleteSectionOpen, setDeleteSectionOpen] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    cost: 0,
    revenue: 0,
    support_target: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [newSection, setNewSection] = useState({
    plan_letter: '',
    title: '',
    description: '',
  });
  const [selectedSectionsToCreate, setSelectedSectionsToCreate] = useState([]);
  const [deletingSection, setDeletingSection] = useState(null);

  useEffect(() => {
    if (project && project.id) {
      loadPlansWithTasks();
    }
  }, [project]);

  const loadPlansWithTasks = async () => {
    try {
      setLoading(true);
      const plansResponse = await plansAPI.getAll(project.id);
      const plansWithTasks = [];
      
      for (const plan of plansResponse.data) {
        try {
          const tasksResponse = await tasksAPI.getAll(plan.id);
          plansWithTasks.push({
            ...plan,
            tasks: tasksResponse.data
          });
        } catch (error) {
          // If no tasks found, just add empty tasks array
          plansWithTasks.push({
            ...plan,
            tasks: []
          });
        }
      }
      
      setPlans(plansWithTasks.sort((a, b) => a.plan_letter.localeCompare(b.plan_letter)));
      setError('');
    } catch (error) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleCreateTask = async () => {
    if (!selectedSectionId) return;
    
    try {
      const taskData = {
        ...newTask,
        order: plans.find(p => p.id === selectedSectionId)?.tasks?.length + 1 || 1,
      };
      
      await tasksAPI.create(selectedSectionId, taskData);
      setSuccess('Task created successfully');
      setCreateTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        cost: 0,
        revenue: 0,
        support_target: '',
      });
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleToggleComplete = async (sectionId, task) => {
    try {
      await tasksAPI.update(task.id, { is_completed: !task.is_completed });
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const handleGenerateFromZ = async () => {
    const planZ = plans.find(p => p.plan_letter === 'Z');
    if (!planZ || !planZ.description) {
      setError('Plan Z must have content for AI generation');
      return;
    }

    try {
      setLoading(true);
      await plansAPI.generateFromZ();
      setSuccess('Plans B-Y generated from Plan Z successfully!');
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to generate plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreateTask = (sectionId) => {
    setSelectedSectionId(sectionId);
    setCreateTaskOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setEditTaskOpen(true);
  };

  const openDeleteTask = (task) => {
    setDeletingTask(task);
    setDeleteTaskOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    
    try {
      await tasksAPI.delete(deletingTask.id);
      setSuccess('Task deleted successfully');
      setDeleteTaskOpen(false);
      setDeletingTask(null);
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    
    try {
      const updateData = {
        title: editingTask.title,
        description: editingTask.description,
        order: editingTask.order,
        cost: editingTask.cost,
        revenue: editingTask.revenue,
        support_target: editingTask.support_target,
      };
      
      await tasksAPI.update(editingTask.id, updateData);
      setSuccess('Task updated successfully');
      setEditTaskOpen(false);
      setEditingTask(null);
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const openDeleteSection = (section) => {
    setDeletingSection(section);
    setDeleteSectionOpen(true);
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    
    try {
      await plansAPI.delete(project.id, deletingSection.id);
      setSuccess('Plan deleted successfully');
      setDeleteSectionOpen(false);
      setDeletingSection(null);
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to delete plan');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlanProgress = (plan) => {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completed = plan.tasks.filter(task => task.is_completed).length;
    return Math.round((completed / plan.tasks.length) * 100);
  };

  const planZ = plans.find(p => p.plan_letter === 'Z');
  const hasValidPlanZ = planZ && planZ.description && planZ.description.trim().length > 0;

  // Get missing plans A-Z
  const getMissingPlans = () => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const existingLetters = plans.map(p => p.plan_letter);
    return allLetters.filter(letter => !existingLetters.includes(letter));
  };

  const handleOpenPlanSelection = () => {
    const missingLetters = getMissingPlans();
    if (missingLetters.length === 0) {
      setSuccess('All plans A-Z already exist!');
      return;
    }
    setSectionSelectionOpen(true);
    setSelectedSectionsToCreate([]);
  };

  const handleTogglePlanSelection = (letter) => {
    setSelectedSectionsToCreate(prev => 
      prev.includes(letter)
        ? prev.filter(l => l !== letter)
        : [...prev, letter]
    );
  };

  const handleCreateSelectedPlans = async () => {
    if (selectedSectionsToCreate.length === 0) {
      setError('Please select at least one plan to create');
      return;
    }

    try {
      setLoading(true);
      const createdPlans = [];
      
      for (const letter of selectedSectionsToCreate) {
        const planData = {
          plan_letter: letter,
          title: `Plan ${letter}`,
          description: letter === 'A' 
            ? 'The most detailed and best form with low cost - your starting point' 
            : letter === 'Z' 
            ? 'Almost giving up option - your fallback plan' 
            : `Step ${letter} in your A-Z planning sequence.`,
        };
        
        const response = await plansAPI.create(project.id, planData);
        createdPlans.push(response.data);
      }

      setSuccess(`Created ${createdPlans.length} plan(s) successfully!`);
      setSectionSelectionOpen(false);
      setSelectedSectionsToCreate([]);
      loadPlansWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to create plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Plan Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {project?.title || 'Project'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenPlanSelection}
              variant="outlined"
              disabled={loading || getMissingPlans().length === 0}
              size="small"
            >
              + Create Plans ({getMissingPlans().length})
            </Button>
            
            {hasValidPlanZ && (
              <Button
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGenerateFromZ}
                variant="contained"
                disabled={loading}
                size="small"
              >
                Generate B-Y from Z
              </Button>
            )}
          </Box>
        </Box>
        
        {project?.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {project.description}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* A-Z Plans */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {plans.map((section) => (
          <Accordion
            key={section.id}
            expanded={expandedSections.includes(section.id)}
            onChange={() => handleSectionToggle(section.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: section.plan_letter === 'A' ? 'action.hover' : 
                                 section.plan_letter === 'Z' ? 'primary.light' : 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Typography variant="h6" sx={{ minWidth: '2rem' }}>
                  {section.plan_letter}
                </Typography>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {section.title}
                </Typography>
                <Chip
                  label={`${getPlanProgress(section)}%`}
                  color={getPlanProgress(section) === 100 ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={`${section.tasks?.filter(t => t.is_completed).length || 0}/${section.tasks?.length || 0} tasks`}
                  variant="outlined"
                  size="small"
                />
                {section.plan_letter !== 'A' && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteSection(section);
                    }}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              {section.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {section.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Tasks</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => openCreateTask(section.id)}
                  variant="outlined"
                >
                  Add Task
                </Button>
              </Box>

              <List dense>
                {section.tasks && section.tasks
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <ListItem
                      key={task.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: task.is_completed ? 'action.hover' : 'background.paper',
                      }}
                    >
                      <ListItemIcon>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleComplete(section.id, task)}
                          color={task.is_completed ? 'success' : 'default'}
                        >
                          {task.is_completed ? <CheckIcon /> : <UncheckIcon />}
                        </IconButton>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                textDecoration: task.is_completed ? 'line-through' : 'none',
                                opacity: task.is_completed ? 0.7 : 1,
                              }}
                            >
                              {task.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              {task.cost > 0 && (
                                <Chip
                                  label={`Cost: ${formatCurrency(task.cost)}`}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              )}
                              {task.revenue > 0 && (
                                <Chip
                                  label={`Revenue: ${formatCurrency(task.revenue)}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              {task.support_target && (
                                <Chip
                                  label={`Target: ${task.support_target}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => openEditTask(task)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDeleteTask(task)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>

              {(!section.tasks || section.tasks.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    No tasks in this section yet. Add tasks to get started!
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={newTask.cost}
            onChange={(e) => setNewTask({ ...newTask, cost: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Revenue"
            type="number"
            value={newTask.revenue}
            onChange={(e) => setNewTask({ ...newTask, revenue: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Support Target"
            value={newTask.support_target}
            onChange={(e) => setNewTask({ ...newTask, support_target: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingTask?.title || ''}
            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={editingTask?.description || ''}
            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={editingTask?.order || 0}
            onChange={(e) => setEditingTask({ ...editingTask, order: parseInt(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={editingTask?.cost || 0}
            onChange={(e) => setEditingTask({ ...editingTask, cost: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Revenue"
            type="number"
            value={editingTask?.revenue || 0}
            onChange={(e) => setEditingTask({ ...editingTask, revenue: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Support Target"
            value={editingTask?.support_target || ''}
            onChange={(e) => setEditingTask({ ...editingTask, support_target: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleEditTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingTask?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Section Confirmation Dialog */}
      <Dialog open={deleteSectionOpen} onClose={() => setDeleteSectionOpen(false)}>
        <DialogTitle>Delete Section {deletingSection?.plan_letter}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "Plan {deletingSection?.plan_letter}: {deletingSection?.title}"?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will also delete all {deletingSection?.tasks?.length || 0} task(s) in this section. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSectionOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSection} color="error" variant="contained">
            Delete Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section Selection Dialog */}
      <Dialog 
        open={sectionSelectionOpen} 
        onClose={() => setSectionSelectionOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Select Sections to Create</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose which plans (A-Z) you want to add to your project:
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: 1, 
            mt: 2 
          }}>
            {getMissingPlans().map((letter) => (
              <Box
                key={letter}
                onClick={() => handleTogglePlanSelection(letter)}
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: selectedSectionsToCreate.includes(letter) ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: selectedSectionsToCreate.includes(letter) ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {letter}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Plan {letter}
                </Typography>
                {selectedSectionsToCreate.includes(letter) && (
                  <CheckIcon 
                    color="primary" 
                    sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4,
                      fontSize: 16 
                    }} 
                  />
                )}
              </Box>
            ))}
          </Box>

          {selectedSectionsToCreate.length > 0 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="primary">
                Selected: {selectedSectionsToCreate.join(', ')} ({selectedSectionsToCreate.length} section{selectedSectionsToCreate.length !== 1 ? 's' : ''})
              </Typography>
            </Box>
          )}

          {getMissingPlans().length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              All plans A-Z already exist in your project!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionSelectionOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSelectedPlans} 
            variant="contained"
            disabled={selectedSectionsToCreate.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            Create {selectedSectionsToCreate.length > 0 ? `${selectedSectionsToCreate.length} ` : ''}Plan{selectedSectionsToCreate.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AZPlanDetail;