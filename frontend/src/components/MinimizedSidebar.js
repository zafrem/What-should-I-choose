import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Comment as CommentIcon,
  BarChart as StatsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { statisticsAPI, commentsAPI } from '../services/api';

const MinimizedSidebar = ({ selectedPlan, onCommentAdded }) => {
  const [statistics, setStatistics] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      loadComments();
    }
  }, [selectedPlan]);

  const loadStatistics = async () => {
    try {
      const response = await statisticsAPI.get();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadComments = async () => {
    if (!selectedPlan) return;
    
    try {
      const response = await commentsAPI.getAll(selectedPlan.id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPlan) return;
    
    try {
      setLoading(true);
      const firstSection = selectedPlan.sections?.[0];
      if (firstSection) {
        await commentsAPI.create({
          plan_id: firstSection.id,
          content: newComment.trim(),
        });
        setNewComment('');
        loadComments();
        if (onCommentAdded) onCommentAdded();
      }
    } catch (error) {
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCompletionRate = () => {
    if (!statistics || statistics.total_tasks === 0) return 0;
    return Math.round((statistics.completed_tasks / statistics.total_tasks) * 100);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: 'calc(100vh - 32px)',
        margin: '16px 16px 16px 0',
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? 60 : 300,
        minWidth: isCollapsed ? 60 : 280,
        maxWidth: isCollapsed ? 60 : 300,
        transition: 'width 0.3s ease-in-out',
        position: 'relative',
      }}
    >
      {/* Collapse/Expand Button */}
      <Box sx={{ 
        position: 'absolute', 
        left: -12, 
        top: '50%', 
        transform: 'translateY(-50%)',
        zIndex: 1000 
      }}>
        <Tooltip title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="left">
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
          {/* Quick Stats */}
          <Accordion 
            expanded={expandedSections.includes('stats')}
            onChange={() => handleSectionToggle('stats')}
          >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ minHeight: '48px' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatsIcon fontSize="small" />
            <Typography variant="subtitle2">Quick Stats</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {statistics && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Card variant="outlined" size="small">
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" color="text.secondary">
                    Plans: {statistics.total_plans}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {getCompletionRate()}% Complete
                  </Typography>
                </CardContent>
              </Card>

              {statistics.highest_cost_plan && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`High: ${statistics.highest_cost_plan}`} 
                    size="small" 
                    color="error"
                    icon={<TrendingUpIcon />}
                  />
                  <Chip 
                    label={`Low: ${statistics.lowest_cost_plan}`} 
                    size="small" 
                    color="success"
                  />
                </Box>
              )}
            </Box>
          )}

          {!statistics && (
            <Typography variant="caption" color="text.secondary">
              Loading stats...
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Comments */}
      <Accordion 
        expanded={expandedSections.includes('comments')}
        onChange={() => handleSectionToggle('comments')}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ minHeight: '48px' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentIcon fontSize="small" />
            <Typography variant="subtitle2">
              Comments ({comments.length})
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 0 }}>
          {selectedPlan ? (
            <>
              {/* Add Comment */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={loading}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Add
                </Button>
              </Box>

              {/* Comments List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List dense>
                  {comments.slice(0, 3).map((comment) => (
                    <ListItem key={comment.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" fontWeight="medium">
                            {comment.user.username}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {comment.content.substring(0, 80)}
                              {comment.content.length > 80 ? '...' : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(comment.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {comments.length === 0 && (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                    No comments yet.
                  </Typography>
                )}

                {comments.length > 3 && (
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    +{comments.length - 3} more comments
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 100,
                color: 'text.secondary',
              }}
            >
              <Typography variant="caption" textAlign="center">
                Select a plan to view comments
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
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
          <Tooltip title="Quick Stats" placement="left">
            <IconButton sx={{ p: 1 }}>
              <StatsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Comments" placement="left">
            <IconButton sx={{ p: 1 }}>
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {statistics && (
            <Tooltip title={`${getCompletionRate()}% Complete`} placement="left">
              <Chip 
                label={`${getCompletionRate()}%`}
                size="small"
                color={getCompletionRate() > 70 ? 'success' : 'default'}
                sx={{ fontSize: '10px', height: 20 }}
              />
            </Tooltip>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default MinimizedSidebar;