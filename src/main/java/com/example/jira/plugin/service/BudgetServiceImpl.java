package com.example.jira.plugin.service;

import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.jql.parser.JqlQueryParser;
import com.atlassian.jira.web.bean.PagerFilter;
import com.atlassian.query.Query;
import com.atlassian.jira.issue.search.SearchResults;
import com.atlassian.jira.bc.issue.search.SearchService;
import com.example.jira.plugin.model.Budget;
import java.util.*;
import java.util.stream.Collectors;


public class BudgetServiceImpl implements BudgetService {
    private List<Budget> budgets = new ArrayList<>();
    private Map<String, Double> projectTotalBudgets = new HashMap<>();
    private Map<String, Double> projectRemainingBudgets = new HashMap<>();
    private AlertThresholdService alertThresholdService = new AlertThresholdServiceImpl();

    @Override
    public List<Budget> getAllBudgets() {
        return new ArrayList<>(budgets);
    }

    @Override
    public List<Budget> getProjectExpenses(String projectKey) {
        return budgets.stream()
                .filter(budget -> budget.getProjectKey().equals(projectKey))
                .collect(Collectors.toList());
    }

    @Override
    public Budget createBudget(Budget budget) {
        budgets.add(budget);
        updateRemainingBudget(budget.getProjectKey(), budget.getAmount());
        // Check thresholds and send alerts if necessary
        double totalBudget = projectTotalBudgets.getOrDefault(budget.getProjectKey(), 0.0);
        double totalExpenses = budgets.stream()
                .filter(b -> b.getProjectKey().equals(budget.getProjectKey()))
                .mapToDouble(Budget::getAmount)
                .sum();
        alertThresholdService.checkThresholdsAndAlert(budget.getProjectKey(), totalBudget, totalExpenses);
        return budget;
    }

    @Override
    public void deleteBudget(String id) {
        Budget budgetToRemove = budgets.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        budgets.remove(budgetToRemove);
        updateRemainingBudget(budgetToRemove.getProjectKey(), -budgetToRemove.getAmount());

        // Check thresholds and send alerts if necessary
        double totalBudget = projectTotalBudgets.getOrDefault(budgetToRemove.getProjectKey(), 0.0);
        double totalExpenses = budgets.stream()
                .filter(b -> b.getProjectKey().equals(budgetToRemove.getProjectKey()))
                .mapToDouble(Budget::getAmount)
                .sum();
        alertThresholdService.checkThresholdsAndAlert(budgetToRemove.getProjectKey(), totalBudget, totalExpenses);
    }

    @Override
    public Budget updateBudget(Budget updatedBudget) {
        for (int i = 0; i < budgets.size(); i++) {
            if (budgets.get(i).getId().equals(updatedBudget.getId())) {
                Budget oldBudget = budgets.get(i);
                budgets.set(i, updatedBudget);

                // Update remaining budget
                double budgetDifference = updatedBudget.getAmount() - oldBudget.getAmount();
                updateRemainingBudget(updatedBudget.getProjectKey(), budgetDifference);

                // Check thresholds and send alerts if necessary
                double totalBudget = projectTotalBudgets.getOrDefault(updatedBudget.getProjectKey(), 0.0);
                double totalExpenses = budgets.stream()
                        .filter(b -> b.getProjectKey().equals(updatedBudget.getProjectKey()))
                        .mapToDouble(Budget::getAmount)
                        .sum();
                alertThresholdService.checkThresholdsAndAlert(updatedBudget.getProjectKey(), totalBudget, totalExpenses);

                return updatedBudget;
            }
        }
        return null;  // Budget not found
    }

    @Override
    public double getRemainingBudget(String projectKey) {
        return projectRemainingBudgets.getOrDefault(projectKey, 0.0);
    }

    @Override
    public void setProjectBudget(String projectKey, double totalBudget) {
        projectTotalBudgets.put(projectKey, totalBudget);
        projectRemainingBudgets.put(projectKey, totalBudget);
    }

    @Override
    public Map<String, Object> getBudgetOverview(String projectKey) {
        double totalBudget = projectTotalBudgets.getOrDefault(projectKey, 0.0);
        double totalExpenses = budgets.stream()
                .filter(b -> b.getProjectKey().equals(projectKey))
                .mapToDouble(Budget::getAmount)
                .sum();
        double remainingBudget = projectRemainingBudgets.getOrDefault(projectKey, 0.0);

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalBudget", totalBudget);
        overview.put("totalExpenses", totalExpenses);
        overview.put("remainingBudget", remainingBudget);

        return overview;
    }

    @Override
    public List<Map<String, Object>> getExpensesByCategory(String projectKey) {
        Map<String, Double> categoryExpenses = budgets.stream()
                .filter(b -> b.getProjectKey().equals(projectKey))
                .collect(Collectors.groupingBy(
                        Budget::getBudgetCategory,
                        Collectors.summingDouble(Budget::getAmount)
                ));

        return categoryExpenses.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> category = new HashMap<>();
                    category.put("name", entry.getKey());
                    category.put("value", entry.getValue());
                    return category;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getExpensesByPhase(String projectKey) {
        // Fetch all epics for the project
        List<Issue> epics = getEpicsForProject(projectKey);

        Map<String, Double> epicExpenses = new HashMap<>();

        for (Issue epic : epics) {
            double epicTotal = 0.0;

            // Fetch all issues linked to this epic
            List<Issue> epicIssues = getIssuesForEpic(epic.getKey());

            // Create a set of all issue keys associated with this epic, including the epic itself
            Set<String> epicIssueKeys = new HashSet<>();
            epicIssueKeys.add(epic.getKey());
            epicIssueKeys.addAll(epicIssues.stream().map(Issue::getKey).collect(Collectors.toSet()));

            // Sum expenses for the epic and all its associated issues
            epicTotal = budgets.stream()
                    .filter(b -> b.getProjectKey().equals(projectKey) &&
                            b.getSelectedIssues().stream()
                                    .anyMatch(issue -> epicIssueKeys.contains(issue.getKey())))
                    .mapToDouble(Budget::getAmount)
                    .sum();

            epicExpenses.put(epic.getSummary(), epicTotal);
        }

        return epicExpenses.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> epicData = new HashMap<>();
                    epicData.put("name", entry.getKey());
                    epicData.put("value", entry.getValue());
                    return epicData;
                })
                .collect(Collectors.toList());
    }

    private List<Issue> getEpicsForProject(String projectKey) {
        JqlQueryParser jqlQueryParser = ComponentAccessor.getComponent(JqlQueryParser.class);
        SearchService searchService = ComponentAccessor.getComponent(SearchService.class);
        ApplicationUser user = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();

        try {
            String jqlQuery = String.format("project = %s AND issuetype = Epic", projectKey);
            Query query = jqlQueryParser.parseQuery(jqlQuery);

            SearchService.ParseResult parseResult = searchService.parseQuery(user, query.getQueryString());

            if (parseResult.isValid()) {
                SearchResults<Issue> searchResult = searchService.search(user, parseResult.getQuery(), PagerFilter.getUnlimitedFilter());
                return searchResult.getResults();
            } else {
                // Handle invalid JQL query
                return new ArrayList<>();
            }
        } catch (Exception e) {
            // Handle any exceptions
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private List<Issue> getIssuesForEpic(String epicKey) {
        JqlQueryParser jqlQueryParser = ComponentAccessor.getComponent(JqlQueryParser.class);
        SearchService searchService = ComponentAccessor.getComponent(SearchService.class);
        ApplicationUser user = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();

        try {
            String jqlQuery = String.format("'Epic Link' = %s", epicKey);
            Query query = jqlQueryParser.parseQuery(jqlQuery);

            SearchService.ParseResult parseResult = searchService.parseQuery(user, query.getQueryString());

            if (parseResult.isValid()) {
                SearchResults<Issue> searchResult = searchService.search(user, parseResult.getQuery(), PagerFilter.getUnlimitedFilter());
                return searchResult.getResults();
            } else {
                // Handle invalid JQL query
                return new ArrayList<>();
            }
        } catch (Exception e) {
            // Handle any exceptions
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getCumulativeExpenses(String projectKey) {
        List<Budget> projectBudgets = budgets.stream()
                .filter(b -> b.getProjectKey().equals(projectKey))
                .sorted(Comparator.comparing(Budget::getDate))
                .collect(Collectors.toList());

        double cumulativeTotal = 0.0;
        List<Map<String, Object>> cumulativeExpenses = new ArrayList<>();

        for (Budget budget : projectBudgets) {
            cumulativeTotal += budget.getAmount();
            Map<String, Object> point = new HashMap<>();
            point.put("date", budget.getDate());
            point.put("amount", cumulativeTotal);
            cumulativeExpenses.add(point);
        }

        return cumulativeExpenses;
    }

    @Override
    public List<Budget> getExpensesForIssue(String issueKey) {
        System.out.println("getExpensesForIssue called for key: " + issueKey);

        // Check if the issue is an epic
        boolean isEpic = isEpic(issueKey);
        Set<String> relatedIssueKeys = new HashSet<>();
        relatedIssueKeys.add(issueKey);

        if (isEpic) {
            // If it's an epic, get all related issues
            relatedIssueKeys.addAll(getIssuesForEpic(issueKey).stream().map(Issue::getKey).collect(Collectors.toSet()));
        }

        List<Budget> result = budgets.stream()
                .filter(budget -> budget.getSelectedIssues().stream()
                        .anyMatch(issue -> relatedIssueKeys.contains(issue.getKey())))
                .collect(Collectors.toList());

        System.out.println("Found " + result.size() + " matching budgets");
        return result;
    }

    private boolean isEpic(String issueKey) {
        JqlQueryParser jqlQueryParser = ComponentAccessor.getComponent(JqlQueryParser.class);
        SearchService searchService = ComponentAccessor.getComponent(SearchService.class);
        ApplicationUser user = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();

        try {
            String jqlQuery = String.format("key = %s AND issuetype = Epic", issueKey);
            Query query = jqlQueryParser.parseQuery(jqlQuery);
            SearchService.ParseResult parseResult = searchService.parseQuery(user, query.getQueryString());

            if (parseResult.isValid()) {
                SearchResults<Issue> searchResult = searchService.search(user, parseResult.getQuery(), PagerFilter.getUnlimitedFilter());
                return !searchResult.getResults().isEmpty();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public double getTotalBudget(String projectKey) {
        return projectTotalBudgets.getOrDefault(projectKey, 0.0);
    }

    @Override
    public double getTotalExpenses(String projectKey) {
        return budgets.stream()
                .filter(b -> b.getProjectKey().equals(projectKey))
                .mapToDouble(Budget::getAmount)
                .sum();
    }

    private void updateRemainingBudget(String projectKey, double amount) {
        double remaining = projectRemainingBudgets.getOrDefault(projectKey, 0.0);
        projectRemainingBudgets.put(projectKey, remaining - amount);
    }
}