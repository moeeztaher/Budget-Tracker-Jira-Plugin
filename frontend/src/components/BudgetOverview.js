import React, { useState, useEffect } from "react";
import { Typography, Paper, Grid, Card, CardContent, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FilterListIcon from "@mui/icons-material/FilterList";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#FF6666",
];

const BudgetOverview = ({ projectKey }) => {
  const [budgetData, setBudgetData] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesByPhase, setExpensesByPhase] = useState([]);
  const [expensesTrend, setExpensesTrend] = useState([]);

  useEffect(() => {
    fetchBudgetData();
    fetchExpenseData();
    fetchExpensesTrend();
  }, [projectKey]);

  const fetchBudgetData = async () => {
    try {
      const response = await fetch(
        `/jira/rest/budget/1.0/budget/overview/${projectKey}`
      );
      const data = await response.json();
      setBudgetData(data);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  const fetchExpenseData = async () => {
    try {
      const categoryResponse = await fetch(
        `/jira/rest/budget/1.0/budget/expenses/by-category/${projectKey}`
      );
      const categoryData = await categoryResponse.json();
      setExpensesByCategory(categoryData);

      const phaseResponse = await fetch(
        `/jira/rest/budget/1.0/budget/expenses/by-phase/${projectKey}`
      );
      const phaseData = await phaseResponse.json();
      setExpensesByPhase(phaseData);
    } catch (error) {
      console.error("Error fetching expense data:", error);
    }
  };

  const fetchExpensesTrend = async () => {
    try {
      const response = await fetch(
        `/jira/rest/budget/1.0/budget/expenses/trend/${projectKey}`
      );
      const data = await response.json();
      setExpensesTrend(data);
    } catch (error) {
      console.error("Error fetching expenses trend:", error);
    }
  };

  if (!budgetData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: "20px" }}>
      <Grid container spacing={3} sx={{ marginBottom: "20px" }}>
        {[
          {
            title: "Total Budget",
            value: budgetData.totalBudget,
            color: "#3f51b5",
            icon: <AttachMoneyIcon />,
          },
          {
            title: "Total Expenses",
            value: budgetData.totalExpenses,
            color: "#f50057",
            icon: <ShoppingCartIcon />,
          },
          {
            title: "Remaining Budget",
            value: budgetData.remainingBudget,
            color: "#4caf50",
            icon: <AccountBalanceIcon />,
          },
          {
            title: "Task Count",
            value: budgetData.taskCount,
            color: "#ff9800",
            icon: <FilterListIcon />,
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 25px 0 rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ color: item.color, fontWeight: "bold" }}
                  >
                    {typeof item.value === "number"
                      ? `€${item.value.toLocaleString()}`
                      : item.value}
                  </Typography>
                </Box>
                <Box sx={{ color: item.color, fontSize: 40 }}>{item.icon}</Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: "20px", height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: "20px", height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Project Phase
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expensesByPhase}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {expensesByPhase.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: "20px", height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Expense Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={expensesTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                <Legend />
                {expensesTrend.length > 0 &&
                  Object.keys(expensesTrend[0])
                    .filter((key) => key !== "date")
                    .map((key, index) => (
                      <Line
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        key={key}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: "20px", height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Phase (Radar)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={expensesByPhase}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                <Radar
                  name="Expenses"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetOverview;
