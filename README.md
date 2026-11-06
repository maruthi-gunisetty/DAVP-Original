# E-Commerce Sales & Customer Behaviour Analysis (DAVP)

> **College Project Submission**  
> **Author:** Maruthi Gunisetty  
> **Repository:** [github.com/maruthi-gunisetty/DAVP-Original](https://github.com/maruthi-gunisetty/DAVP-Original)

---

## 📌 Project Overview
This project is an end-to-end **Data Analysis and Visualization Project (DAVP)** that extracts actionable business intelligence from e-commerce transaction logs. It analyzes purchasing patterns, customer lifetime value, market geography, and seasonal trends through statistical modeling and modern interactive visual dashboards.

The project features:
1. **Interactive Web Dashboard:** A responsive, dark/light themed business intelligence interface with live filtering, Chart.js visualizations, RFM matrices, and CSV upload capabilities.
2. **Jupyter Notebook (`.ipynb`):** Step-by-step scientific computing workflow demonstrating NumPy, Pandas, Matplotlib, Seaborn, and Plotly.
3. **Automated Data Pipeline (`process_data.py`):** Standalone data processing and feature engineering engine generating precomputed analytics matrices.

---

## 🚀 Quick Start: Running the Website

### Option 1: One-Click Local Server (Recommended)
Run the included Python server to launch the dashboard at `http://localhost:8000`:
```bash
python server.py
```
*Your browser will automatically open to `http://localhost:8000`.*

### Option 2: Direct File Open
You can also directly double-click `index.html` in Windows Explorer or open it in any web browser. Data is bundled with zero external server or build prerequisites.

### Option 3: GitHub Pages
Since `index.html` resides at the repository root, you can enable **GitHub Pages** in your repository settings (`Settings -> Pages -> Deploy from a branch -> main / (root)`) for instant global hosting.

---

## 📊 Key Insights & Analytics Included

### 1. Executive KPIs
- **Total Net Revenue:** $105,146.28 across 3,200 orders
- **Total Units Sold:** 6,368 items (1.99 units/line average)
- **Active Customers:** 450 unique accounts
- **Average Order Value (AOV):** $32.86
- **Repeat Purchase Rate:** 97.8%

### 2. RFM Customer Segmentation
Applies rule-based quartile scoring on three behavioral vectors:
- **Recency ($R$):** Days elapsed since the customer's latest transaction.
- **Frequency ($F$):** Total count of unique orders placed.
- **Monetary ($M$):** Aggregate transaction expenditure.

Customers are grouped into actionable clusters:
- 🟢 **High-value:** Core champions with top quartile engagement and spend.
- 🔵 **Loyal / active:** Frequent purchasers who buy consistently.
- ⚪ **Regular:** Standard baseline shoppers.
- 🔴 **At-risk / inactive:** Formerly active accounts that haven't purchased recently.

### 3. Outlier Detection (IQR Method)
Computes quartiles ($Q_1$, $Q_3$), Interquartile Range ($IQR = Q_3 - Q_1$), and standard statistical fences ($[Q_1 - 1.5 \times IQR, \; Q_3 + 1.5 \times IQR]$) to isolate pricing and volume anomalies.

### 4. Correlation Analysis
Calculates the Pearson correlation matrix and covariance between transaction Quantity, Unit Price, and Gross Sales.

---

## 📁 Repository File Structure

```text
├── index.html                                              # Interactive Web Application
├── app.js                                                  # Client-side reactivity, Chart.js & state logic
├── styles.css                                              # Glassmorphism theme, dark/light styling
├── server.py                                               # Local web server runner
├── process_data.py                                         # Pure Python data generation & analytics pipeline
├── data/
│   ├── ecommerce_dataset.csv                               # Cleaned transaction dataset (3,200 rows)
│   ├── ecommerce_data.json                                 # Precomputed analytics matrix payload
│   └── data.js                                             # CORS-safe browser data module
├── Ecommerce_Sales_and_Customer_Behaviour_Analysis_with_Outputs.ipynb  # Complete Colab/Jupyter notebook
└── README.md                                               # Project documentation
```

---

## 🛠️ Technology Stack
- **Python:** Standard Library, NumPy, Pandas, Matplotlib, Seaborn, Plotly
- **Frontend:** HTML5, Modern CSS3, Tailwind CSS, Chart.js, Lucide/Heroicons
- **Version Control:** Git & GitHub

