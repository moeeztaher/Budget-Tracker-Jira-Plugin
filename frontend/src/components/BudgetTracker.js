import React, { useState, useEffect } from "react";
import BudgetForm from "./BudgetForm";
import SetTotalBudgetModal from "./SetTotalBudgetModal";

const BudgetTracker = ({ projectKey, onboardingOpen, setOnboardingOpen }) => {
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectKey) {
      setError("Project key is not provided.");
      return;
    }
    const fetchData = async () => {
      try {
        await checkTotalBudget(projectKey);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Failed to initialize budget tracker");
      }
    };
    fetchData();
  }, [projectKey]);

  const checkTotalBudget = async (projectKey) => {
    console.log("Checking total budget for project:", projectKey);
    try {
      const response = await fetch(
        `/jira/rest/budget/1.0/budget/remaining/${projectKey}`
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Received data:", data);
      if (data === null || data === 0) {
        console.log("Budget not set, showing modal");
        setShowSetBudgetModal(true);
        setOnboardingOpen(true); // trigger the onboarding process if budget is not set
      } else {
        console.log("Budget set, updating remaining budget");
        setRemainingBudget(data);
      }
    } catch (error) {
      console.error("Error checking total budget:", error);
      setError("Failed to fetch remaining budget");
      setShowSetBudgetModal(true);
      setOnboardingOpen(true); // trigger onboarding even if error
    }
  };

  const handleSetTotalBudget = async (newTotalBudget) => {
    console.log("Setting new total budget:", newTotalBudget);
    try {
      const response = await fetch("/jira/rest/budget/1.0/budget/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectKey,
          totalBudget: parseFloat(newTotalBudget),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Total budget set successfully");
      setRemainingBudget(parseFloat(newTotalBudget));
      setShowSetBudgetModal(false);
      setOnboardingOpen(false);
    } catch (error) {
      console.error("Error setting total budget:", error);
      setError("Failed to set total budget");
    }
  };

  const handleBudgetItemSubmit = (budgetItem) => {
    console.log("Submitting budget item:", budgetItem);
    setRemainingBudget((prevBudget) => {
      if (prevBudget !== null) {
        return prevBudget - budgetItem.amount;
      }
      return prevBudget;
    });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (remainingBudget === null && !showSetBudgetModal) {
    return <div>Loading...</div>;
  }

  // stop set budget modal from overlapping onboarding modal
  return (
    <div>
      {showSetBudgetModal && !onboardingOpen ? (
        <SetTotalBudgetModal
          open={showSetBudgetModal}
          onClose={() => setShowSetBudgetModal(false)}
          onSubmit={handleSetTotalBudget}
          projectKey={projectKey}
        />
      ) : (
        <BudgetForm
          onSubmit={handleBudgetItemSubmit}
          projectKey={projectKey}
          remainingBudget={remainingBudget !== null ? remainingBudget : 0}
        />
      )}
    </div>
  );
};

export default BudgetTracker;
