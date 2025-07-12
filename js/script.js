// Expense Tracker JavaScript with Analytics

// Global variables
let expenses = []; // Initialize as empty array, will be populated from localStorage
let currentFilter = '';
let currentAnalyticsPeriod = 'last7days'; // Changed default analytics period
let isDarkMode = localStorage.getItem('darkMode') === 'true'; // Initialized from localStorage
let currency = localStorage.getItem('currency') || '₹'; // Initialized from localStorage
let budget = parseFloat(localStorage.getItem('budget')) || 0; // Initialized from localStorage
let chartInstance = null;
let resolveModalPromise; // To handle custom modal confirmation
let chartLabelColor = '#2d3748'; // Variable to cache chart label color, initialized for light mode
let previouslyFocusedElement = null; // To store the element that had focus before modal opened

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseAmount = document.getElementById('expense-amount');
const expenseDescription = document.getElementById('expense-description');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');
const currencySelect = document.getElementById('currency-select');
const expensesList = document.getElementById('expenses-list');
const totalAmount = document.getElementById('total-amount');
const expenseCount = document.getElementById('expense-count');
const filterCategory = document.getElementById('filter-category');
const searchInput = document.getElementById('search-expenses');
const clearAllBtn = document.getElementById('clear-all-btn');
const budgetInput = document.getElementById('budget-input');
const budgetStatus = document.getElementById('budget-status');
const noExpenses = document.getElementById('no-expenses');
const messageDiv = document.getElementById('message');
const themeToggle = document.getElementById('theme-toggle');
const tabBtns = document.querySelectorAll('.tab-btn');
const topCategoryEl = document.getElementById('top-category');
const dailyAverageEl = document.getElementById('daily-average');
const periodTotalEl = document.getElementById('period-total');
const expenseChartCanvas = document.getElementById('expense-chart');
const chartNoDataMessage = document.getElementById('chart-no-data');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const preloader = document.getElementById('preloader');

// Custom Modal Elements
const customConfirmModal = document.getElementById('custom-confirm-modal');
const modalMessage = document.getElementById('modal-title'); // Changed to modal-title as per HTML update
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Motivational Quote Element
const motivationalQuoteEl = document.getElementById('motivational-quote');


// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Load expenses from localStorage first
    try {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    } catch (e) {
        console.error("Error parsing expenses from localStorage:", e);
        showMessage("Failed to load expenses. Local storage might be corrupted.", "error");
        expenses = []; // Reset expenses to prevent further errors
    }

    initializeTheme();
    setTodayDate();
    displayExpenses();
    updateSummary();
    updateAnalytics();
    updateBudgetStatus();
    setMotivationalQuote(); // Set the motivational quote
    // Ensure currencySelect value is set after currency is loaded
    if (currencySelect) {
        currencySelect.value = currency;
    }
    setupEventListeners();
    // Hide preloader
    if (preloader) {
        preloader.classList.add('hidden');
    }
}

// Theme Management
function initializeTheme() {
    if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        // Update chart label color when theme changes
        updateChartLabelColor();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        // Update chart label color when theme changes
        updateChartLabelColor();
    }
    try {
        localStorage.setItem('darkMode', isDarkMode);
    } catch (e) {
        console.error("Error saving dark mode preference to localStorage:", e);
        showMessage("Failed to save theme preference.", "error");
    }
    showMessage(`${isDarkMode ? 'Dark' : 'Light'} mode enabled!`, 'success');
    // Re-render chart to apply new label color
    updateChart(getExpensesForPeriod(currentAnalyticsPeriod));
}

// Update the cached chart label color based on current theme
function updateChartLabelColor() {
    // Using requestAnimationFrame to ensure the DOM has updated with the new theme
    // before trying to read the computed style, minimizing forced reflows.
    requestAnimationFrame(() => {
        chartLabelColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    });
}

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    if (expenseDate) {
        expenseDate.value = today;
    }
}

// Event Listeners
function setupEventListeners() {
    if (expenseForm) expenseForm.addEventListener('submit', addExpense);
    if (filterCategory) filterCategory.addEventListener('change', filterExpenses);
    if (searchInput) searchInput.addEventListener('input', (e) => searchExpenses(e.target.value));
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllExpenses);
    const setBudgetBtn = document.getElementById('set-budget-btn');
    if (setBudgetBtn) setBudgetBtn.addEventListener('click', setBudget);
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            currency = e.target.value;
            try {
                localStorage.setItem('currency', currency);
            } catch (e) {
                console.error("Error saving currency preference to localStorage:", e);
                showMessage("Failed to save currency preference.", "error");
            }
            displayExpenses();
            updateSummary();
            updateAnalytics();
            updateBudgetStatus();
        });
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            tabBtns.forEach(tab => tab.setAttribute('aria-selected', tab === e.target));
            currentAnalyticsPeriod = e.target.dataset.period;
            updateAnalytics();
        });
    });

    // Navigation toggle for mobile
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                if (window.innerWidth <= 768 && navToggle && navMenu) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Custom Modal Event Listeners
    if (customConfirmModal && modalMessage && modalConfirmBtn && modalCancelBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            customConfirmModal.classList.remove('visible');
            // Remove ARIA attributes when modal closes
            customConfirmModal.removeAttribute('role');
            customConfirmModal.removeAttribute('aria-modal');
            customConfirmModal.removeAttribute('aria-labelledby');
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus(); // Restore focus
                previouslyFocusedElement = null;
            }
            if (resolveModalPromise) resolveModalPromise(true);
        });

        modalCancelBtn.addEventListener('click', () => {
            customConfirmModal.classList.remove('visible');
            // Remove ARIA attributes when modal closes
            customConfirmModal.removeAttribute('role');
            customConfirmModal.removeAttribute('aria-modal');
            customConfirmModal.removeAttribute('aria-labelledby');
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus(); // Restore focus
                previouslyFocusedElement = null;
            }
            if (resolveModalPromise) resolveModalPromise(false);
        });

        // Trap focus within the modal
        customConfirmModal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = customConfirmModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstFocusableEl = focusableElements[0];
                const lastFocusableEl = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusableEl) {
                        firstFocusableEl.focus();
                        e.preventDefault();
                    }
                }
            }
            if (e.key === 'Escape') {
                modalCancelBtn.click(); // Allow escape to close modal
            }
        });
    }
}

// Function to show custom confirmation modal
function showCustomConfirm(message) {
    if (!customConfirmModal || !modalMessage) {
        console.error("Custom confirmation modal elements not found.");
        return Promise.resolve(false); // Fallback to false if modal not available
    }

    // Store the currently focused element before opening the modal
    previouslyFocusedElement = document.activeElement;

    modalMessage.textContent = message;
    customConfirmModal.classList.add('visible');
    
    // Add ARIA attributes when modal is visible
    customConfirmModal.setAttribute('role', 'dialog');
    customConfirmModal.setAttribute('aria-modal', 'true');
    customConfirmModal.setAttribute('aria-labelledby', 'modal-title');

    // Move focus to the first interactive element in the modal
    modalConfirmBtn.focus();

    return new Promise(resolve => {
        resolveModalPromise = resolve;
    });
}


// Add new expense
function addExpense(e) {
    e.preventDefault();
    
    // Ensure DOM elements exist before accessing their values
    if (!expenseAmount || !expenseDescription || !expenseCategory || !expenseDate) {
        console.error("Missing expense form elements.");
        showMessage("An internal error occurred. Please refresh.", "error");
        return;
    }

    const amount = parseFloat(expenseAmount.value);
    const description = expenseDescription.value.trim();
    const category = expenseCategory.value;
    const date = expenseDate.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (isNaN(amount) || amount <= 0) {
        showMessage('Please enter a valid amount greater than 0', 'error');
        expenseAmount.focus();
        return;
    }
    
    if (!description) {
        showMessage('Please enter a description', 'error');
        expenseDescription.focus();
        return;
    }
    
    if (!category) {
        showMessage('Please select a category', 'error');
        expenseCategory.focus();
        return;
    }
    
    if (!date) {
        showMessage('Please select a date', 'error');
        expenseDate.focus();
        return;
    }
    
    if (date > today) {
        showMessage('Future dates are not allowed', 'error');
        expenseDate.focus();
        return;
    }
    
    const expense = {
        id: Date.now(),
        amount: amount,
        description: description,
        category: category,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    expenses.unshift(expense);
    saveExpenses();
    displayExpenses();
    updateSummary();
    updateAnalytics();
    updateBudgetStatus();
    expenseForm.reset();
    setTodayDate();
    showMessage('Expense added successfully!', 'success');
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) {
        console.warn(`Attempted to edit non-existent expense with ID: ${id}`);
        showMessage('Expense not found for editing.', 'error');
        return;
    }

    // Ensure DOM elements exist before setting their values
    if (!expenseAmount || !expenseDescription || !expenseCategory || !expenseDate) {
        console.error("Missing expense form elements for editing.");
        showMessage("An internal error occurred during edit. Please refresh.", "error");
        return;
    }

    expenseAmount.value = expense.amount;
    expenseDescription.value = expense.description;
    expenseCategory.value = expense.category;
    expenseDate.value = expense.date;

    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    displayExpenses();
    updateSummary();
    updateAnalytics();
    updateBudgetStatus();
    showMessage('Edit the expense and click Add Expense to save changes', 'success');
}

// Display expenses
function displayExpenses() {
    if (!expensesList || !noExpenses) {
        console.error("Missing expenses list or no expenses element.");
        return;
    }
    expensesList.innerHTML = '';
    
    const filteredExpenses = getFilteredExpenses();
    
    if (filteredExpenses.length === 0) {
        noExpenses.style.display = 'block';
        return;
    }
    
    noExpenses.style.display = 'none';
    
    filteredExpenses.forEach(expense => {
        const expenseItem = createExpenseItem(expense);
        if (expenseItem) { // Ensure item was created successfully
            expensesList.appendChild(expenseItem);
        }
    });
}

// Create expense item HTML
function createExpenseItem(expense) {
    if (!expense || typeof expense.id === 'undefined') {
        console.error("Invalid expense object provided to createExpenseItem:", expense);
        return null; // Return null if expense is invalid
    }

    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    expenseItem.setAttribute('data-id', expense.id);
    
    const formattedDate = formatDate(expense.date);
    const categoryDisplay = getCategoryDisplay(expense.category);
    
    expenseItem.innerHTML = `
        <div class="expense-details">
            <div class="expense-description">${escapeHTML(expense.description)}</div>
            <div class="expense-meta">
                <span class="expense-category">${escapeHTML(categoryDisplay)}</span>
                <span class="expense-date">📅 ${escapeHTML(formattedDate)}</span>
            </div>
        </div>
        <div class="expense-amount">${currency}${expense.amount.toFixed(2)}</div>
        <div class="expense-actions">
            <button class="edit-btn" onclick="editExpense(${expense.id})">✏️ Edit</button>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">🗑️ Delete</button>
        </div>
    `;
    
    return expenseItem;
}

// Delete expense
async function deleteExpense(id) {
    const userConfirmed = await showCustomConfirm('Are you sure you want to delete this expense?');
    if (userConfirmed) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        displayExpenses();
        updateSummary();
        updateAnalytics();
        updateBudgetStatus();
        showMessage('Expense deleted successfully!', 'success');
    }
}

// Clear all expenses
async function clearAllExpenses() {
    if (expenses.length === 0) {
        showMessage('No expenses to clear!', 'error');
        return;
    }
    
    const userConfirmed = await showCustomConfirm('Are you sure you want to delete ALL expenses? This cannot be undone!');
    if (userConfirmed) {
        expenses = [];
        saveExpenses();
        displayExpenses();
        updateSummary();
        updateAnalytics();
        updateBudgetStatus();
        if (filterCategory) filterCategory.value = '';
        if (searchInput) searchInput.value = '';
        currentFilter = '';
        showMessage('All expenses cleared!', 'success');
    }
}

// Set budget
function setBudget() {
    if (!budgetInput) {
        console.error("Budget input element not found.");
        showMessage("An internal error occurred with budget input. Please refresh.", "error");
        return;
    }
    const budgetValue = parseFloat(budgetInput.value);
    if (isNaN(budgetValue) || budgetValue < 0) { // Budget can be 0, but not negative
        showMessage('Please enter a valid budget amount (0 or greater)', 'error');
        return;
    }
    budget = budgetValue;
    try {
        localStorage.setItem('budget', budget);
    } catch (e) {
        console.error("Error saving budget to localStorage:", e);
        showMessage("Failed to save budget. Local storage might be full or disallowed.", "error");
    }
    updateBudgetStatus();
    showMessage('Budget set successfully!', 'success');
    budgetInput.value = '';
}

// Update budget status
function updateBudgetStatus() {
    if (!budgetStatus) {
        console.error("Budget status element not found.");
        return;
    }
    const monthlyExpenses = getExpensesForPeriod('last30days').reduce((sum, expense) => sum + expense.amount, 0); // Using last30days for budget
    if (budget === 0) {
        budgetStatus.textContent = 'No budget set';
        budgetStatus.style.color = 'var(--text-secondary)';
        return;
    }
    const remaining = budget - monthlyExpenses;
    budgetStatus.textContent = `Budget: ${currency}${budget.toFixed(2)} | Spent: ${currency}${monthlyExpenses.toFixed(2)} | Remaining: ${currency}${remaining.toFixed(2)}`;
    if (remaining < 0) {
        budgetStatus.style.color = '#e53e3e';
    } else if (remaining < budget * 0.1) {
        budgetStatus.style.color = '#d69e2e';
    } else {
        budgetStatus.style.color = 'var(--accent)';
    }
}

// Filter expenses by category
function filterExpenses() {
    if (filterCategory) {
        currentFilter = filterCategory.value;
    } else {
        console.warn("Filter category element not found.");
        currentFilter = ''; // Reset filter if element is missing
    }
    displayExpenses();
    updateSummary();
}

// Search expenses
function searchExpenses(query) {
    if (!searchInput || !expensesList || !noExpenses) {
        console.error("Missing search elements.");
        return;
    }

    const searchQuery = query.trim().toLowerCase();
    
    if (!searchQuery) {
        displayExpenses(); // Revert to current category filter if search is empty
        updateSummary();
        return;
    }
    
    const searchResults = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery) ||
        getCategoryDisplay(expense.category).toLowerCase().includes(searchQuery) ||
        expense.date.includes(searchQuery)
    );
    
    expensesList.innerHTML = '';
    
    if (searchResults.length === 0) {
        noExpenses.style.display = 'block';
        noExpenses.innerHTML = '<p>No expenses found matching your search.</p>';
        return;
    }
    
    noExpenses.style.display = 'none';
    
    searchResults.forEach(expense => {
        const expenseItem = createExpenseItem(expense);
        if (expenseItem) {
            expensesList.appendChild(expenseItem);
        }
    });
}

// Get filtered expenses (used by displayExpenses and updateSummary)
function getFilteredExpenses() {
    let filtered = expenses;

    if (currentFilter) {
        filtered = filtered.filter(expense => expense.category === currentFilter);
    }

    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchQuery) {
        filtered = filtered.filter(expense =>
            expense.description.toLowerCase().includes(searchQuery) ||
            getCategoryDisplay(expense.category).toLowerCase().includes(searchQuery) ||
            expense.date.includes(searchQuery)
        );
    }
    
    return filtered;
}

// Update summary display
function updateSummary() {
    if (!totalAmount || !expenseCount) {
        console.error("Missing summary elements.");
        return;
    }
    const filteredExpenses = getFilteredExpenses();
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = filteredExpenses.length;
    
    totalAmount.textContent = `${currency}${total.toFixed(2)}`;
    expenseCount.textContent = count;
}

// Analytics Functions
function updateAnalytics() {
    if (!topCategoryEl || !dailyAverageEl || !periodTotalEl) {
        console.error("Missing analytics display elements.");
        return;
    }

    const periodExpenses = getExpensesForPeriod(currentAnalyticsPeriod);
    
    const topCategory = getTopCategory(periodExpenses);
    const dailyAverage = getDailyAverage(periodExpenses, currentAnalyticsPeriod);
    const periodTotal = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    topCategoryEl.innerHTML = `
        <span class="category-name">${topCategory ? escapeHTML(getCategoryDisplay(topCategory)) : 'No data'}</span>
        <span class="category-amount">${currency}${topCategory ? periodExpenses.filter(exp => exp.category === topCategory).reduce((sum, exp) => sum + exp.amount, 0).toFixed(2) : '0.00'}</span>
    `;
    dailyAverageEl.textContent = `${currency}${dailyAverage.toFixed(2)}`;
    periodTotalEl.textContent = `${currency}${periodTotal.toFixed(2)}`;
    
    updateChart(periodExpenses);
}

// Get expenses for specific period
function getExpensesForPeriod(period) {
    const now = new Date();
    let startDate;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of current day

    switch (period) {
        case 'last7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate.setHours(0, 0, 0, 0); // Start of the day 7 days ago
            break;
        case 'last30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            startDate.setHours(0, 0, 0, 0); // Start of the day 30 days ago
            break;
        case 'alltime':
            startDate = new Date(0); // Epoch time
            break;
        default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days
            startDate.setHours(0, 0, 0, 0);
    }
    
    return expenses.filter(expense => {
        const expenseDateObj = new Date(expense.date);
        expenseDateObj.setHours(0, 0, 0, 0); // Normalize expense date to start of day for accurate comparison
        return expenseDateObj >= startDate && expenseDateObj <= endDate;
    });
}

// Get top spending category
function getTopCategory(periodExpenses) {
    if (periodExpenses.length === 0) return null;
    
    const categoryTotals = {};
    periodExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b
    );
}

// Calculate daily average
function getDailyAverage(periodExpenses, period) {
    if (periodExpenses.length === 0) return 0;
    
    const total = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    let days;
    const now = new Date();

    switch (period) {
        case 'last7days':
            days = 7;
            break;
        case 'last30days':
            days = 30;
            break;
        case 'alltime':
            // Calculate days from the earliest expense to now
            if (expenses.length === 0) return 0;
            const earliestDate = new Date(Math.min(...expenses.map(e => new Date(e.date).getTime())));
            days = Math.ceil((now - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
            if (days === 0) days = 1; // Prevent division by zero if all expenses are on the same day
            break;
        default:
            days = 7;
    }
    
    return total / days;
}

// Update chart visualization
function updateChart(periodExpenses) {
    if (!expenseChartCanvas || !chartNoDataMessage) {
        console.error("Chart canvas or no data message element not found.");
        return;
    }

    const ctx = expenseChartCanvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D rendering context for canvas.");
        expenseChartCanvas.style.display = 'none';
        chartNoDataMessage.style.display = 'block';
        chartNoDataMessage.textContent = 'Chart not supported or failed to render.';
        return;
    }
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (periodExpenses.length === 0) {
        expenseChartCanvas.style.display = 'none';
        chartNoDataMessage.style.display = 'block';
        return;
    }

    expenseChartCanvas.style.display = 'block';
    chartNoDataMessage.style.display = 'none';

    const categoryTotals = {};
    periodExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals).map(category => getCategoryDisplay(category));
    const data = Object.values(categoryTotals);
    const backgroundColors = [
        '#48bb78', // Green
        '#e53e3e', // Red
        '#2b6cb0', // Blue
        '#f6e05e', // Yellow
        '#9f7aea', // Purple
        '#ed8936', // Orange
        '#4fd1c5', // Teal
        '#ed64a6', // Pink
        '#a0aec0', // Gray
        '#68d391'  // Light Green
    ];

    try {
        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: true,
                    animateScale: true
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: chartLabelColor, // Use the cached color
                            font: {
                                size: window.innerWidth <= 480 ? 14 : 16
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${currency}${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error initializing Chart.js:", e);
        expenseChartCanvas.style.display = 'none';
        chartNoDataMessage.style.display = 'block';
        chartNoDataMessage.textContent = 'Error loading chart data.';
    }
}

// Utility Functions
function saveExpenses() {
    try {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (e) {
        console.error("Error saving expenses to localStorage:", e);
        showMessage("Failed to save expenses. Local storage might be full or disallowed.", "error");
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn("Invalid date string provided to formatDate:", dateString);
            return dateString;
        }
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString;
    }
}

function getCategoryDisplay(category) {
    const categoryIcons = {
        'food': '🍕 Food & Dining',
        'transport': '🚗 Transportation',
        'entertainment': '🎬 Entertainment',
        'shopping': '🛍️ Shopping',
        'bills': '💡 Bills & Utilities',
        'health': '🏥 Healthcare',
        'education': '📚 Education',
        'other': '📦 Other'
    };
    return categoryIcons[category] || '📦 Other';
}

// Basic HTML escaping for user-provided text to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function showMessage(message, type = 'success') {
    if (!messageDiv) {
        console.error("Message display element not found.");
        return;
    }
    
    clearTimeout(messageDiv.hideTimeout);

    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    messageDiv.classList.add('show');

    messageDiv.hideTimeout = setTimeout(() => {
        messageDiv.classList.remove('show');
        const onTransitionEnd = () => {
            messageDiv.classList.add('hidden');
            messageDiv.removeEventListener('transitionend', onTransitionEnd);
        };
        // Use requestAnimationFrame to ensure the transition has started before listening for its end
        requestAnimationFrame(() => {
            messageDiv.addEventListener('transitionend', onTransitionEnd, { once: true });
        });
    }, 3000);
}

// Motivational Quotes
const motivationalQuotes = [
    "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
    "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
    "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought, and so broadens the mind. – T.T. Munger",
    "Financial freedom is available to those who learn about it and work for it. – Robert Kiyosaki",
    "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
    "Every time you make a choice, you are either choosing to build your future or choosing to destroy it. – Unknown",
    "The best way to predict the future is to create it. – Peter Drucker",
    "Money is a terrible master but an excellent servant. – P.T. Barnum",
    "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for. – Robert Kiyosaki"
];

function setMotivationalQuote() {
    if (motivationalQuoteEl) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        motivationalQuoteEl.textContent = motivationalQuotes[randomIndex];
    }
}
