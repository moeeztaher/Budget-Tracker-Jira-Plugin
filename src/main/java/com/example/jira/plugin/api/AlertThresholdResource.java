package com.example.jira.plugin.api;

import com.example.jira.plugin.service.AlertThresholdService;
import com.example.jira.plugin.service.AlertThresholdServiceImpl;
import com.example.jira.plugin.service.AlertThresholdServiceSingleton;
import com.google.gson.Gson;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/alert-thresholds")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlertThresholdResource {
    private final AlertThresholdService alertThresholdService;
    private final Gson gson;

    public AlertThresholdResource() {
        this.alertThresholdService = AlertThresholdServiceSingleton.getInstance();
        this.gson = new Gson();
    }

    @GET
    public Response getThresholds() {
        List<Integer> thresholds = alertThresholdService.getThresholds();
        return Response.ok(gson.toJson(thresholds)).build();
    }

    @POST
    public Response addThreshold(String thresholdJson) {
        int threshold = gson.fromJson(thresholdJson, ThresholdDTO.class).threshold;
        alertThresholdService.addThreshold(threshold);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{threshold}")
    public Response removeThreshold(@PathParam("threshold") int threshold) {
        alertThresholdService.removeThreshold(threshold);
        return Response.ok().build();
    }

    private static class ThresholdDTO {
        int threshold;
    }
}
