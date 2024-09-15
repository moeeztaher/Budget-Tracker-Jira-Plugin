import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const SetTotalBudgetModal = ({ open, onClose, onSubmit, projectKey }) => {
  const [totalBudget, setTotalBudget] = useState("");

  const handleSubmit = () => {
    onSubmit(totalBudget);
    setTotalBudget("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Total Budget for Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Total Budget"
          type="number"
          fullWidth
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Set Budget</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetTotalBudgetModal;
