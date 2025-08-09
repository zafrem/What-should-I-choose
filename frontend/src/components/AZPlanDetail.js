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
import { tasksAPI, plansAPI } from '../services/api';
import dayjs from 'dayjs';

const AZPlanDetail = ({ plan, onPlanUpdate }) => {
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState(['A']);
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
    if (plan && plan.sections) {
      loadSectionsWithTasks();
    }
  }, [plan]);

  const loadSectionsWithTasks = async () => {
    try {
      setLoading(true);
      const sectionsWithTasks = [];
      
      for (const section of plan.sections) {
        try {
          const tasksResponse = await tasksAPI.getAll(section.id);
          sectionsWithTasks.push({
            ...section,
            tasks: tasksResponse.data
          });
        } catch (error) {
          // If no tasks found, just add empty tasks array
          sectionsWithTasks.push({
            ...section,
            tasks: []
          });
        }
      }
      
      setSections(sectionsWithTasks);
      setError('');
    } catch (error) {
      setError('Failed to load section details');
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
        order: sections.find(s => s.id === selectedSectionId)?.tasks?.length + 1 || 1,
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
      loadSectionsWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleToggleComplete = async (sectionId, task) => {
    try {
      await tasksAPI.update(task.id, { is_completed: !task.is_completed });
      loadSectionsWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const handleGenerateFromZ = async () => {
    const sectionZ = sections.find(s => s.plan_letter === 'Z');
    if (!sectionZ || !sectionZ.description) {
      setError('Plan Z must have content for AI generation');
      return;
    }

    try {
      setLoading(true);
      await plansAPI.generateFromZ();
      setSuccess('Sections B-Y generated from Plan Z successfully!');
      loadSectionsWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to generate sections');
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
      loadSectionsWithTasks();
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
      loadSectionsWithTasks();
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
      await plansAPI.delete(deletingSection.id);
      setSuccess('Section deleted successfully');
      setDeleteSectionOpen(false);
      setDeletingSection(null);
      loadSectionsWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to delete section');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSectionProgress = (section) => {
    if (!section.tasks || section.tasks.length === 0) return 0;
    const completed = section.tasks.filter(task => task.is_completed).length;
    return Math.round((completed / section.tasks.length) * 100);
  };

  const sectionZ = sections.find(s => s.plan_letter === 'Z');
  const hasValidSectionZ = sectionZ && sectionZ.description && sectionZ.description.trim().length > 0;

  // Get missing sections B-Z
  const getMissingSections = () => {
    const allLetters = 'BCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const existingLetters = sections.map(s => s.plan_letter);
    return allLetters.filter(letter => !existingLetters.includes(letter));
  };

  const handleOpenSectionSelection = () => {
    const missingLetters = getMissingSections();
    if (missingLetters.length === 0) {
      setSuccess('All sections B-Z already exist!');
      return;
    }
    setSectionSelectionOpen(true);
    setSelectedSectionsToCreate([]);
  };

  const handleToggleSectionSelection = (letter) => {
    setSelectedSectionsToCreate(prev => 
      prev.includes(letter)
        ? prev.filter(l => l !== letter)
        : [...prev, letter]
    );
  };

  const handleCreateSelectedSections = async () => {
    if (selectedSectionsToCreate.length === 0) {
      setError('Please select at least one section to create');
      return;
    }

    try {
      setLoading(true);
      const createdSections = [];
      
      for (const letter of selectedSectionsToCreate) {
        const sectionData = {
          plan_letter: letter,
          title: `Plan ${letter}`,
          description: `Step ${letter} in your A-Z planning sequence.`,
        };
        
        const response = await plansAPI.create(sectionData);
        createdSections.push(response.data);
      }

      setSuccess(`Created ${createdSections.length} section(s) successfully!`);
      setSectionSelectionOpen(false);
      setSelectedSectionsToCreate([]);
      loadSectionsWithTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to create sections');
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
            {plan?.title || 'A-Z Plan'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenSectionSelection}
              variant="outlined"
              disabled={loading || getMissingSections().length === 0}
              size="small"
            >
              + Plan B-Z ({getMissingSections().length})
            </Button>
            
            {hasValidSectionZ && (
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
        
        {plan?.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {plan.description}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* A-Z Sections */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {sections.map((section) => (
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
                  label={`${getSectionProgress(section)}%`}
                  color={getSectionProgress(section) === 100 ? 'success' : 'default'}
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
            Choose which sections (B-Z) you want to add to your A-Z Plan:
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: 1, 
            mt: 2 
          }}>
            {getMissingSections().map((letter) => (
              <Box
                key={letter}
                onClick={() => handleToggleSectionSelection(letter)}
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

          {getMissingSections().length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              All sections B-Z already exist in your plan!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionSelectionOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSelectedSections} 
            variant="contained"
            disabled={selectedSectionsToCreate.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            Create {selectedSectionsToCreate.length > 0 ? `${selectedSectionsToCreate.length} ` : ''}Section{selectedSectionsToCreate.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AZPlanDetail;