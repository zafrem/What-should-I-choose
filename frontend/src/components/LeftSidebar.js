import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiTokensAPI } from '../services/api';

const LeftSidebar = () => {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiTokens, setApiTokens] = useState([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (settingsOpen) {
      loadApiTokens();
    }
  }, [settingsOpen]);

  const loadApiTokens = async () => {
    try {
      const response = await apiTokensAPI.getAll();
      setApiTokens(response.data);
    } catch (error) {
      setError('Failed to load API tokens');
    }
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      setError('Token name is required');
      return;
    }

    try {
      await apiTokensAPI.create({ name: newTokenName });
      setNewTokenName('');
      setSuccess('API token created successfully');
      loadApiTokens();
    } catch (error) {
      setError('Failed to create API token');
    }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      await apiTokensAPI.delete(tokenId);
      setSuccess('API token deleted');
      loadApiTokens();
    } catch (error) {
      setError('Failed to delete API token');
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: 'calc(100vh - 32px)',
        margin: '16px 0 16px 16px',
        padding: isCollapsed ? 1 : 2,
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? 60 : 320,
        minWidth: isCollapsed ? 60 : 280,
        maxWidth: isCollapsed ? 60 : 320,
        transition: 'width 0.3s ease-in-out',
        position: 'relative',
        backgroundColor: '#ffcdd2',
        border: '1px solid #e57373',
      }}
    >
      {/* Collapse/Expand Button */}
      <Box sx={{ 
        position: 'absolute', 
        right: -12, 
        top: '50%', 
        transform: 'translateY(-50%)',
        zIndex: 1000 
      }}>
        <Tooltip title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
          <IconButton
            onClick={handleToggleCollapse}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              width: 24,
              height: 24,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            size="small"
          >
            {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          {/* User Info Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{ width: 64, height: 64, mb: 1, bgcolor: 'primary.main' }}
        >
          {user?.username?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {user?.email}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            size="small"
            startIcon={<LogoutIcon />}
            onClick={logout}
            color="error"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Current Info Section */}
      <Box sx={{ my: 1, flex: 0.5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Current Status
        </Typography>
        <List dense sx={{ py: 0 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Active Plans"
              secondary="Plans with tasks in progress"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Completion Rate"
              secondary="Overall progress tracking"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Next Deadline"
              secondary="Upcoming plan deadlines"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Quick Reference Section */}
      <Box sx={{ my: 1, flex: 0.5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Quick Reference
        </Typography>
        <List dense sx={{ py: 0 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Plans B-Y"
              secondary="Intermediate steps (editable)"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Plan Z"
              secondary="Your ultimate goal"
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Box>
        </>
      )}

      {/* Collapsed State - Minimal Icons */}
      {isCollapsed && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          pt: 2, 
          gap: 2 
        }}>
          <Tooltip title={`${user?.username} (${user?.email})`} placement="right">
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '14px' }}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Tooltip>
          
          <Tooltip title="Settings" placement="right">
            <IconButton 
              sx={{ p: 1 }} 
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Logout" placement="right">
            <IconButton 
              sx={{ p: 1 }} 
              onClick={logout}
              color="error"
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            API Tokens
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create API tokens to access the A-Z Plan API programmatically.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Token Name"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="My API Token"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateToken}
            >
              Create
            </Button>
          </Box>

          <List>
            {apiTokens.map((token) => (
              <ListItem
                key={token.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteToken(token.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={token.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        label={token.is_active ? 'Active' : 'Inactive'}
                        color={token.is_active ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(token.created_at).toLocaleDateString()}
                      </Typography>
                      {token.last_used_at && (
                        <Typography variant="caption" color="text.secondary">
                          Last used: {new Date(token.last_used_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          {apiTokens.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
              No API tokens created yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LeftSidebar;