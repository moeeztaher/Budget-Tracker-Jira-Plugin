package com.example.jira.plugin;

import com.atlassian.jira.web.action.JiraWebActionSupport;

public class BudgetTrackerAction extends JiraWebActionSupport {
    private String view;

    @Override
    public String execute() throws Exception {
        return SUCCESS;
    }

    public String doForm() throws Exception {
        view = "form";
        return SUCCESS;
    }

    public String doDashboard() throws Exception {
        view = "dashboard";
        return SUCCESS;
    }

    public String getView() {
        return view;
    }

    public String doSwaggerDocs() {
        return SUCCESS;
    }
}