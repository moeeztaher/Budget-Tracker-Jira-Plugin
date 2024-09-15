package com.example.jira.plugin.service;

import java.util.List;

public interface AlertThresholdService {
    List<Integer> getThresholds();
    void addThreshold(int threshold);
    void removeThreshold(int threshold);
    void checkThresholdsAndAlert(String projectKey, double totalBudget, double currentExpenses);
}