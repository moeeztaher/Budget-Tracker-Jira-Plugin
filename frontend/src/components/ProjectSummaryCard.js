import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const useStyles = makeStyles((theme) => ({
  card: {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 1000,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "all 0.3s ease",
    width: "200px",
  },
  cardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px !important",
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    color: "white",
  },
  projectInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0 16px",
    maxHeight: "0",
    overflow: "hidden",
    transition: "max-height 0.3s ease, padding 0.3s ease",
  },
  projectInfoExpanded: {
    maxHeight: "200px",
    padding: "16px",
  },
  projectName: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  projectNameRow: {
    display: "flex",
    alignItems: "center",
  },
  checkCircleIcon: {
    marginRight: "8px",
    fontSize: "1.2rem",
  },
  button: {
    marginTop: "10px",
    width: "100%",
  },
  expandIcon: {
    color: "white",
    transition: "transform 0.3s ease",
  },
  expandIconRotated: {
    transform: "rotate(180deg)",
  },
  selectedText: {
    fontSize: "0.7rem",
    opacity: 0.7,
    marginBottom: "2px",
  },
}));

function ProjectSummaryCard({ selectedProject, onProjectChange }) {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <div className={classes.projectName}>
          <Typography variant="caption" className={classes.selectedText}>
            Selected:
          </Typography>
          <div className={classes.projectNameRow}>
            <CheckCircleIcon className={classes.checkCircleIcon} />
            <Typography variant="body1">
              {selectedProject?.name || "No project"}
            </Typography>
          </div>
        </div>
        <IconButton onClick={toggleExpand} size="small">
          <ExpandMoreIcon
            className={`${classes.expandIcon} ${
              isExpanded ? classes.expandIconRotated : ""
            }`}
          />
        </IconButton>
      </CardContent>
      <Box
        className={`${classes.projectInfo} ${
          isExpanded ? classes.projectInfoExpanded : ""
        }`}
      >
        <Typography variant="h6" gutterBottom>
          Current Project
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {selectedProject?.key}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          className={classes.button}
          onClick={onProjectChange}
        >
          Change Project
        </Button>
      </Box>
    </Card>
  );
}

export default ProjectSummaryCard;
