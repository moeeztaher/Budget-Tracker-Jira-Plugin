//package com.example.jira.plugin.service;
//
//import com.example.jira.plugin.config.AppConfig;
//import org.springframework.context.ApplicationContext;
//import org.springframework.context.annotation.AnnotationConfigApplicationContext;
//
//public class ServiceLocator {
//
//    private static ApplicationContext applicationContext;
//
//    static {
//        applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);
//    }
//
//    public static BudgetService getBudgetService() {
//        return applicationContext.getBean(BudgetService.class);
//    }
//
//    public static AlertThresholdService getAlertThresholdService() {
//        return applicationContext.getBean(AlertThresholdService.class);
//    }
//
//    public static EmailService getEmailService() {
//        return applicationContext.getBean(EmailService.class);
//    }
//}