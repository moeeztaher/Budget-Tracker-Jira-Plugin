import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
  Fade,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  onboardingModal: {
    textAlign: "center",
    padding: "20px",
  },
  button: {
    margin: "10px",
  },
  welcomeText: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: "15px",
  },
  descriptionText: {
    fontSize: "1.2rem",
    marginBottom: "20px",
  },
  dialogContent: {
    background: "#f5f5f5",
  },
});

function OnboardingModal({ open, onClose, onStartBudgetSetup }) {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      TransitionComponent={Fade}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={classes.onboardingModal}>
        Welcome to the Budget Setup
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography className={classes.welcomeText}>
          Let's get started!
        </Typography>
        <Typography className={classes.descriptionText}>
          It looks like you haven't set up a budget for this project yet. Let's
          create one to help you track your finances.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={onStartBudgetSetup}
        >
          Start Setup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OnboardingModal;
