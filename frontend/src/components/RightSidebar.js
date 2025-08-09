import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statisticsAPI, commentsAPI } from '../services/api';

const RightSidebar = ({ selectedPlan, onCommentAdded }) => {
  const [statistics, setStatistics] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

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
      setError('Failed to load statistics');
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPlan) return;
    
    try {
      setLoading(true);
      await commentsAPI.create({
        plan_id: selectedPlan.id,
        content: newComment.trim(),
      });
      setNewComment('');
      loadComments();
      if (onCommentAdded) onCommentAdded();
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
        padding: isCollapsed ? 1 : 2,
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? 60 : 320,
        minWidth: isCollapsed ? 60 : 300,
        maxWidth: isCollapsed ? 60 : 350,
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
      {/* Statistics Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Statistics Summary
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {statistics && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card variant="outlined" size="small">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Plans
                </Typography>
                <Typography variant="h6">
                  {statistics.total_plans}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" size="small">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <Typography variant="h6" color="primary">
                  {getCompletionRate()}%
                </Typography>
              </CardContent>
            </Card>

            {statistics.highest_cost_plan && (
              <Card variant="outlined" size="small">
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="error" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Highest Cost Plan
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    Plan {statistics.highest_cost_plan}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {statistics.lowest_cost_plan && (
              <Card variant="outlined" size="small">
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDownIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Lowest Cost Plan
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    Plan {statistics.lowest_cost_plan}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {statistics.longest_duration_plan && (
              <Card variant="outlined" size="small">
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="info" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Longest Duration
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    Plan {statistics.longest_duration_plan}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {statistics.shortest_duration_plan && (
              <Card variant="outlined" size="small">
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Shortest Duration
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    Plan {statistics.shortest_duration_plan}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {!statistics && !error && (
          <Typography variant="body2" color="text.secondary">
            Loading statistics...
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Comments Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Comments
        </Typography>

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
              >
                Add Comment
              </Button>
            </Box>

            {/* Comments List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List dense>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {comment.user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {comments.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  No comments yet. Be the first to comment!
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
              height: 200,
              flexDirection: 'column',
              color: 'text.secondary',
            }}
          >
            <CommentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" textAlign="center">
              Select a plan to view and add comments
            </Typography>
          </Box>
        )}
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
          <Tooltip title="Statistics Summary" placement="left">
            <IconButton sx={{ p: 1 }}>
              <TrendingUpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Comments" placement="left">
            <IconButton sx={{ p: 1 }}>
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
};

export default RightSidebar;