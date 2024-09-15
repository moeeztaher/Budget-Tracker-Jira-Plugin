import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SearchIcon from "@mui/icons-material/Search";
import { visuallyHidden } from "@mui/utils";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <TableSortLabel
            active={orderBy === "value"}
            direction={orderBy === "value" ? order : "asc"}
            onClick={createSortHandler("value")}
          >
            Threshold (%)
            {orderBy === "value" ? (
              <Box component="span" sx={visuallyHidden}>
                {order === "desc" ? "sorted descending" : "sorted ascending"}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel
            active={orderBy === "createdAt"}
            direction={orderBy === "createdAt" ? order : "asc"}
            onClick={createSortHandler("createdAt")}
          >
            Created At
            {orderBy === "createdAt" ? (
              <Box component="span" sx={visuallyHidden}>
                {order === "desc" ? "sorted descending" : "sorted ascending"}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const AlertThresholds = () => {
  const [thresholds, setThresholds] = useState([]);
  const [newThreshold, setNewThreshold] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("value");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch("/jira/rest/budget/1.0/alert-thresholds");
      const data = await response.json();
      setThresholds(
        data.map((t, index) => ({
          id: index,
          value: t,
          createdAt: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching thresholds:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch thresholds.",
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const addThreshold = async () => {
    if (
      newThreshold &&
      !thresholds.some((t) => t.value === Number(newThreshold))
    ) {
      try {
        await fetch("/jira/rest/budget/1.0/alert-thresholds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threshold: Number(newThreshold) }),
        });
        fetchThresholds();
        setNewThreshold("");
        setSnackbar({
          open: true,
          message: "Threshold added successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error adding threshold:", error);
        setSnackbar({
          open: true,
          message: "Failed to add threshold.",
          severity: "error",
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: "Threshold already exists or is invalid.",
        severity: "warning",
      });
    }
  };

  const removeThreshold = async (threshold) => {
    try {
      await fetch(`/jira/rest/budget/1.0/alert-thresholds/${threshold.value}`, {
        method: "DELETE",
      });
      fetchThresholds();
      setSnackbar({
        open: true,
        message: "Threshold removed successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing threshold:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove threshold.",
        severity: "error",
      });
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const filteredThresholds = useMemo(() => {
    return thresholds.filter((t) => t.value.toString().includes(searchTerm));
  }, [thresholds, searchTerm]);

  const visibleRows = useMemo(
    () =>
      stableSort(filteredThresholds, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredThresholds, order, orderBy, page, rowsPerPage]
  );

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: "linear-gradient(120deg, #ffffff 0%, #f0f0f0 100%)",
          borderRadius: "12px",
          transition: "all 0.3s",
          "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#3f51b5",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <NotificationsActiveIcon
            sx={{ mr: 1, verticalAlign: "middle", color: "#f50057" }}
          />
          Alert Thresholds
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#555" }}>
          Set up budget alert thresholds for your projects. You'll receive
          notifications when expenses approach or exceed these levels.
        </Typography>

        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            py: 2,
            backgroundColor: "rgba(63, 81, 181, 0.08)",
            borderRadius: "8px",
            mb: 2,
          }}
        >
          <TextField
            size="small"
            label="Search Thresholds"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2, width: "40%" }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            size="small"
            label="New Threshold (%)"
            type="number"
            value={newThreshold}
            onChange={(e) => setNewThreshold(e.target.value)}
            sx={{ width: "30%", mr: 1 }}
          />
          <Button
            variant="contained"
            onClick={addThreshold}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": { backgroundColor: "#45a049" },
            }}
          >
            Add
          </Button>
        </Toolbar>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{ minWidth: 650 }}
                aria-labelledby="tableTitle"
                size="medium"
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <TableRow hover tabIndex={-1} key={row.id}>
                      <TableCell align="right">{row.value}</TableCell>
                      <TableCell>
                        {new Date(row.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeThreshold(row)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredThresholds.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default AlertThresholds;
