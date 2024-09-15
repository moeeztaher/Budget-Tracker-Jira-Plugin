package com.example.jira.plugin.service;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.mail.Email;
import com.atlassian.mail.queue.SingleMailQueueItem;
import com.atlassian.mail.server.SMTPMailServer;

public class EmailService {
    public void sendEmail(String to, String subject, String body) {
        try {
            // Log the details of the email
            System.out.println("Preparing to send email to: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);

            Email email = new Email(to);
            email.setSubject(subject);
            email.setBody(body);

            // Get the default 'from' address
            SMTPMailServer mailServer = ComponentAccessor.getMailServerManager().getDefaultSMTPMailServer();
            if (mailServer == null) {
                throw new RuntimeException("No default SMTP mail server configured.");
            }

            String fromAddress = mailServer.getDefaultFrom();
            email.setFrom(fromAddress);

            System.out.println("From: " + fromAddress);

            // Use Jira's mail queue to send the email
            SingleMailQueueItem item = new SingleMailQueueItem(email);
            ComponentAccessor.getMailQueue().addItem(item);

            System.out.println("Email queued successfully for: " + to);
        } catch (Exception e) {
            System.out.println("Failed to queue email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
