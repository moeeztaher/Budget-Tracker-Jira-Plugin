import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar, Typography, Paper,
  Tooltip, TextField, FormControlLabel, Switch, Grid, Card, CardContent, Chip, IconButton, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle}
from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SellIcon from '@mui/icons-material/Sell';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import RadarIcon from '@mui/icons-material/Radar';
import CheckIcon from '@mui/icons-material/Check';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EuroIcon from '@mui/icons-material/Euro';
import { visuallyHidden } from '@mui/utils';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ExpenseReportModal from '../components/ExpenseReportModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6666'];

// different colors for different types of issues
const getChipColor = (issueType) => {
  switch (issueType.toLowerCase()) {
    case 'epic':
      return 'primary';
    case 'bug':
      return 'error';
    case 'story':
      return 'success';
    default:
      return 'default';
  }
};

// react mui data table sorting functions
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'budgetName', numeric: false, disablePadding: false, label: 'Expense Name' },
  { id: 'budgetCategory', numeric: false, disablePadding: false, label: 'Category' },
  { id: 'amount', numeric: true, disablePadding: false, label: 'Amount' },
  { id: 'selectedIssues', numeric: false, disablePadding: false, label: 'Associated Issues/Epics' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

function EnhancedTableToolbar(props) {
  const { categoryFilter, setCategoryFilter, amountFilter, setAmountFilter, issueFilter, setIssueFilter, onExportCSVClick } = props;

  return (
    <Toolbar sx={{
      pl: { sm: 2 },
      pr: { xs: 1, sm: 1 },
      backgroundColor: 'rgba(63, 81, 181, 0.08)',
      borderRadius: '8px',
      mb: 2
    }}>
     <Typography
       sx={{
         flex: '1 1 100%',
         color: '#3f51b5',
         fontWeight: 'bold',
         textAlign: 'left', // Ensure text is left-aligned
       }}
       variant="h6"
       id="tableTitle"
       component="div"
     >
       Expense Data
     </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <TextField
          label="Max Amount"
          type="number"
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <TextField
          label="Issue/Epic"
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export to CSV">
          <IconButton onClick={onExportCSVClick}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  categoryFilter: PropTypes.string.isRequired,
  setCategoryFilter: PropTypes.func.isRequired,
  amountFilter: PropTypes.string.isRequired,
  setAmountFilter: PropTypes.func.isRequired,
  issueFilter: PropTypes.string.isRequired,
  setIssueFilter: PropTypes.func.isRequired,
  onExportCSVClick: PropTypes.func.isRequired,
};

export default function BudgetDashboardPage({ projectKey }) {
  const [budgetData, setBudgetData] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesByPhase, setExpensesByPhase] = useState([]);
  const [expensesTrend, setExpensesTrend] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('budgetName');
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchBudgetData();
    fetchExpenseData();
    fetchAllExpenses();
  }, [projectKey]);

  const fetchBudgetData = async () => {
    try {
      const response = await fetch(`/jira/rest/budget/1.0/budget/overview/${projectKey}`);
      const data = await response.json();
      setBudgetData(data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const fetchExpenseData = async () => {
    try {
      const categoryResponse = await fetch(`/jira/rest/budget/1.0/budget/expenses/by-category/${projectKey}`);
      const categoryData = await categoryResponse.json();
      setExpensesByCategory(categoryData);

      const phaseResponse = await fetch(`/jira/rest/budget/1.0/budget/expenses/by-phase/${projectKey}`);
      const phaseData = await phaseResponse.json();
      setExpensesByPhase(phaseData);
    } catch (error) {
      console.error('Error fetching expense data:', error);
    }
  };

  const fetchAllExpenses = async () => {
    try {
      const response = await fetch(`/jira/rest/budget/1.0/budget/expenses/all/${projectKey}`);
      const data = await response.json();
      setExpenses(data);

      // process data for trends chart
      const trendData = processExpenseTrends(data);
      setExpensesTrend(trendData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

   const expensesThisMonth = useMemo(() => {
      const currentMonth = dayjs().month();
      const currentYear = dayjs().year();
      return expenses.reduce((total, expense) => {
        const expenseDate = dayjs(expense.date);
        if (expenseDate.month() === currentMonth && expenseDate.year() === currentYear) {
          return total + expense.amount;
        }
        return total;
      }, 0);
    }, [expenses]);

   const handleEditClick = (row) => {
     setEditingId(row.id);
     setEditedRow({
       ...row,
       selectedIssues: [...row.selectedIssues]
     });
   };

   const handleEditCancel = () => {
     setEditingId(null);
     setEditedRow({});
   };

   const fetchBudgetOverview = async () => {
       try {
         const response = await fetch(`/jira/rest/budget/1.0/budget/overview/${projectKey}`);
         if (response.ok) {
           const data = await response.json();
           setBudgetData(prevData => ({
             ...prevData,
             totalExpenses: data.totalExpenses,
             remainingBudget: data.remainingBudget
           }));
         } else {
           console.error('Failed to fetch budget overview');
         }
       } catch (error) {
         console.error('Error fetching budget overview:', error);
       }
     };

     const fetchExpensesByCategory = async () => {
         try {
           const response = await fetch(`/jira/rest/budget/1.0/budget/expenses/by-category/${projectKey}`);
           if (response.ok) {
             const data = await response.json();
             setExpensesByCategory(data);
           } else {
             console.error('Failed to fetch expenses by category');
           }
         } catch (error) {
           console.error('Error fetching expenses by category:', error);
         }
       };

       const fetchExpensesByPhase = async () => {
         try {
           const response = await fetch(`/jira/rest/budget/1.0/budget/expenses/by-phase/${projectKey}`);
           if (response.ok) {
             const data = await response.json();
             setExpensesByPhase(data);
           } else {
             console.error('Failed to fetch expenses by phase');
           }
         } catch (error) {
           console.error('Error fetching expenses by phase:', error);
         }
       };

       const fetchExpensesTrend = async () => {
         try {
           const response = await fetch(`/jira/rest/budget/1.0/budget/expenses/all/${projectKey}`);
           if (response.ok) {
             const data = await response.json();
             const processedData = processExpenseTrends(data);
             setExpensesTrend(processedData);
           } else {
             console.error('Failed to fetch expenses trend');
           }
         } catch (error) {
           console.error('Error fetching expenses trend:', error);
         }
       };

      const refreshAllData = async () => {
         await Promise.all([
           fetchBudgetOverview(),
           fetchExpensesByCategory(),
           fetchExpensesByPhase(),
           fetchExpensesTrend()
         ]);
       };

   const handleEditSave = async () => {
       try {
         const response = await fetch(`/jira/rest/budget/1.0/budget/${editedRow.id}`, {
           method: 'PUT',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(editedRow),
         });
         if (response.ok) {
           const updatedExpense = await response.json();
           setExpenses(prevExpenses => prevExpenses.map(expense =>
             expense.id === updatedExpense.id ? updatedExpense : expense
           ));
           setEditingId(null);
           setEditedRow({});

           // Refresh all data
           await refreshAllData();
         } else {
           console.error('Failed to update expense');
         }
       } catch (error) {
         console.error('Error updating expense:', error);
       }
     };

  const handleIssueRemove = (expenseId, issueKey) => {
    if (editingId === expenseId) {
      setEditedRow(prevEditedRow => ({
        ...prevEditedRow,
        selectedIssues: prevEditedRow.selectedIssues.filter(issue => issue.key !== issueKey)
      }));
    }
  };

    const handleDeleteClick = (id) => {
      setDeletingId(id);
      setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
      try {
        const response = await fetch(`/jira/rest/budget/1.0/budget/${deletingId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const updatedExpenses = expenses.filter(expense => expense.id !== deletingId);
          setExpenses(updatedExpenses);
          setDeleteConfirmOpen(false);
        } else {
          console.error('Failed to delete expense');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    };

  const processExpenseTrends = (data) => {
    const trends = data.reduce((acc, expense) => {
      const date = dayjs(expense.date).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {});

    return Object.entries(trends).map(([date, amount]) => ({ date, amount })).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

   const filteredExpenses = useMemo(() => {
      return expenses.filter(expense =>
        (!categoryFilter || expense.budgetCategory.toLowerCase().includes(categoryFilter.toLowerCase())) &&
        (!amountFilter || expense.amount <= parseFloat(amountFilter)) &&
        (!issueFilter || expense.selectedIssues.some(issue => issue.key.toLowerCase().includes(issueFilter.toLowerCase())))
      );
    }, [expenses, categoryFilter, amountFilter, issueFilter]);

    const visibleRows = useMemo(() =>
      filteredExpenses
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [filteredExpenses, order, orderBy, page, rowsPerPage]
    );

    const handleExportCSVClick = () => {
      setIsModalOpen(true);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
    };

    if (!budgetData) {
      return <Typography>Loading...</Typography>;
    }

    return (
    <React.Fragment>
      <Paper elevation={3} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
          {[
            { title: 'Total Budget', value: budgetData.totalBudget, color: '#3f51b5', icon: <EuroIcon /> },
            { title: 'Total Expenses', value: budgetData.totalExpenses, color: '#f50057', icon: <SellIcon /> },
            { title: 'Remaining Budget', value: budgetData.remainingBudget, color: '#4caf50', icon: <AccountBalanceIcon /> },
            { title: 'Expenses This Month', value: expensesThisMonth, color: '#ff9800', icon: <DateRangeIcon /> },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 6px 25px 0 rgba(0,0,0,0.15)' }
              }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>{item.title}</Typography>
                    <Typography variant="h5" component="h2" sx={{ color: item.color, fontWeight: 'bold' }}>
                       €{item.value.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ color: item.color, fontSize: 40 }}>
                    {item.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{
              padding: '20px',
              height: '400px',
              transition: 'all 0.3s',
              '&:hover': { transform: 'scale(1.02)' }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', display: 'flex', alignItems: 'center' }}>
                <PieChartIcon sx={{ marginRight: 1 }} />
                Expenses by Category
              </Typography>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `€${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" align="center" sx={{ marginTop: 10 }}>
                  No expense data available. Start by creating some expenses!
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{
              padding: '20px',
              height: '400px',
              transition: 'all 0.3s',
              '&:hover': { transform: 'scale(1.02)' }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ marginRight: 1 }} />
                Expenses by Project Phase (Epic)
              </Typography>
              {expensesByPhase.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={expensesByPhase}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip formatter={(value) => `€${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8">
                      {expensesByPhase.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" align="center" sx={{ marginTop: 10 }}>
                  No project phase data available. Create some epics and associate expenses with them!
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{
                      padding: '20px',
                      height: '400px',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', display: 'flex', alignItems: 'center' }}>
                        <TimelineIcon sx={{ marginRight: 1 }} />
                        Expense Trends
                      </Typography>
                      {expensesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="90%">
                          <LineChart
                            data={expensesTrend}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => `€${value.toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography variant="body1" align="center" sx={{ marginTop: 10 }}>
                          No trend data available. Add more expenses to see trends!
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{
                      padding: '20px',
                      height: '400px',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', display: 'flex', alignItems: 'center' }}>
                        <RadarIcon sx={{ marginRight: 1 }} />
                        Expenses by Phase (Radar)
                      </Typography>
                      {expensesByPhase.length > 0 ? (
                        <ResponsiveContainer width="100%" height="90%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expensesByPhase}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                            <Radar name="Expenses" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Legend />
                            <RechartsTooltip formatter={(value) => `€${value.toLocaleString()}`} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography variant="body1" align="center" sx={{ marginTop: 10 }}>
                          No phase data available. Add expenses to different project phases to see the radar chart!
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
        </Grid>

        <Paper sx={{
          width: '100%',
          mb: 2,
          borderRadius: '12px',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s',
          '&:hover': { boxShadow: '0 6px 25px 0 rgba(0,0,0,0.15)' }
        }}>
          <EnhancedTableToolbar
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            amountFilter={amountFilter}
            setAmountFilter={setAmountFilter}
            issueFilter={issueFilter}
            setIssueFilter={setIssueFilter}
            onExportCSVClick={handleExportCSVClick}
          />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
              <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow hover key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.08)' } }}>
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          value={editedRow.budgetName}
                          onChange={(e) => setEditedRow({...editedRow, budgetName: e.target.value})}
                          fullWidth
                        />
                      ) : row.budgetName}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          value={editedRow.budgetCategory}
                          onChange={(e) => setEditedRow({...editedRow, budgetCategory: e.target.value})}
                          fullWidth
                        />
                      ) : row.budgetCategory}
                    </TableCell>
                    <TableCell align="right">
                      {editingId === row.id ? (
                        <TextField
                          type="number"
                          value={editedRow.amount}
                          onChange={(e) => setEditedRow({...editedRow, amount: parseFloat(e.target.value)})}
                          fullWidth
                        />
                      ) : `€${row.amount.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id
                        ? editedRow.selectedIssues.map(issue => (
                            <Chip
                              key={issue.key}
                              label={issue.key}
                              color={getChipColor(issue.type)}
                              onDelete={() => handleIssueRemove(row.id, issue.key)}
                              sx={{ margin: '2px' }}
                            />
                          ))
                        : row.selectedIssues.map(issue => (
                            <Chip
                              key={issue.key}
                              label={issue.key}
                              color={getChipColor(issue.type)}
                              sx={{ margin: '2px' }}
                            />
                          ))
                      }
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          value={editedRow.description}
                          onChange={(e) => setEditedRow({...editedRow, description: e.target.value})}
                          fullWidth
                          multiline
                        />
                      ) : row.description}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <TextField
                          type="date"
                          value={dayjs(editedRow.date).format('YYYY-MM-DD')}
                          onChange={(e) => setEditedRow({...editedRow, date: e.target.value})}
                          fullWidth
                        />
                      ) : dayjs(row.date).format('YYYY-MM-DD')}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <>
                          <IconButton onClick={handleEditSave}><CheckIcon /></IconButton>
                          <IconButton onClick={handleEditCancel}><CancelIcon /></IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditClick(row)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteClick(row.id)}><DeleteIcon /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
        <ExpenseReportModal open={isModalOpen} onClose={handleModalClose} expenses={expenses} />
      </Paper>
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={() => setDeleteConfirmOpen(false)}>Cancel</IconButton>
          <IconButton onClick={handleDeleteConfirm} color="error">Delete</IconButton>
        </DialogActions>
      </Dialog>
      </React.Fragment>
    );
  }

  BudgetDashboardPage.propTypes = {
    projectKey: PropTypes.string.isRequired,
  };
