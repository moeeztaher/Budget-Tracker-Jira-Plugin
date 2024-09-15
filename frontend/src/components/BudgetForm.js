import React, { useState, useCallback } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Typography,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { debounce } from "lodash";
import dayjs from "dayjs";
import EuroIcon from "@mui/icons-material/Euro";

const JiraIssueSearch = ({ selectedIssues, setSelectedIssues, projectKey }) => {
  const [issues, setIssues] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const searchIssues = async (searchTerm) => {
    if (searchTerm.length < 2) return;

    try {
      const jql = encodeURIComponent(
        `project = "${projectKey}" AND text ~ "${searchTerm}*"`
      );

      const response = await fetch(
        `/jira/rest/api/2/search?jql=${jql}&fields=key,summary,issuetype`
      );
      const data = await response.json();

      setIssues(
        data.issues.map((issue) => ({
          key: issue.key,
          summary: issue.fields.summary,
          type: issue.fields.issuetype.name,
        }))
      );
    } catch (error) {
      console.error("Error searching for issues:", error);
    }
  };

  const debouncedSearch = useCallback(debounce(searchIssues, 300), [
    projectKey,
  ]);

  return (
    <Autocomplete
      multiple
      options={issues}
      getOptionLabel={(option) =>
        `${option.key} (${option.type}): ${option.summary}`
      }
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={`${option.key} (${option.type}): ${option.summary}`}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label={`Search Jira Issues for ${projectKey}`} />
      )}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        debouncedSearch(newInputValue);
      }}
      onChange={(event, newValue) => setSelectedIssues(newValue)}
      value={selectedIssues}
      filterOptions={(x) => x}
      fullWidth
      margin="normal"
      loading={inputValue.length > 1 && issues.length === 0}
    />
  );
};

const BudgetForm = ({ onSubmit, projectKey, remainingBudget }) => {
  const [budgetName, setBudgetName] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dayjs());
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    severity: "",
    message: "",
  });

  const predefinedCategories = [
    "Software",
    "Hardware",
    "Labor",
    "Miscellaneous",
  ];

  const validateForm = () => {
    let tempErrors = {};

    if (!budgetName) tempErrors.budgetName = "Expense Name cannot be empty";
    if (!budgetCategory)
      tempErrors.budgetCategory = "Expense Category is required";
    if (budgetCategory === "custom" && !customCategory)
      tempErrors.customCategory = "Custom Category cannot be empty";
    if (!selectedIssues.length)
      tempErrors.selectedIssues = "At least one Jira issue must be selected";
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      tempErrors.amount = "Please enter a valid amount";
    if (!description) tempErrors.description = "Description cannot be empty";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handles the changes and clears the specific error once corrected
  const handleFieldChange = (field, value) => {
    let newErrors = { ...errors };

    if (field === "budgetName" && value.trim() !== "")
      delete newErrors.budgetName;
    if (field === "budgetCategory" && value.trim() !== "")
      delete newErrors.budgetCategory;
    if (field === "customCategory" && value.trim() !== "")
      delete newErrors.customCategory;
    if (field === "selectedIssues" && value.length)
      delete newErrors.selectedIssues;
    if (field === "amount" && !isNaN(value) && parseFloat(value) > 0)
      delete newErrors.amount;
    if (field === "description" && value.trim() !== "")
      delete newErrors.description;

    setErrors(newErrors);

    // Update the specific field state
    if (field === "budgetName") setBudgetName(value);
    if (field === "budgetCategory") setBudgetCategory(value);
    if (field === "customCategory") setCustomCategory(value);
    if (field === "selectedIssues") setSelectedIssues(value);
    if (field === "amount") setAmount(value);
    if (field === "description") setDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const budgetItem = {
      budgetName,
      budgetCategory:
        budgetCategory === "custom" ? customCategory : budgetCategory,
      selectedIssues,
      description,
      amount: parseFloat(amount),
      date,
      projectKey,
    };

    try {
      const response = await fetch("/jira/rest/budget/1.0/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetItem),
      });

      if (response.ok) {
        onSubmit(budgetItem);
        setAlert({
          open: true,
          severity: "success",
          message: "Budget successfully created!",
        });
        // Clear form after submission
        setBudgetName("");
        setBudgetCategory("");
        setCustomCategory("");
        setSelectedIssues([]);
        setDescription("");
        setAmount("");
        setDate(dayjs());
        setErrors({});
      } else {
        setAlert({
          open: true,
          severity: "error",
          message: "Failed to create budget item. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating budget item:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleClose = () => {
    setAlert({ open: false, severity: "", message: "" });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#ffffff",
            borderRadius: 2,
            p: 2,
            mb: 3,
            boxShadow: "0 2px 10px rgba(0,100,0,0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 4px 20px rgba(0,100,0,0.15)",
            },
          }}
        >
          <EuroIcon sx={{ fontSize: 40, color: "#000000", mr: 1 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#588aed" }}
            >
              Remaining Budget
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#80ed58" }}
            >
              {(remainingBudget || 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expense Name"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                margin="normal"
                error={!!errors.budgetName}
                helperText={errors.budgetName}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.budgetCategory}
              >
                <InputLabel>Expense Category</InputLabel>
                <Select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  label="Expense Category"
                >
                  {predefinedCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
                {errors.budgetCategory && (
                  <Typography color="error" variant="caption">
                    {errors.budgetCategory}
                  </Typography>
                )}
              </FormControl>
              {budgetCategory === "custom" && (
                <TextField
                  fullWidth
                  label="Custom Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  margin="normal"
                  error={!!errors.customCategory}
                  helperText={errors.customCategory}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <JiraIssueSearch
                selectedIssues={selectedIssues}
                setSelectedIssues={setSelectedIssues}
                projectKey={projectKey}
              />
              {errors.selectedIssues && (
                <Typography color="error" variant="caption">
                  {errors.selectedIssues}
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                margin="normal"
                error={!!errors.amount}
                helperText={errors.amount}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Select Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                margin="normal"
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  bgcolor: "#0747a6",
                  "&:hover": { bgcolor: "#4e84d3" },
                  transition: "all 0.3s ease",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  py: 1.5,
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={alert.severity}
            sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default BudgetForm;
