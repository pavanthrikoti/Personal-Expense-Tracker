# Personal Expense Tracker

Welcome to my **Personal Expense Tracker**, a sleek and robust web application designed to help you manage your finances effortlessly! Built with modern web technologies and optimized for performance and accessibility, this project showcases my skills as a software developer.

Check it out live at: **[https://personal-expense-tracker-free.vercel.app/](https://personal-expense-tracker-free.vercel.app/)**.

---

## Overview

This app allows users to track daily expenses, set budgets, analyze spending patterns, and switch between light/dark themes. It’s a fully responsive, offline-capable tool, with data stored locally in the browser, making it perfect for personal use. I developed this project to demonstrate my ability to build practical, user-friendly applications with a strong focus on **performance optimization**, **web accessibility**, and **clean, maintainable code**.

---

## Features

* **Add & Edit Expenses**: Log expenses with amount, description, category, date, and currency.
* **Delete & Clear**: Remove individual or all expenses with a custom confirmation modal for enhanced user experience.
* **Filter & Search**: Easily filter expenses by category or search through descriptions for quick retrieval.
* **Budget Management**: Set and monitor your monthly budget with real-time status updates, indicating remaining funds or overspending.
* **Dynamic Analytics**: View insightful spending analytics including top categories, daily averages, and total spending for various periods (Last 7 Days, Last 30 Days, All Time) visualized with an interactive pie chart.
* **Theme Toggle**: Seamlessly switch between light and dark modes for comfortable viewing in any environment.
* **Multi-Currency Support**: Track expenses in INR (₹), USD ($), and EUR (€).
* **Responsive Design**: Optimized for optimal viewing and interaction across all devices, from desktop to tablet and mobile.
* **Motivational Quotes**: A dynamic motivational quote is displayed on larger screens to inspire financial discipline.

---

## Technologies Used

This project highlights a range of concepts and tools I’ve mastered, with a strong emphasis on modern web development practices:

* **HTML5**: Structured the application with semantic HTML5 tags for improved accessibility and SEO.
* **CSS3**: Utilized custom CSS variables for theme management, gradients for visual appeal, media queries for responsive design, and subtle animations for a polished user interface.
* **JavaScript (ES6+)**: Implemented the core application logic, efficient event handling, and robust data management.
* **Chart.js**: Integrated for dynamic and responsive pie chart visualizations of spending data, with optimizations for performance.
* **Local Storage API**: Employed for client-side data persistence, securely saving expenses, budget, theme preferences, and currency settings offline.
* **DOM Manipulation**: Dynamically updated the user interface in real-time based on user interactions and data changes.
* **Event Listeners**: Extensively used to handle various user interactions, including form submissions, button clicks, and dynamic content updates.
* **Responsive Design**: Achieved through a combination of CSS Grid, Flexbox, and well-defined media query breakpoints (768px, 480px).
* **Web Accessibility (A11y)**: Implemented best practices including:
    * Correct usage of ARIA attributes (`role`, `aria-modal`, `aria-labelledby`, `aria-live`) for enhanced screen reader compatibility.
    * Improved color contrast ratios for better readability across themes.
    * Focus management for modals to ensure a logical tab order and prevent focus trapping.
* **Performance Optimization**: Applied techniques like:
    * `defer` attribute for non-critical script loading to improve initial page load speed.
    * Caching computed CSS styles to minimize forced reflows and boost runtime performance.
    * Inline SVG icons to reduce HTTP requests and optimize image delivery.
* **Vercel**: Leveraged for seamless and efficient deployment, demonstrating proficiency in modern CI/CD workflows.

---

## Project Structure

* **`index.html`**: The main HTML file, providing the overall structure of the application, including navigation, expense forms, summary, analytics, and expense list sections.
* **`styles.css`**: Contains all custom CSS rules, defining theme variables, preloader animations, and comprehensive responsive styling for all components.
* **`script.js`**: Houses the core JavaScript logic, managing expense data, handling user interactions, updating analytics, and controlling UI elements like the theme toggle and custom modals.

---

## Usage

1.  **Add an Expense**:
    * Fill in the form with the amount, description, category, date, and selected currency.
    * Click "Add Expense" to log your spending.
2.  **View Summary**:
    * The summary section provides an immediate overview of your total expenses and the number of recorded expenses.
3.  **Set Budget**:
    * Enter your desired monthly budget amount in the input field and click "Set Budget" to activate budget tracking.
    * Monitor your spending against your budget with real-time status updates.
4.  **Analyze Spending**:
    * Navigate to the "Analytics" section.
    * Switch between "Last 7 Days", "Last 30 Days", and "All Time" tabs to view spending trends, top categories, and daily averages, all visualized in a clear pie chart.
5.  **Filter/Search Expenses**:
    * Use the category dropdown to filter your expense list by specific categories.
    * Utilize the search bar to quickly find expenses by description or date.
6.  **Toggle Theme**:
    * Click the sun/moon icon in the header to effortlessly switch between light and dark modes.

---

## Deployment

This project is live at **[https://personal-expense-tracker-free.vercel.app/](https://personal-expense-tracker-free.vercel.app/)**, deployed using Vercel's powerful platform. The deployment process is streamlined through **Continuous Deployment (CD)** directly from the GitHub repository, ensuring that every code update is automatically built and deployed.

---

## Challenges & Solutions

* **Performance Optimization (TBT, INP, Reflows)**:
    * **Challenge**: Initial Lighthouse audits revealed high Total Blocking Time (TBT) and Interaction to Next Paint (INP) during user interactions, indicating a sluggish UI due to JavaScript execution and forced reflows.
    * **Solution**: Implemented `defer` attribute for script loading, preventing render blocking. Refactored JavaScript to cache computed styles and use `requestAnimationFrame` for DOM updates, significantly reducing layout thrashing and improving responsiveness. Replaced external image assets with inline SVGs to minimize HTTP requests.
* **Web Accessibility (A11y)**:
    * **Challenge**: Identified issues with ARIA attribute usage and insufficient color contrast, impacting usability for assistive technologies and visually impaired users.
    * **Solution**: Enhanced color contrast for key text elements (e.g., `--text-secondary`) across both themes. Implemented comprehensive ARIA roles (`dialog`, `aria-modal`, `aria-labelledby`) and focus management for the custom confirmation modal, ensuring it's fully navigable and understandable by screen readers. Added `aria-live="polite"` to dynamic message alerts.
* **Chart Loading**:
    * **Challenge**: Ensuring Chart.js loads efficiently and updates smoothly without impacting performance.
    * **Solution**: Dynamically loaded Chart.js with `defer` and optimized chart re-rendering logic to only update when necessary, using cached theme colors.
* **Theme Consistency**:
    * **Challenge**: Maintaining a consistent and visually appealing design across light and dark modes.
    * **Solution**: Employed CSS variables (`:root` and `[data-theme="dark"]`) to define theme-specific colors and properties, allowing for easy and consistent theme switching.
* **Data Persistence**:
    * **Challenge**: Ensuring user data (expenses, budget, preferences) is saved and loaded reliably between sessions.
    * **Solution**: Successfully implemented the Local Storage API for robust offline data persistence.
* **Responsiveness**:
    * **Challenge**: Adapting the layout and functionality seamlessly across a wide range of screen sizes.
    * **Solution**: Designed with a mobile-first approach, extensively utilizing CSS Grid, Flexbox, and media queries to create a fully responsive and adaptive user interface.

---

## Future Improvements

* Add export/import functionality for data backup and migration.
* Implement bank sync or API integration for real-time transaction updates (requires backend development).
* Enhance analytics with more detailed reports, trend analysis over longer periods, and predictive insights.
* Add user authentication for multiple profiles and cloud synchronization of data.
* Explore advanced accessibility features for even broader inclusivity.

---

## Contributing

Feel free to fork this repository, submit issues, or send pull requests. I’d love to collaborate and improve this tool!

---

## Contact

Built with ❤️ by **Pavan Thrikoti Pottupalli**. Connect with me on [LinkedIn](https://www.linkedin.com/in/pavan-thrikoti-pottupalli-330822254/) or email me at [pavanthrikoti@gmail.com](mailto:pavanthrikoti@gmail.com) for feedback or opportunities.

---

This project reflects my skills in front-end development, problem-solving, performance optimization, and web accessibility, making it a strong portfolio piece for a software developer role. Give it a try and let me know your thoughts! 🚀
