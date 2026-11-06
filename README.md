# Ecommerce Sales and Customer Behaviour Analytics (DAVP)

## Academic Project Submission
Author: Maruthi Gunisetty
Repository: https://github.com/maruthi-gunisetty/DAVP-Original

---

## Project Overview
This project is an end to end Data Analysis and Visualization Project (DAVP) that extracts actionable business intelligence from ecommerce transaction logs. It analyzes purchasing patterns, customer lifetime value, market geography, and seasonal trends through statistical modeling and modern interactive visual dashboards.

The project features:
1. Interactive Web Dashboard: A responsive business intelligence interface with live filtering, Chart.js visualizations, RFM matrices, and CSV upload capabilities.
2. Jupyter Notebook: Step by step scientific computing workflow demonstrating NumPy, Pandas, Matplotlib, Seaborn, and Plotly.
3. Automated Data Pipeline: Standalone data processing and feature engineering engine generating precomputed analytics matrices.

---

## Quick Start: Running the Website

### Option 1: One Click Local Server (Recommended)
Run the included Python server to launch the dashboard at http://localhost:8000
```bash
python server.py
```
Your browser will automatically open to http://localhost:8000

### Option 2: Direct File Open
You can also directly double click index.html in Windows Explorer or open it in any web browser. Data is bundled with zero external server or build prerequisites.

### Option 3: GitHub Pages
Since index.html resides at the repository root, you can enable GitHub Pages in your repository settings for instant global hosting.

---

## Key Insights and Analytics Included

### 1. Executive KPIs
* Total Net Revenue: $105,146.28 across 3,200 orders
* Total Units Sold: 6,368 items (1.99 units per line average)
* Active Customers: 450 unique accounts
* Average Order Value: $32.86
* Repeat Purchase Rate: 97.8 percent

### 2. RFM Customer Segmentation
Applies rule based quartile scoring on three behavioral vectors:
* Recency: Days elapsed since the customer latest transaction.
* Frequency: Total count of unique orders placed.
* Monetary: Aggregate transaction expenditure.

Customers are grouped into actionable clusters:
* High Value: Core champions with top quartile engagement and spend.
* Loyal Active: Frequent purchasers who buy consistently.
* Regular: Standard baseline shoppers.
* At Risk: Formerly active accounts that have not purchased recently.

### 3. Outlier Detection (IQR Method)
Computes quartiles Q1 and Q3, Interquartile Range, and standard statistical fences to isolate pricing and volume anomalies.

### 4. Correlation Analysis
Calculates the Pearson correlation matrix and covariance between transaction Quantity, Unit Price, and Gross Sales.

---

## Technology Stack
* Python: Standard Library, NumPy, Pandas, Matplotlib, Seaborn, Plotly
* Frontend: HTML5, Modern CSS3, Tailwind CSS, Chart.js, Vector SVGs
* Version Control: Git and GitHub
