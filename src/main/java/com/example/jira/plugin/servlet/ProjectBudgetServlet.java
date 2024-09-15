package com.example.jira.plugin.servlet;

import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.auth.LoginUriProvider;
import com.atlassian.sal.api.user.UserManager;
import com.example.jira.plugin.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;

@Scanned
public class ProjectBudgetServlet extends HttpServlet {

    private final UserManager userManager;
    private final LoginUriProvider loginUriProvider;
    private final BudgetService budgetService;

    @Autowired
    public ProjectBudgetServlet(@ComponentImport UserManager userManager,
                                  @ComponentImport LoginUriProvider loginUriProvider,
                                  BudgetService budgetService) {
        this.userManager = userManager;
        this.loginUriProvider = loginUriProvider;
        this.budgetService = budgetService;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = userManager.getRemoteUsername(req);
        if (username == null || !userManager.isSystemAdmin(username)) {
            redirectToLogin(req, resp);
            return;
        }

        String projectKey = req.getParameter("projectKey");
        if (projectKey == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Project key is required");
            return;
        }

        double remainingBudget = budgetService.getRemainingBudget(projectKey);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"remainingBudget\": " + remainingBudget + "}");
    }

    private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.sendRedirect(loginUriProvider.getLoginUri(getUri(request)).toASCIIString());
    }

    private URI getUri(HttpServletRequest request) {
        StringBuffer builder = request.getRequestURL();
        if (request.getQueryString() != null) {
            builder.append("?");
            builder.append(request.getQueryString());
        }
        return URI.create(builder.toString());
    }
}