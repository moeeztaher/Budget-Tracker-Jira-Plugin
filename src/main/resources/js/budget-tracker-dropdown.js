AJS.toInit(function() {
    // Find the existing Budget Tracker menu item
    var $menuTrigger = AJS.$('#budget-tracker-dropdown-trigger');

    if ($menuTrigger.length) {
        // Create a container for our React app
        var dropdownHtml = '<div id="react-app-root"></div>';

        // Append the container after the trigger
        $menuTrigger.after(dropdownHtml);

        // Set up the trigger for the dropdown
        $menuTrigger.attr({
            'aria-controls': 'budget-tracker-dropdown',
            'aria-haspopup': 'true'
        }).addClass('aui-dropdown2-trigger');

        // Initialize the React app
        if (window.renderReactApp) {
            window.renderReactApp();
        } else {
            console.error('renderReactApp function not found');
        }

        console.log('Budget Tracker dropdown initialized');
    } else {
        console.error('Budget Tracker menu item not found');
    }
});