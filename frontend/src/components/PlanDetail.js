import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
} from '@mui/icons-material';
import { tasksAPI } from '../services/api';
import dayjs from 'dayjs';

const PlanDetail = ({ plan, onPlanUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    order: 0,
    cost: 0,
    revenue: 0,
    support_target: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    if (plan) {
      loadTasks();
    }
  }, [plan]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(plan.id);
      setTasks(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...newTask,
        order: tasks.length + 1,
      };
      
      await tasksAPI.create(plan.id, taskData);
      setSuccess('Task created successfully');
      setCreateTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        order: 0,
        cost: 0,
        revenue: 0,
        support_target: '',
      });
      loadTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleEditTask = async () => {
    try {
      await tasksAPI.update(editingTask.id, editingTask);
      setSuccess('Task updated successfully');
      setEditTaskOpen(false);
      setEditingTask(null);
      loadTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await tasksAPI.delete(deletingTask.id);
      setSuccess('Task deleted successfully');
      setDeleteTaskOpen(false);
      setDeletingTask(null);
      loadTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await tasksAPI.update(task.id, { is_completed: !task.is_completed });
      loadTasks();
      onPlanUpdate();
    } catch (error) {
      setError('Failed to update task status');
    }
  };

  const openEditTask = (task) => {
    setEditingTask({ ...task });
    setEditTaskOpen(true);
  };

  const openDeleteTask = (task) => {
    setDeletingTask(task);
    setDeleteTaskOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Plan Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Plan {plan.plan_letter}: {plan.title}
        </Typography>
        
        {plan.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {plan.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {plan.start_date && (
            <Chip
              label={`Start: ${dayjs(plan.start_date).format('MMM DD, YYYY')}`}
              color="info"
              variant="outlined"
            />
          )}
          {plan.end_date && (
            <Chip
              label={`End: ${dayjs(plan.end_date).format('MMM DD, YYYY')}`}
              color="info"
              variant="outlined"
            />
          )}
          <Chip
            label={`${plan.completed_task_count || 0}/${plan.task_count || 0} tasks completed`}
            color="success"
          />
          {plan.total_cost > 0 && (
            <Chip
              label={`Cost: ${formatCurrency(plan.total_cost)}`}
              color="error"
              variant="outlined"
            />
          )}
          {plan.total_revenue > 0 && (
            <Chip
              label={`Revenue: ${formatCurrency(plan.total_revenue)}`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Divider />

      {/* Tasks Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
        <Typography variant="h6">Tasks</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setCreateTaskOpen(true)}
          variant="contained"
          size="small"
        >
          Add Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Tasks List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {tasks
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
                    onClick={() => handleToggleComplete(task)}
                    color={task.is_completed ? 'success' : 'default'}
                  >
                    {task.is_completed ? <CheckIcon /> : <UncheckIcon />}
                  </IconButton>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          opacity: task.is_completed ? 0.7 : 1,
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip label={`#${task.order}`} size="small" />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {task.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  <IconButton size="small" onClick={() => openDeleteTask(task)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>

        {tasks.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add tasks to break down this plan into actionable steps
            </Typography>
          </Box>
        )}
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

      {/* Delete Task Dialog */}
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
    </Box>
  );
};

export default PlanDetail;