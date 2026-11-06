import os
import json
import csv
import math
import random
from datetime import datetime, timedelta
from collections import defaultdict

def run_pipeline():
    print("Running pure-Python DAVP data generation & analysis pipeline...")
    rnd = random.Random(42)
    n = 3200
    start_date = datetime(2024, 1, 1)

    products = [
        ("P001", "Wireless Mouse", "Electronics", 18.0),
        ("P002", "USB-C Cable", "Electronics", 9.5),
        ("P003", "Water Bottle", "Home & Living", 14.0),
        ("P004", "Notebook Set", "Stationery", 7.0),
        ("P005", "Desk Lamp", "Home & Living", 29.0),
        ("P006", "Bluetooth Speaker", "Electronics", 42.0),
        ("P007", "Backpack", "Accessories", 35.0),
        ("P008", "Coffee Mug", "Home & Living", 11.0),
        ("P009", "Pen Pack", "Stationery", 5.0),
        ("P010", "Phone Stand", "Accessories", 12.0),
    ]
    prod_probs = [0.14, 0.15, 0.11, 0.12, 0.08, 0.07, 0.08, 0.09, 0.08, 0.08]

    countries = ["United Kingdom", "Germany", "France", "Spain", "India", "Netherlands"]
    country_probs = [0.48, 0.14, 0.12, 0.09, 0.10, 0.07]

    qty_choices = [1, 2, 3, 4, 5]
    qty_probs = [0.46, 0.27, 0.15, 0.08, 0.04]

    raw_records = []
    for i in range(n):
        # Pick product
        p_idx = rnd.choices(range(len(products)), weights=prod_probs)[0]
        sku, p_name, category, base_price = products[p_idx]
        qty = rnd.choices(qty_choices, weights=qty_probs)[0]
        
        # Gaussian price variation
        price = max(1.0, rnd.gauss(base_price, base_price * 0.08))
        price = round(price, 2)
        
        day_offset = rnd.randint(0, 364)
        hour = rnd.randint(8, 22)
        minute = rnd.randint(0, 59)
        sec = rnd.randint(0, 59)
        inv_dt = start_date + timedelta(days=day_offset, hours=hour, minutes=minute, seconds=sec)

        cust_id = rnd.randint(1001, 1450)
        country = rnd.choices(countries, weights=country_probs)[0]

        raw_records.append({
            "InvoiceNo": f"INV{100000+i}",
            "StockCode": sku,
            "Description": p_name,
            "Category": category,
            "Quantity": qty,
            "InvoiceDate": inv_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "UnitPrice": price,
            "CustomerID": cust_id,
            "Country": country
        })

    # Simulate 12 missing values as demonstrated in notebook
    missing_indices = rnd.sample(range(n), 12)
    for idx in missing_indices[:6]:
        raw_records[idx]["CustomerID"] = ""
    for idx in missing_indices[6:]:
        raw_records[idx]["Description"] = ""

    os.makedirs("data", exist_ok=True)

    # Save raw CSV
    csv_path = os.path.join("data", "ecommerce_dataset.csv")
    fieldnames = ["InvoiceNo", "StockCode", "Description", "Category", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country"]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(raw_records)

    # Clean & Analyze
    clean_data = []
    for r in raw_records:
        rec = dict(r)
        # Handle Description
        if not rec["Description"]:
            rec["Description"] = "Unknown"
        # Customer ID
        if rec["CustomerID"] == "":
            rec["CustomerID"] = None
        else:
            rec["CustomerID"] = int(rec["CustomerID"])

        rec["Sales"] = round(rec["Quantity"] * rec["UnitPrice"], 2)
        dt = datetime.strptime(rec["InvoiceDate"], "%Y-%m-%d %H:%M:%S")
        rec["dt"] = dt
        rec["YearMonth"] = dt.strftime("%Y-%m")
        rec["DayOfWeek"] = dt.strftime("%A")
        rec["MonthName"] = dt.strftime("%b")
        clean_data.append(rec)

    # KPIs
    total_revenue = round(sum(r["Sales"] for r in clean_data), 2)
    total_units = sum(r["Quantity"] for r in clean_data)
    unique_invoices = len(set(r["InvoiceNo"] for r in clean_data))
    cust_set = set(r["CustomerID"] for r in clean_data if r["CustomerID"] is not None)
    unique_customers = len(cust_set)

    # Group by invoice for AOV
    inv_totals = defaultdict(float)
    for r in clean_data:
        inv_totals[r["InvoiceNo"]] += r["Sales"]
    avg_order_value = round(sum(inv_totals.values()) / len(inv_totals), 2)

    # Repeat rate
    cust_order_counts = defaultdict(set)
    for r in clean_data:
        if r["CustomerID"] is not None:
            cust_order_counts[r["CustomerID"]].add(r["InvoiceNo"])
    repeat_customers = sum(1 for c, orders in cust_order_counts.items() if len(orders) > 1)
    repeat_rate = round((repeat_customers / len(cust_order_counts)) * 100, 2)

    # Monthly Sales Trend
    monthly_map = defaultdict(lambda: {"revenue": 0.0, "units": 0, "orders": set()})
    for r in clean_data:
        m = r["YearMonth"]
        monthly_map[m]["revenue"] += r["Sales"]
        monthly_map[m]["units"] += r["Quantity"]
        monthly_map[m]["orders"].add(r["InvoiceNo"])

    sorted_months = sorted(monthly_map.keys())
    monthly_data = [
        {
            "month": m,
            "revenue": round(monthly_map[m]["revenue"], 2),
            "units": monthly_map[m]["units"],
            "orders": len(monthly_map[m]["orders"])
        }
        for m in sorted_months
    ]

    # Day of Week Trend
    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_rev = {day: 0.0 for day in weekday_order}
    for r in clean_data:
        dow_rev[r["DayOfWeek"]] += r["Sales"]
    dow_data = [{"day": d, "revenue": round(dow_rev[d], 2)} for d in weekday_order]

    # Product Performance
    prod_map = defaultdict(lambda: {"revenue": 0.0, "units": 0, "orders": set(), "category": ""})
    for r in clean_data:
        desc = r["Description"]
        prod_map[desc]["revenue"] += r["Sales"]
        prod_map[desc]["units"] += r["Quantity"]
        prod_map[desc]["orders"].add(r["InvoiceNo"])
        prod_map[desc]["category"] = r["Category"]

    prod_data = [
        {
            "name": desc,
            "revenue": round(vals["revenue"], 2),
            "units": vals["units"],
            "orders": len(vals["orders"]),
            "category": vals["category"]
        }
        for desc, vals in prod_map.items()
    ]
    prod_data.sort(key=lambda x: x["revenue"], reverse=True)

    # Category Breakdown
    cat_map = defaultdict(lambda: {"revenue": 0.0, "units": 0, "orders": set()})
    for r in clean_data:
        c = r["Category"]
        cat_map[c]["revenue"] += r["Sales"]
        cat_map[c]["units"] += r["Quantity"]
        cat_map[c]["orders"].add(r["InvoiceNo"])

    cat_data = [
        {
            "category": c,
            "revenue": round(vals["revenue"], 2),
            "units": vals["units"],
            "orders": len(vals["orders"])
        }
        for c, vals in cat_map.items()
    ]
    cat_data.sort(key=lambda x: x["revenue"], reverse=True)

    # Country Performance
    country_map = defaultdict(lambda: {"revenue": 0.0, "orders": set(), "customers": set()})
    for r in clean_data:
        cn = r["Country"]
        country_map[cn]["revenue"] += r["Sales"]
        country_map[cn]["orders"].add(r["InvoiceNo"])
        if r["CustomerID"] is not None:
            country_map[cn]["customers"].add(r["CustomerID"])

    country_data = [
        {
            "country": cn,
            "revenue": round(vals["revenue"], 2),
            "orders": len(vals["orders"]),
            "customers": len(vals["customers"])
        }
        for cn, vals in country_map.items()
    ]
    country_data.sort(key=lambda x: x["revenue"], reverse=True)

    # RFM Analysis
    snapshot_date = max(r["dt"] for r in clean_data) + timedelta(days=1)
    cust_rfm = {}
    for r in clean_data:
        cid = r["CustomerID"]
        if cid is None:
            continue
        if cid not in cust_rfm:
            cust_rfm[cid] = {
                "latest_dt": r["dt"],
                "orders": set(),
                "total_spend": 0.0
            }
        if r["dt"] > cust_rfm[cid]["latest_dt"]:
            cust_rfm[cid]["latest_dt"] = r["dt"]
        cust_rfm[cid]["orders"].add(r["InvoiceNo"])
        cust_rfm[cid]["total_spend"] += r["Sales"]

    rfm_rows = []
    for cid, info in cust_rfm.items():
        recency = (snapshot_date - info["latest_dt"]).days
        frequency = len(info["orders"])
        monetary = round(info["total_spend"], 2)
        rfm_rows.append({
            "CustomerID": str(cid),
            "Recency": recency,
            "Frequency": frequency,
            "Monetary": monetary
        })

    def assign_quartile_scores(items, key, reverse=False):
        # Sort items by key
        sorted_indices = sorted(range(len(items)), key=lambda i: items[i][key], reverse=reverse)
        n_items = len(items)
        scores = [0] * n_items
        for rank, orig_idx in enumerate(sorted_indices):
            # 1 to 4 score
            quartile = min(4, int(rank / (n_items / 4)) + 1)
            scores[orig_idx] = quartile
        return scores

    r_scores = assign_quartile_scores(rfm_rows, "Recency", reverse=True)
    f_scores = assign_quartile_scores(rfm_rows, "Frequency", reverse=False)
    m_scores = assign_quartile_scores(rfm_rows, "Monetary", reverse=False)

    segment_counts = defaultdict(int)
    segment_stats = defaultdict(lambda: {"count": 0, "recency_sum": 0, "frequency_sum": 0, "monetary_sum": 0.0})

    for i, row in enumerate(rfm_rows):
        r_sc = r_scores[i]
        f_sc = f_scores[i]
        m_sc = m_scores[i]
        row["R_score"] = r_sc
        row["F_score"] = f_sc
        row["M_score"] = m_sc
        row["RFM_score"] = f"{r_sc}{f_sc}{m_sc}"

        if r_sc >= 3 and f_sc >= 3 and m_sc >= 3:
            seg = "High Value"
        elif r_sc >= 3 and f_sc >= 2:
            seg = "Loyal Active"
        elif r_sc <= 2 and f_sc <= 2:
            seg = "At Risk"
        else:
            seg = "Regular"

        row["Segment"] = seg
        segment_counts[seg] += 1
        segment_stats[seg]["count"] += 1
        segment_stats[seg]["recency_sum"] += row["Recency"]
        segment_stats[seg]["frequency_sum"] += row["Frequency"]
        segment_stats[seg]["monetary_sum"] += row["Monetary"]

    rfm_segments_stats = []
    for seg, st in segment_stats.items():
        cnt = st["count"]
        rfm_segments_stats.append({
            "Segment": seg,
            "customers": cnt,
            "avg_recency": round(st["recency_sum"] / cnt, 1),
            "avg_frequency": round(st["frequency_sum"] / cnt, 2),
            "avg_monetary": round(st["monetary_sum"] / cnt, 2),
            "total_revenue": round(st["monetary_sum"], 2)
        })
    rfm_segments_stats.sort(key=lambda x: x["total_revenue"], reverse=True)

    rfm_rows.sort(key=lambda x: x["Monetary"], reverse=True)
    top_customers = rfm_rows[:35]

    # Outlier IQR analysis
    def get_percentile(data_list, p):
        s = sorted(data_list)
        idx = (len(s) - 1) * p
        lower = math.floor(idx)
        upper = math.ceil(idx)
        weight = idx - lower
        return s[lower] * (1 - weight) + s[upper] * weight

    outlier_metrics = []
    for col in ["Quantity", "UnitPrice", "Sales"]:
        vals = [r[col] for r in clean_data]
        mean_val = sum(vals) / len(vals)
        variance = sum((x - mean_val) ** 2 for x in vals) / (len(vals) - 1)
        std_val = math.sqrt(variance)
        q1 = get_percentile(vals, 0.25)
        q3 = get_percentile(vals, 0.75)
        iqr = q3 - q1
        low = q1 - 1.5 * iqr
        high = q3 + 1.5 * iqr
        outliers_count = sum(1 for x in vals if x < low or x > high)
        outlier_metrics.append({
            "column": col,
            "q1": round(q1, 2),
            "q3": round(q3, 2),
            "iqr": round(iqr, 2),
            "lower_bound": round(low, 2),
            "upper_bound": round(high, 2),
            "outliers": outliers_count,
            "mean": round(mean_val, 2),
            "std": round(std_val, 2),
            "min": round(min(vals), 2),
            "max": round(max(vals), 2)
        })

    # Correlation Matrix
    def calc_corr(x, y):
        n = len(x)
        mx = sum(x) / n
        my = sum(y) / n
        num = sum((x[i] - mx) * (y[i] - my) for i in range(n))
        den = math.sqrt(sum((x[i] - mx) ** 2 for i in range(n)) * sum((y[i] - my) ** 2 for i in range(n)))
        return round(num / den, 4) if den != 0 else 0.0

    qty_list = [r["Quantity"] for r in clean_data]
    price_list = [r["UnitPrice"] for r in clean_data]
    sales_list = [r["Sales"] for r in clean_data]

    corr = {
        "Quantity": {
            "Quantity": 1.0,
            "UnitPrice": calc_corr(qty_list, price_list),
            "Sales": calc_corr(qty_list, sales_list)
        },
        "UnitPrice": {
            "Quantity": calc_corr(price_list, qty_list),
            "UnitPrice": 1.0,
            "Sales": calc_corr(price_list, sales_list)
        },
        "Sales": {
            "Quantity": calc_corr(sales_list, qty_list),
            "UnitPrice": calc_corr(sales_list, price_list),
            "Sales": 1.0
        }
    }

    # Sample transactions
    sample_records = [
        {
            "InvoiceNo": r["InvoiceNo"],
            "StockCode": r["StockCode"],
            "Description": r["Description"],
            "Category": r["Category"],
            "Quantity": r["Quantity"],
            "UnitPrice": r["UnitPrice"],
            "Sales": r["Sales"],
            "InvoiceDate": r["dt"].strftime("%Y-%m-%d %H:%M"),
            "CustomerID": r["CustomerID"] if r["CustomerID"] else "Guest",
            "Country": r["Country"]
        }
        for r in clean_data[:250]
    ]

    payload = {
        "kpis": {
            "totalRevenue": total_revenue,
            "totalUnits": total_units,
            "uniqueOrders": unique_invoices,
            "uniqueCustomers": unique_customers,
            "avgOrderValue": avg_order_value,
            "repeatRate": repeat_rate,
            "totalRows": len(clean_data)
        },
        "monthly": monthly_data,
        "dayOfWeek": dow_data,
        "products": prod_data,
        "categories": cat_data,
        "countries": country_data,
        "rfm": {
            "counts": dict(segment_counts),
            "stats": rfm_segments_stats,
            "topCustomers": top_customers
        },
        "outliers": outlier_metrics,
        "correlation": corr,
        "sampleData": sample_records
    }

    json_path = os.path.join("data", "ecommerce_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    # Also output as data.js for zero-configuration file:// browser preview (avoids CORS block)
    js_path = os.path.join("data", "data.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("window.DAVP_INITIAL_DATA = " + json.dumps(payload) + ";")

    print(f"Success! Processed {len(clean_data)} rows.")
    print(f"Total revenue: ${total_revenue:,.2f} across {unique_invoices:,} orders.")
    print(f"Exported to {json_path}, {js_path}, and {csv_path}")

if __name__ == "__main__":
    run_pipeline()
