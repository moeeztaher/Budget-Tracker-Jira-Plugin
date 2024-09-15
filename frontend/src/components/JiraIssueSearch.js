import React, { useState, useCallback } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { debounce } from "lodash";

function JiraIssueSearch({ selectedIssues, setSelectedIssues }) {
  const [issues, setIssues] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const searchIssues = async (searchTerm) => {
    if (searchTerm.length < 2) return;

    try {
      const response = await fetch(
        `/jira/rest/api/2/search?jql=(text ~ "${searchTerm}" OR issuetype = Epic)&fields=key,summary,issuetype`
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

  const debouncedSearch = useCallback(debounce(searchIssues, 300), []);

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
        <TextField {...params} label="Search Jira Issues and Epics" />
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
}

export default JiraIssueSearch;
