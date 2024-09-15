import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function ProjectSelectionModal({ open, projects, onSelectProject }) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Select a Project</DialogTitle>
      <DialogContent>
        <List>
          {projects.map((project) => (
            <ListItem
              button
              key={project.id}
              onClick={() => onSelectProject(project.key)}
            >
              <ListItemText primary={project.name} secondary={project.key} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectSelectionModal;
