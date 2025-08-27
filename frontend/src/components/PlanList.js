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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as PlanIcon,
  ExpandMore as ExpandMoreIcon,
  Work as ProjectIcon,
} from '@mui/icons-material';
import { projectsAPI, plansAPI } from '../services/api';

const ProjectList = ({ onPlanSelect, selectedPlan }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState(['project']); // Project section expanded by default
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
  });
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data.sort((a, b) => a.id - b.id));
      setError('');
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const projectData = {
        title: newProject.title,
        description: newProject.description,
      };
      
      const response = await projectsAPI.create(projectData);
      setSuccess(`Project "${response.data.title}" created successfully`);
      setCreateDialogOpen(false);
      setNewProject({ title: '', description: '' });
      loadProjects();
    } catch (error) {
      setError('Failed to create project');
    }
  };

  const openEditProject = (project) => {
    setEditingProject({ ...project });
    setEditDialogOpen(true);
  };

  const openDeleteProject = (project) => {
    setDeletingProject(project);
    setConfirmDeleteOpen(true);
  };

  const handleEditProject = async () => {
    try {
      const updateData = {
        title: editingProject.title,
        description: editingProject.description,
      };
      
      await projectsAPI.update(editingProject.id, updateData);
      setSuccess(`Project "${editingProject.title}" updated successfully`);
      
      setEditDialogOpen(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      setError('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(deletingProject.id);
      setSuccess(`Project "${deletingProject.title}" deleted successfully`);
      setConfirmDeleteOpen(false);
      setDeletingProject(null);
      loadProjects();
    } catch (error) {
      setError('Failed to delete project');
      setConfirmDeleteOpen(false);
      setDeletingProject(null);
    }
  };

  const getProjectStatusColor = () => {
    return 'primary';
  };

  const getProjectStatusText = (project) => {
    return `${new Date(project.created_at).toLocaleDateString()}`;
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
        <Typography variant="h6">Project Management</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          variant="outlined"
        >
          New Project
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Project Section with A-Z Plans */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Accordion 
          expanded={expandedSections.includes('project')}
          onChange={() => handleSectionToggle('project')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ProjectIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Project
              </Typography>
              <Chip 
                label={`${projects.length} projects`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ pt: 0 }}>
            <List dense>
              {loading ? (
                <ListItem>
                  <ListItemText 
                    primary="Loading projects..."
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      color: 'text.secondary',
                      align: 'center'
                    }}
                  />
                </ListItem>
              ) : projects.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No projects created yet. Create your first project with A-Z plans!"
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      color: 'text.secondary',
                      align: 'center'
                    }}
                  />
                </ListItem>
              ) : (
                projects.map((project) => (
                  <ListItem
                    key={project.id}
                    disablePadding
                    secondaryAction={
                      <Box>
                        <IconButton size="small" onClick={() => openEditProject(project)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDeleteProject(project)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemButton
                      selected={selectedPlan?.id === project.id}
                      onClick={() => onPlanSelect(project)}
                      sx={{ py: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          📁
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${project.title}`}
                        secondary={
                          <React.Fragment>
                            <span>
                              {project.description?.substring(0, 40)}
                              {project.description?.length > 40 ? '...' : ''}
                            </span>
                            <br />
                            <Chip
                              label={getProjectStatusText(project)}
                              color={getProjectStatusColor()}
                              size="small"
                              sx={{ mt: 0.5, height: 16, fontSize: '0.65rem' }}
                            />
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{ component: 'div', variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingProject?.title || ''}
            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={editingProject?.description || ''}
            onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">
            Update Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog 
        open={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        disableEnforceFocus
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Project "{deletingProject?.title}"?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            This will delete the project and all its plans. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProjectList;