package com.example.jira.plugin.service;
public class AlertThresholdServiceSingleton {
    private static AlertThresholdService instance;
    private AlertThresholdServiceSingleton() {}
    public static synchronized AlertThresholdService getInstance() {
        if ( instance == null) {
            instance = new AlertThresholdServiceImpl();
        }
        return instance;
    }
}