import React, { useState, useEffect } from "react";
import { Typography, List, ListItem, ListItemText } from "@mui/material";

const LinkedExpenses = ({ issueKey }) => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchLinkedExpenses = async () => {
      try {
        const response = await fetch(
          `/jira/rest/budget/1.0/budget/expenses/${issueKey}`
        );
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching linked expenses:", error);
      }
    };

    fetchLinkedExpenses();
  }, [issueKey]);

  return (
    <div>
      <List>
        {expenses.map((expense) => (
          <ListItem
            key={expense.id}
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <ListItemText
              primary={expense.budgetName}
              style={{ marginRight: "16px" }}
            />
            <Typography variant="body2" style={{ fontWeight: "bold" }}>
              ${expense.amount.toFixed(2)}
            </Typography>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default LinkedExpenses;
