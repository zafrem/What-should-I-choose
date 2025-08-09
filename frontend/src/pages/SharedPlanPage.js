import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { sharingAPI, commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const SharedPlanPage = () => {
  const { shareToken } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadSharedPlan();
  }, [shareToken]);

  useEffect(() => {
    if (plan && isAuthenticated) {
      loadComments();
    }
  }, [plan, isAuthenticated]);

  const loadSharedPlan = async () => {
    try {
      setLoading(true);
      const response = await sharingAPI.getSharedPlan(shareToken);
      setPlan(response.data);
      setError('');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Shared plan not found or link has expired');
      } else if (error.response?.status === 410) {
        setError('This shared link has expired');
      } else {
        setError('Failed to load shared plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!plan) return;
    
    try {
      const response = await commentsAPI.getAll(plan.id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !plan) return;
    
    try {
      setCommentLoading(true);
      await commentsAPI.create({
        plan_id: plan.id,
        content: newComment.trim(),
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      setError('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY HH:mm');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Plan Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Plan {plan.plan_letter}: {plan.title}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a shared view of someone's plan. You can view the content and add comments if you're logged in.
          </Alert>
          
          {plan.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {plan.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
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
          </Box>
        </Box>

        {/* Tasks Section */}
        {plan.tasks && plan.tasks.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Tasks
            </Typography>
            <List>
              {plan.tasks
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
                      {task.is_completed ? (
                        <CheckIcon color="success" />
                      ) : (
                        <UncheckIcon color="action" />
                      )}
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
                  </ListItem>
                ))}
            </List>
          </Box>
        )}

        {/* Comments Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Comments
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentLoading}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? 'Adding...' : 'Add Comment'}
              </Button>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Please log in to add comments to this plan.
            </Alert>
          )}

          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {comment.user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>

          {comments.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No comments yet. {isAuthenticated ? 'Be the first to comment!' : 'Log in to add the first comment!'}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SharedPlanPage;