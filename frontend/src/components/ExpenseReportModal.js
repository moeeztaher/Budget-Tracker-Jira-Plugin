import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import PropTypes from "prop-types";
import dayjs from "dayjs";

function ExpenseReportModal({ open, onClose, expenses }) {
  const [reportType, setReportType] = useState("monthly");

  const handleExport = () => {
    let filteredExpenses;
    const today = dayjs();

    if (reportType === "monthly") {
      filteredExpenses = expenses.filter((expense) =>
        dayjs(expense.date).isSame(today, "month")
      );
    } else if (reportType === "quarterly") {
      const currentQuarterStart = today.startOf("quarter");
      filteredExpenses = expenses.filter((expense) =>
        dayjs(expense.date).isAfter(currentQuarterStart)
      );
    } else if (reportType === "annual") {
      filteredExpenses = expenses.filter((expense) =>
        dayjs(expense.date).isSame(today, "year")
      );
    }

    const csvContent = `Expense Name,Category,Amount,Issues,Description,Date\n${filteredExpenses
      .map(
        (exp) =>
          `${exp.budgetName},${exp.budgetCategory},${
            exp.amount
          },${exp.selectedIssues.map((issue) => issue.key).join(";")},${
            exp.description
          },${dayjs(exp.date).format("YYYY-MM-DD")}`
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `budget_report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Export Expense Report</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <Select
            labelId="report-type-label"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
            <MenuItem value="annual">Annual</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleExport}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ExpenseReportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  expenses: PropTypes.array.isRequired,
};

export default ExpenseReportModal;
