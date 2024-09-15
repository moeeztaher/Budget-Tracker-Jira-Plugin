import React, { useState, useEffect } from 'react';
import BudgetTracker from './components/BudgetTracker';
import BudgetOverview from './components/BudgetOverview';
import BudgetDashboardPage from './pages/BudgetDashboardPage';
import LinkedExpenses from './components/LinkedExpenses';
import AlertThresholds from './components/AlertThresholds';
import ProjectSelectionModal from './components/ProjectSelectionModal';
import OnboardingModal from './components/OnboardingModal';
import ProjectSummaryCard from './components/ProjectSummaryCard';
import SwaggerDocs from './components/SwaggerDocs';

import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState(localStorage.getItem('selectedProjectKey')); // Persist project in localStorage
  const [selectedProject, setSelectedProject] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(!selectedProjectKey); // Open only if no project selected yet

  const path = window.location.pathname;
  const isBudgetTracker = path.includes('BudgetTrackerForm');
  const isBudgetOverview = path.includes('BudgetTrackerOverview');
  const isDashboard = path.includes('BudgetTrackerDashboard');
  const isAlertThresholds = path.includes('BudgetThresholdPage');
  const isSwaggerPage = path.includes('SwaggerDocs');
  const issueKey = JIRA?.Issue?.getIssueKey();
  const isIssuePage = issueKey != null;

  // Fetch all projects from Jira REST API on app load
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/jira/rest/api/2/project');
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData); // Set projects in state

          // Default to the first project if none is selected
          if (!selectedProjectKey && projectsData.length > 0) {
            setSelectedProjectKey(projectsData[0].key);
            setSelectedProject(projectsData[0]); // Set the selected project
            localStorage.setItem('selectedProjectKey', projectsData[0].key);
            setProjectSelectionOpen(false);
          } else {
            const currentProject = projectsData.find(proj => proj.key === selectedProjectKey);
            setSelectedProject(currentProject);
          }
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [selectedProjectKey]);

  // After project selection, fetch the budget data for the selected project
  useEffect(() => {
    async function fetchBudgetData(projectKey) {
      try {
        const response = await fetch(`/jira/rest/budget/1.0/budget/overview/${projectKey}`);
        if (response.ok) {
          const data = await response.json();
          setBudgetData(data);

          // if no budget exists show onboarding modal
          if (data.totalBudget === 0) {
            setOnboardingOpen(true);
          } else {
            setOnboardingOpen(false);
          }
        } else {
          console.error('Failed to fetch budget data');
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      }
    }

    if (selectedProjectKey) {
      fetchBudgetData(selectedProjectKey);
    }
  }, [selectedProjectKey]);

  // handler when project is selected from the project selection modal
  const handleProjectSelect = (projectKey) => {
    setSelectedProjectKey(projectKey);
    const newProject = projects.find(proj => proj.key === projectKey);
    setSelectedProject(newProject); // Update selected project
    localStorage.setItem('selectedProjectKey', projectKey); // Store project in localStorage
    setProjectSelectionOpen(false); // Close the project selection modal
  };

  // handler to start budget setup from onboarding modal
  const handleStartBudgetSetup = () => {
    setOnboardingOpen(false);
    window.history.pushState(null, '', '/jira/secure/BudgetTrackerForm.jspa'); // Change the URL to trigger BudgetTracker
  };

  // open project selection modal manually
  const openProjectSelection = () => {
    setProjectSelectionOpen(true);
  };

  return (
    <div className={`App ${onboardingOpen ? 'blur-background' : ''}`}>
      <div className="content-wrapper">
        {/* projectsummarycard shouldnt show up on issue viewer and swagger page */}
        {!isIssuePage && !isSwaggerPage && (
          <>
            <ProjectSummaryCard
              selectedProject={selectedProject}
              onProjectChange={openProjectSelection}
            />
            <ProjectSelectionModal
              open={projectSelectionOpen}
              projects={projects}
              onSelectProject={handleProjectSelect}
            />
          </>
        )}
        <OnboardingModal
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onStartBudgetSetup={handleStartBudgetSetup}
        />
        {isBudgetTracker ? (
          <BudgetTracker
            projectKey={selectedProjectKey}
            onboardingOpen={onboardingOpen}
            setOnboardingOpen={setOnboardingOpen}
          />
        ) : isBudgetOverview ? (
          <BudgetOverview projectKey={selectedProjectKey} />
        ) : isDashboard ? (
          <BudgetDashboardPage projectKey={selectedProjectKey} />
        ) : isAlertThresholds ? (
          <AlertThresholds />
        ) : isIssuePage ? (
          <LinkedExpenses issueKey={issueKey} />
        ) : isSwaggerPage ? (
          <SwaggerDocs />
        ) : (
          <div>Page not found</div>
        )}
      </div>
    </div>
  );
}

export default App;
