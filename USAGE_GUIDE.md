# Usage Guide - Project & Plan Management

This guide explains how to use the A-Z Plan Project Management System with the new hierarchical structure.

## Overview

The system is organized in a three-level hierarchy:
- **Projects** → **Plans A-Z** → **Tasks**

## Getting Started

### 1. User Registration & Login
1. Visit http://localhost:3000
2. Register a new account or login with existing credentials
3. Default admin credentials: `admin@atozplan.com` / `admin123`

### 2. Project Management

#### Creating a Project
1. Click **"New Project"** button in the Project Management sidebar
2. Enter project details:
   - **Title**: Descriptive name for your project
   - **Description**: Brief overview of the project goals
3. Click **"Create Project"**

#### Managing Projects
- **Edit**: Click the edit icon (✏️) next to any project
- **Delete**: Click the delete icon (🗑️) next to any project
- **Select**: Click on a project name to open it

### 3. Plan Management (A-Z Structure)

#### Understanding Plan Types
- **Plan A**: Most detailed and best form with low cost - your starting point
- **Plan Z**: Almost giving up option - your fallback plan  
- **Plans B-Y**: Intermediate variations and alternatives

#### Creating Plans
1. Select a project from the sidebar
2. Click **"+ Create Plans"** button
3. In the plan selection dialog:
   - Select which plans you need (A, B, C, ..., Z)
   - Plan A gets special "starting point" description
   - Plan Z gets special "fallback plan" description
   - Other plans get generic step descriptions
4. Click **"Create Plans"**

#### Managing Plans
- Plans are displayed as expandable sections (A, B, C, etc.)
- Click on a plan letter to expand/collapse it
- **Edit Plan**: Available through the plan interface
- **Delete Plan**: Click the delete icon (Plan A cannot be deleted)

### 4. Task Management

#### Adding Tasks to Plans
1. Expand any plan (A, B, C, etc.)
2. Click **"Add Task"** button
3. Fill in task details:
   - **Title**: Task name (required)
   - **Description**: Detailed task information
   - **Cost**: Expected cost in USD
   - **Revenue**: Expected revenue in USD
   - **Support Target**: Person/team responsible

#### Managing Tasks
- **Complete/Uncomplete**: Click the circle icon next to any task
- **Edit**: Click the edit icon (✏️) next to any task
- **Delete**: Click the delete icon (🗑️) next to any task
- **Reorder**: Update the order field when editing

### 5. AI-Powered Plan Generation

#### Prerequisites
- Must have Plan Z created with detailed description
- Plan Z description should be comprehensive

#### Generating Intermediate Plans
1. Create Plan Z in your project
2. Add detailed description to Plan Z explaining your ultimate goal
3. Click **"Generate B-Y from Z"** button
4. The AI will create Plans B through Y as stepping stones
5. Review and customize the generated plans as needed

### 6. Progress Tracking

#### Visual Indicators
- **Plan Progress**: Shows completion percentage for each plan
- **Task Count**: Displays completed/total tasks (e.g., "3/7 tasks")
- **Completion Status**: Color-coded chips (green for complete, default for in-progress)

#### Statistics View
- Overall project statistics in the right sidebar
- Completion rates and progress tracking
- Cost/revenue analysis per project

### 7. Collaboration Features

#### Comments System
1. Select a project with plans
2. Use the right sidebar "Comments" section
3. Add comments for team collaboration
4. Comments are associated with the project

#### Sharing (Future Feature)
- Shareable links for external collaboration
- User permissions and access control

## Best Practices

### Project Organization
1. **Start Small**: Create one project to understand the workflow
2. **Meaningful Titles**: Use descriptive project and plan names
3. **Plan Hierarchy**: 
   - Plan A = Your ideal scenario
   - Plan Z = Your backup/worst-case scenario
   - Plans B-Y = Variations between A and Z

### Task Management
1. **Be Specific**: Write clear, actionable task titles
2. **Cost Tracking**: Include realistic cost estimates
3. **Assign Responsibility**: Use support targets for accountability
4. **Regular Updates**: Mark tasks complete as you progress

### AI Generation Tips
1. **Detailed Plan Z**: Write comprehensive descriptions for better AI generation
2. **Review Generated Content**: Always review and customize AI-generated plans
3. **Iterative Improvement**: Regenerate plans as your Plan Z evolves

## Keyboard Shortcuts

Currently, the system uses mouse/touch interactions. Keyboard shortcuts may be added in future versions.

## API Access

### Getting API Tokens
1. Navigate to user settings (future feature)
2. Generate API tokens for programmatic access
3. Use tokens with the REST API

### API Endpoints
- Projects: `/projects/*`
- Plans: `/projects/{project_id}/plans/*`
- Tasks: `/plans/{plan_id}/tasks/*`
- Full documentation: http://localhost:8000/docs

## Troubleshooting

### Common Issues

1. **Cannot Create Plans**
   - Ensure you've selected a project first
   - Check that you have permission to edit the project

2. **AI Generation Not Working**
   - Verify Plan Z has detailed description
   - Check Ollama service is running (http://localhost:11434)
   - Review backend logs for AI service errors

3. **Tasks Not Saving**
   - Ensure required fields (Title) are filled
   - Check backend connection (http://localhost:8000/health)

4. **Projects Not Loading**
   - Check authentication (may need to re-login)
   - Verify backend database connection

### Getting Help
1. Check browser console for errors (F12)
2. Review backend logs in `logs/backend.log`
3. Verify all services are running with `./start.sh`

## Data Structure Example

```
📂 Marketing Campaign 2024
   ├── 📄 Plan A: Premium Digital Strategy
   │   ├── ✅ Setup Google Ads ($500, Revenue: $2000)
   │   ├── ⭕ Create Landing Page ($200, Revenue: $800)
   │   └── ⭕ Launch Social Media Campaign
   ├── 📄 Plan B: Standard Strategy
   │   └── ⭕ Basic SEO Implementation
   └── 📄 Plan Z: Minimal Approach
       └── ✅ Free social media only

📂 Product Development
   ├── 📄 Plan A: Full Feature Set
   └── 📄 Plan Z: MVP Only
```

This hierarchical structure allows for comprehensive project planning with multiple scenarios and detailed task management.