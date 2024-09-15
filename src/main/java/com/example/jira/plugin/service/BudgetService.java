package com.example.jira.plugin.service;

import com.atlassian.jira.issue.Issue;
import com.example.jira.plugin.model.Budget;
import java.util.List;
import java.util.Map;

public interface BudgetService {
    List<Budget> getAllBudgets();
    List<Budget> getProjectExpenses(String projectKey);
    Budget createBudget(Budget budget);
    double getRemainingBudget(String projectKey);
    void setProjectBudget(String projectKey, double totalBudget);
    Map<String, Object> getBudgetOverview(String projectKey);
    List<Map<String, Object>> getExpensesByCategory(String projectKey);
    List<Map<String, Object>> getExpensesByPhase(String projectKey);
    List<Map<String, Object>> getCumulativeExpenses(String projectKey);
    List<Budget> getExpensesForIssue(String issueKey);
    double getTotalBudget(String projectKey);
    double getTotalExpenses(String projectKey);
    void deleteBudget(String id);
    Budget updateBudget(Budget budget);
}