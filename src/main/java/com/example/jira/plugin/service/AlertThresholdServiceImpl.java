package com.example.jira.plugin.service;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.atlassian.jira.security.roles.ProjectRoleManager;
import com.atlassian.jira.security.roles.ProjectRole;
import com.atlassian.jira.user.ApplicationUser;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class AlertThresholdServiceImpl implements AlertThresholdService {
    private static final List<Integer> thresholds = new ArrayList<>();
    private final EmailService emailService = new EmailService();
    private int highestThresholdCrossed = 0;

    @Override
    public List<Integer> getThresholds() {
        return new ArrayList<>(thresholds);
    }

    @Override
    public void addThreshold(int threshold) {
        if (!thresholds.contains(threshold)) {
            thresholds.add(threshold);
            thresholds.sort(Collections.reverseOrder());
        }
    }

    @Override
    public void removeThreshold(int threshold) {
        thresholds.remove(Integer.valueOf(threshold));
    }

    @Override
    public void checkThresholdsAndAlert(String projectKey, double totalBudget, double currentExpenses) {
        double percentageSpent = (currentExpenses / totalBudget) * 100;

        // sort the thresholds in descending order (in case they were not sorted already)
        thresholds.sort(Collections.reverseOrder());

        for (int threshold : thresholds) {

            if (percentageSpent >= threshold && threshold > highestThresholdCrossed) {
                sendAlertToProjectManagers(projectKey, threshold, percentageSpent, totalBudget, currentExpenses);
                highestThresholdCrossed = threshold;
            }
        }
    }

    private void sendAlertToProjectManagers(String projectKey, int threshold, double percentageSpent, double totalBudget, double currentExpenses) {
        ProjectManager projectManager = ComponentAccessor.getProjectManager();
        ProjectRoleManager projectRoleManager = ComponentAccessor.getComponentOfType(ProjectRoleManager.class);
        Project project = projectManager.getProjectObjByKey(projectKey);

        if (project == null) {
            System.out.println("Project not found: " + projectKey);
            return;
        }

        ProjectRole managerRole = projectRoleManager.getProjectRole("Project Manager");
        if (managerRole == null) {
            System.out.println("Project Manager role not found");
            return;
        }

        Set<ApplicationUser> projectManagers = projectRoleManager.getProjectRoleActors(managerRole, project).getApplicationUsers();

        for (ApplicationUser manager : projectManagers) {
            String emailAddress = manager.getEmailAddress();
            if (emailAddress != null && !emailAddress.isEmpty()) {
                String subject = "Budget Alert for Project " + projectKey;
                String body = String.format("Alert: Project %s has reached %d%% of its budget.\n\n" +
                                "Total Budget: $%.2f\n" +
                                "Current Expenses: $%.2f\n" +
                                "Percentage Spent: %.2f%%",
                        projectKey, threshold, totalBudget, currentExpenses, percentageSpent);
                emailService.sendEmail(emailAddress, subject, body);
            }
        }
    }
}
