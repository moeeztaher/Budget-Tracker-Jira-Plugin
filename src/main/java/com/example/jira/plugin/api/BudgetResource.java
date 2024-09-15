package com.example.jira.plugin.api;

import com.example.jira.plugin.model.Budget;
import com.example.jira.plugin.service.*;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import com.google.gson.Gson;

import java.util.List;
import java.util.Map;

@Path("/budget")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({MediaType.APPLICATION_JSON})
public class BudgetResource {
    private final BudgetService budgetService;
    private final AlertThresholdService alertThresholdService;
    private final Gson gson;

    public BudgetResource() {
        this.budgetService = new BudgetServiceImpl();
        this.alertThresholdService = AlertThresholdServiceSingleton.getInstance();
        this.gson = new Gson();
    }

    @GET
    public Response getBudgets() {
        return Response.ok(gson.toJson(budgetService.getAllBudgets())).build();
    }

    @POST
    public Response createBudget(String budgetJson) {
        Budget budget = gson.fromJson(budgetJson, Budget.class);
        if (budget.getBudgetName() == null || budget.getBudgetName().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Budget name is required").build();
        }
        Budget createdBudget = budgetService.createBudget(budget);

        // check thresholds and send alerts
        String projectKey = createdBudget.getProjectKey();
        double totalBudget = budgetService.getTotalBudget(projectKey);
        double totalExpenses = budgetService.getTotalExpenses(projectKey);
        alertThresholdService.checkThresholdsAndAlert(projectKey, totalBudget, totalExpenses);

        return Response.ok(gson.toJson(createdBudget)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteBudget(@PathParam("id") String id) {
        try {
            budgetService.deleteBudget(id);
            return Response.ok().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error deleting budget").build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateBudget(@PathParam("id") String id, String budgetJson) {
        try {
            Budget updatedBudget = gson.fromJson(budgetJson, Budget.class);
            updatedBudget.setId(id);
            Budget result = budgetService.updateBudget(updatedBudget);
            if (result != null) {
                return Response.ok(gson.toJson(result)).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).entity("Budget not found").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error updating budget").build();
        }
    }

    @GET
    @Path("/expenses/all/{projectKey}")
    public Response getProjectExpenses(@PathParam("projectKey") String projectKey) {
        return Response.ok(gson.toJson(budgetService.getProjectExpenses(projectKey))).build();
    }

    @GET
    @Path("/remaining/{projectKey}")
    public Response getRemainingBudget(@PathParam("projectKey") String projectKey) {
        double remainingBudget = budgetService.getRemainingBudget(projectKey);
        return Response.ok(gson.toJson(remainingBudget)).build();
    }

    @POST
    @Path("/set")
    public Response setProjectBudget(String budgetJson) {
        Budget budget = gson.fromJson(budgetJson, Budget.class);
        budgetService.setProjectBudget(budget.getProjectKey(), budget.getTotalBudget());
        return Response.ok().build();
    }

    @GET
    @Path("/overview/{projectKey}")
    public Response getBudgetOverview(@PathParam("projectKey") String projectKey) {
        Map<String, Object> overview = budgetService.getBudgetOverview(projectKey);
        return Response.ok(gson.toJson(overview)).build();
    }

    @GET
    @Path("/expenses/by-category/{projectKey}")
    public Response getExpensesByCategory(@PathParam("projectKey") String projectKey) {
        List<Map<String, Object>> expenses = budgetService.getExpensesByCategory(projectKey);
        return Response.ok(gson.toJson(expenses)).build();
    }

    @GET
    @Path("/expenses/by-phase/{projectKey}")
    public Response getExpensesByPhase(@PathParam("projectKey") String projectKey) {
        List<Map<String, Object>> expenses = budgetService.getExpensesByPhase(projectKey);
        return Response.ok(gson.toJson(expenses)).build();
    }

    @GET
    @Path("/cumulative-expenses/{projectKey}")
    public Response getCumulativeExpenses(@PathParam("projectKey") String projectKey) {
        List<Map<String, Object>> expenses = budgetService.getCumulativeExpenses(projectKey);
        return Response.ok(gson.toJson(expenses)).build();
    }

    @GET
    @Path("/expenses/{issueKey}")
    public Response getExpensesForIssue(@PathParam("issueKey") String issueKey) {
        List<Budget> linkedExpenses = budgetService.getExpensesForIssue(issueKey);
        return Response.ok(gson.toJson(linkedExpenses)).build();
    }
}
