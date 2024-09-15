package com.example.jira.plugin.model;

import java.util.List;
import java.util.UUID;

public class Budget {

    private String id;
    private String projectKey;
    private double totalBudget;
    private double remainingBudget;
    private String budgetName;
    private String budgetCategory;
    private List<Issue> selectedIssues;
    private String description;
    private double amount;
    private String epicKey;
    private String issueKey;



    private String date;

    public Budget() {
        this.id = UUID.randomUUID().toString();
    }

    public Budget(String budgetName, String budgetCategory, List<Issue> selectedIssues, String description, double amount) {
        this.id = UUID.randomUUID().toString();
        this.budgetName = budgetName;
        this.budgetCategory = budgetCategory;
        this.selectedIssues = selectedIssues;
        this.description = description;
        this.amount = amount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    public String getEpicKey() { return epicKey; }
    public void setEpicKey(String epicKey) { this.epicKey = epicKey; }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public double getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(double totalBudget) {
        this.totalBudget = totalBudget;
    }

    public double getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(double remainingBudget) {
        this.remainingBudget = remainingBudget;
    }
    public String getBudgetName() {
        return budgetName;
    }

    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
    }

    public String getBudgetCategory() {
        return budgetCategory;
    }

    public void setBudgetCategory(String budgetCategory) {
        this.budgetCategory = budgetCategory;
    }

    public List<Issue> getSelectedIssues() {
        return selectedIssues;
    }

    public void setSelectedIssues(List<Issue> selectedIssues) {
        this.selectedIssues = selectedIssues;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
    public String getIssueKey() { return issueKey;}

    public void setIssueKey(String issueKey) { this.issueKey = issueKey; }
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    // inner class for issue
    public static class Issue {
        private String key;
        private String summary;
        private String type;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}
