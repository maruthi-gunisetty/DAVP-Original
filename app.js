/**
 * DAVP: Ecommerce Sales and Customer Behaviour Intelligence
 * Theme: Royal Plum (#3E0856) and Radiant Amber (#FAAE62)
 * Author: Maruthi Gunisetty
 */

(function () {
  'use strict';

  // Global State
  let data = null;
  let allRecords = [];
  let filteredRecords = [];
  let currentPage = 1;
  const pageSize = 20;

  // Chart References
  let chartMonthly = null;
  let chartDow = null;
  let chartCategory = null;
  let chartProducts = null;
  let chartRfm = null;
  let chartCountry = null;

  // Brand Color Palette (#FAAE62 and #3E0856)
  const colors = {
    gold: '#FAAE62',
    goldLight: 'rgba(250, 174, 98, 0.22)',
    goldHover: '#e89849',
    plum: '#3E0856',
    plumLight: 'rgba(62, 8, 86, 0.45)',
    plumSurface: 'rgba(62, 8, 86, 0.25)',
    amethyst: '#c084fc',
    amethystLight: 'rgba(192, 132, 252, 0.22)',
    slate: '#94a3b8',
    categoryColors: [
      '#FAAE62',
      '#c084fc',
      '#e89849',
      '#9333ea',
      '#fcd39a',
      '#a855f7'
    ],
    segmentColors: {
      'High Value': '#FAAE62',
      'Loyal Active': '#c084fc',
      'Regular': '#94a3b8',
      'At Risk': '#f87171'
    }
  };

  // Helper: Format Currency
  function formatCurrency(val) {
    return '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Helper: Format Integer
  function formatNumber(val) {
    return Number(val || 0).toLocaleString();
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initTabNavigation();
    initEvents();

    if (window.DAVP_INITIAL_DATA) {
      data = window.DAVP_INITIAL_DATA;
      setupDashboard();
    } else {
      try {
        const response = await fetch('data/ecommerce_data.json');
        data = await response.json();
        setupDashboard();
      } catch (err) {
        console.warn('Direct fetch failed, waiting or using fallback:', err);
      }
    }
  });

  // Setup Dashboard
  function setupDashboard() {
    if (!data) return;
    allRecords = data.sampleData || [];
    filteredRecords = [...allRecords];

    renderKPIs(data.kpis);
    initCharts();
    renderRfmTable(data.rfm);
    renderCountryCards(data.countries);
    renderOutliers(data.outliers);
    renderCorrelationMatrix(data.correlation);
    renderTable();
  }

  // 1. Render Executive KPIs
  function renderKPIs(kpis) {
    if (!kpis) return;
    document.getElementById('kpi-revenue').textContent = formatCurrency(kpis.totalRevenue);
    document.getElementById('kpi-units').textContent = formatNumber(kpis.totalUnits);
    document.getElementById('kpi-orders').textContent = formatNumber(kpis.uniqueOrders);
    document.getElementById('kpi-customers').textContent = formatNumber(kpis.uniqueCustomers);
    document.getElementById('kpi-aov').textContent = formatCurrency(kpis.avgOrderValue);
    document.getElementById('kpi-repeat').textContent = (kpis.repeatRate || 0) + '%';
  }

  // 2. Initialize Charts
  function initCharts() {
    initMonthlyChart();
    initDowChart();
    initCategoryChart();
    initProductsChart();
    initRfmChart();
    initCountryChart();
  }

  // Monthly Revenue Chart (Gold primary line, Amethyst order volume)
  function initMonthlyChart() {
    const ctx = document.getElementById('chart-monthly');
    if (!ctx) return;
    if (chartMonthly) chartMonthly.destroy();

    const labels = data.monthly.map(m => m.month.replace('-', ' '));
    const revenues = data.monthly.map(m => m.revenue);
    const orders = data.monthly.map(m => m.orders);

    chartMonthly = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monthly Revenue ($)',
            data: revenues,
            borderColor: colors.gold,
            backgroundColor: colors.goldLight,
            fill: true,
            tension: 0.35,
            borderWidth: 2.2,
            pointBackgroundColor: colors.gold,
            pointBorderColor: '#1b0326',
            pointRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Order Volume',
            data: orders,
            borderColor: colors.amethyst,
            borderDash: [5, 5],
            borderWidth: 1.8,
            fill: false,
            tension: 0.2,
            pointBackgroundColor: colors.amethyst,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: getTextColor(), font: { size: 11, family: 'Plus Jakarta Sans' } } },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            titleColor: colors.gold,
            callbacks: {
              label: function (context) {
                if (context.datasetIndex === 0) {
                  return ' Revenue: ' + formatCurrency(context.raw);
                }
                return ' Orders: ' + formatNumber(context.raw);
              }
            }
          }
        },
        scales: {
          x: { grid: { color: getGridColor() }, ticks: { color: getTextColor(), font: { size: 10 } } },
          y: {
            grid: { color: getGridColor() },
            ticks: {
              color: getTextColor(),
              callback: val => '$' + (val / 1000) + 'k',
              font: { size: 10 }
            }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: colors.amethyst, font: { size: 10 } }
          }
        }
      }
    });
  }

  // Day of Week Chart
  function initDowChart() {
    const ctx = document.getElementById('chart-dow');
    if (!ctx) return;
    if (chartDow) chartDow.destroy();

    const labels = data.dayOfWeek.map(d => d.day);
    const revenues = data.dayOfWeek.map(d => d.revenue);

    chartDow = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue by Day',
          data: revenues,
          backgroundColor: 'rgba(250, 174, 98, 0.35)',
          borderColor: colors.gold,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            callbacks: { label: c => ' Revenue: ' + formatCurrency(c.raw) }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: getTextColor(), font: { size: 10 } } },
          y: {
            grid: { color: getGridColor() },
            ticks: { color: getTextColor(), callback: val => '$' + (val / 1000) + 'k', font: { size: 10 } }
          }
        }
      }
    });
  }

  // Category Doughnut Chart
  function initCategoryChart() {
    const ctx = document.getElementById('chart-category');
    if (!ctx) return;
    if (chartCategory) chartCategory.destroy();

    const labels = data.categories.map(c => c.category);
    const revenues = data.categories.map(c => c.revenue);
    const totalRev = revenues.reduce((a, b) => a + b, 0);

    chartCategory = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: revenues,
          backgroundColor: colors.categoryColors,
          borderWidth: 2,
          borderColor: '#190324',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            callbacks: {
              label: function (c) {
                const pct = ((c.raw / totalRev) * 100).toFixed(1);
                return ` ${c.label}: ${formatCurrency(c.raw)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });

    // Custom Category Legend
    const legendEl = document.getElementById('category-legend');
    if (legendEl) {
      legendEl.innerHTML = data.categories.map((c, i) => {
        const pct = ((c.revenue / totalRev) * 100).toFixed(1);
        return `
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${colors.categoryColors[i]}"></span>
            <span class="text-[#fdfbf7] font-medium truncate">${c.category}:</span>
            <span class="text-[#FAAE62] font-mono-num ml-auto font-semibold">${pct}%</span>
          </div>
        `;
      }).join('');
    }
  }

  // Top Products Horizontal Bar Chart
  function initProductsChart() {
    const ctx = document.getElementById('chart-products');
    if (!ctx) return;
    if (chartProducts) chartProducts.destroy();

    const sortedProds = [...data.products].sort((a, b) => a.revenue - b.revenue);
    const labels = sortedProds.map(p => p.name);
    const revenues = sortedProds.map(p => p.revenue);

    chartProducts = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: revenues,
          backgroundColor: 'rgba(250, 174, 98, 0.35)',
          borderColor: colors.gold,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            callbacks: {
              label: c => ' Revenue: ' + formatCurrency(c.raw)
            }
          }
        },
        scales: {
          x: {
            grid: { color: getGridColor() },
            ticks: { color: getTextColor(), callback: val => '$' + (val / 1000) + 'k', font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: getTextColor(), font: { size: 11 } }
          }
        }
      }
    });
  }

  // RFM Customer Segments Chart
  function initRfmChart() {
    const ctx = document.getElementById('chart-rfm');
    if (!ctx) return;
    if (chartRfm) chartRfm.destroy();

    const counts = data.rfm.counts || {};
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const bgColors = labels.map(l => colors.segmentColors[l] || colors.slate);

    chartRfm = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#190324',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: getTextColor(), font: { size: 11, family: 'Plus Jakarta Sans' } }
          },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            callbacks: {
              label: c => ` ${c.label}: ${formatNumber(c.raw)} customers`
            }
          }
        }
      }
    });
  }

  // Country Revenue Chart (Plum and Amber theme)
  function initCountryChart() {
    const ctx = document.getElementById('chart-country');
    if (!ctx) return;
    if (chartCountry) chartCountry.destroy();

    const labels = data.countries.map(c => c.country);
    const revenues = data.countries.map(c => c.revenue);

    chartCountry = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue by Country',
          data: revenues,
          backgroundColor: [
            'rgba(250, 174, 98, 0.65)',
            'rgba(192, 132, 252, 0.65)',
            'rgba(232, 152, 73, 0.65)',
            'rgba(147, 51, 234, 0.65)',
            'rgba(251, 146, 60, 0.65)',
            'rgba(168, 85, 247, 0.65)'
          ],
          borderColor: [
            '#FAAE62',
            '#c084fc',
            '#e89849',
            '#9333ea',
            '#fb923c',
            '#a855f7'
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(27, 3, 38, 0.95)',
            borderColor: 'rgba(250, 174, 98, 0.35)',
            borderWidth: 1,
            callbacks: { label: c => ' Revenue: ' + formatCurrency(c.raw) }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: getTextColor(), font: { size: 11 } } },
          y: {
            grid: { color: getGridColor() },
            ticks: { color: getTextColor(), callback: val => '$' + (val / 1000) + 'k', font: { size: 10 } }
          }
        }
      }
    });
  }

  // 3. Render RFM Matrix and Top Customers
  function renderRfmTable(rfmData) {
    if (!rfmData) return;

    // Segment Stats Matrix
    const matrixBody = document.getElementById('rfm-matrix-body');
    if (matrixBody && rfmData.stats) {
      matrixBody.innerHTML = rfmData.stats.map(s => {
        const segColor = colors.segmentColors[s.Segment] || '#94a3b8';
        return `
          <tr class="hover:bg-[#3E0856]/30 transition">
            <td class="py-2.5 px-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style="background-color: ${segColor}22; color: ${segColor}; border: 1px solid ${segColor}44;">
                ${s.Segment}
              </span>
            </td>
            <td class="py-2.5 px-3 font-semibold text-white">${formatNumber(s.customers)}</td>
            <td class="py-2.5 px-3 text-[#c9b9ce]">${s.avg_recency} days</td>
            <td class="py-2.5 px-3 text-[#c9b9ce]">${s.avg_frequency}</td>
            <td class="py-2.5 px-3 text-[#FAAE62]">${formatCurrency(s.avg_monetary)}</td>
            <td class="py-2.5 px-3 font-bold text-white">${formatCurrency(s.total_revenue)}</td>
          </tr>
        `;
      }).join('');
    }

    // Top Customers Leaderboard
    renderTopCustomers(rfmData.topCustomers);
  }

  function renderTopCustomers(topCustomers) {
    const custBody = document.getElementById('top-cust-body');
    if (!custBody || !topCustomers) return;

    const searchTerm = (document.getElementById('cust-search')?.value || '').trim().toLowerCase();
    const filtered = topCustomers.filter(c => !searchTerm || String(c.CustomerID).toLowerCase().includes(searchTerm));

    custBody.innerHTML = filtered.map((c, i) => {
      const segColor = colors.segmentColors[c.Segment] || '#94a3b8';
      return `
        <tr class="hover:bg-[#3E0856]/30 transition">
          <td class="py-2.5 px-3 text-[#FAAE62] font-bold">#${i + 1}</td>
          <td class="py-2.5 px-3 font-semibold text-white">ID ${c.CustomerID}</td>
          <td class="py-2.5 px-3 text-[#c9b9ce]">${c.Recency} days</td>
          <td class="py-2.5 px-3 text-[#c9b9ce]">${c.Frequency} orders</td>
          <td class="py-2.5 px-3 font-bold text-[#FAAE62]">${formatCurrency(c.Monetary)}</td>
          <td class="py-2.5 px-3 text-white"><span class="px-2 py-0.5 rounded bg-[#3E0856] border border-[#FAAE62]/30 font-mono text-[#FAAE62]">${c.RFM_score}</span></td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" style="background-color: ${segColor}22; color: ${segColor}; border: 1px solid ${segColor}44;">
              ${c.Segment}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Render Country Breakdown Cards (Plum Container, Gold Accents, ISO Badges)
  function renderCountryCards(countries) {
    const container = document.getElementById('country-cards-container');
    if (!container || !countries) return;

    const totalRev = countries.reduce((acc, c) => acc + c.revenue, 0);

    const isoMap = {
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Spain': 'ES',
      'India': 'IN',
      'Netherlands': 'NL'
    };

    container.innerHTML = countries.map(c => {
      const code = isoMap[c.country] || 'INT';
      const pct = ((c.revenue / totalRev) * 100).toFixed(1);
      return `
        <div class="p-3.5 rounded-xl bg-[#1d032b] border border-[#FAAE62]/20 flex items-center justify-between hover:border-[#FAAE62]/50 transition">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-[#3E0856] text-[#FAAE62] flex items-center justify-center font-mono font-bold text-xs border border-[#FAAE62]/30">${code}</span>
            <div>
              <div class="font-bold text-xs text-white">${c.country}</div>
              <div class="text-[11px] text-[#c9b9ce]">${formatNumber(c.orders)} orders, ${c.customers} customers</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-xs text-[#FAAE62] font-mono-num">${formatCurrency(c.revenue)}</div>
            <div class="text-[11px] text-[#c084fc] font-mono-num">${pct}% share</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Render IQR Outliers
  function renderOutliers(outliers) {
    const container = document.getElementById('outliers-container');
    if (!container || !outliers) return;

    container.innerHTML = outliers.map(o => {
      return `
        <div class="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-white">${o.column}</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${o.outliers > 0 ? 'bg-[#FAAE62]/15 text-[#FAAE62] border border-[#FAAE62]/30' : 'bg-emerald-500/15 text-emerald-400'}">
              ${o.outliers} Potential Outliers
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono-num">
            <div class="p-2 rounded bg-[#1a0327] border border-[#FAAE62]/20">
              <span class="text-[#c9b9ce] text-[10px] block">Q1 25th Percentile</span>
              <span class="font-bold text-white">${o.q1}</span>
            </div>
            <div class="p-2 rounded bg-[#1a0327] border border-[#FAAE62]/20">
              <span class="text-[#c9b9ce] text-[10px] block">Q3 75th Percentile</span>
              <span class="font-bold text-white">${o.q3}</span>
            </div>
            <div class="p-2 rounded bg-[#1a0327] border border-[#FAAE62]/20">
              <span class="text-[#c9b9ce] text-[10px] block">Lower Bound</span>
              <span class="font-bold text-white">${o.lower_bound}</span>
            </div>
            <div class="p-2 rounded bg-[#1a0327] border border-[#FAAE62]/20">
              <span class="text-[#c9b9ce] text-[10px] block">Upper Bound</span>
              <span class="font-bold text-white">${o.upper_bound}</span>
            </div>
          </div>
          <div class="text-[11px] text-[#c9b9ce] flex items-center justify-between pt-1">
            <span>Mean: <strong class="text-[#FAAE62]">${o.mean}</strong></span>
            <span>Std Dev: <strong class="text-[#c084fc]">${o.std}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Render Correlation Matrix
  function renderCorrelationMatrix(corr) {
    const tbody = document.getElementById('corr-matrix-body');
    if (!tbody || !corr) return;

    const metrics = ['Quantity', 'UnitPrice', 'Sales'];
    tbody.innerHTML = metrics.map(rowMetric => {
      return `
        <tr>
          <td class="py-2.5 px-3 font-semibold text-[#FAAE62] text-left">${rowMetric}</td>
          ${metrics.map(colMetric => {
            const val = corr[rowMetric] ? corr[rowMetric][colMetric] : 0;
            let bgColor = 'rgba(250, 174, 98, 0.03)';
            if (val === 1) bgColor = 'rgba(250, 174, 98, 0.22)';
            else if (val > 0.4) bgColor = 'rgba(62, 8, 86, 0.45)';
            else if (val < -0.2) bgColor = 'rgba(225, 29, 72, 0.25)';

            return `<td class="py-2.5 px-3 text-white font-bold" style="background-color: ${bgColor}">${val.toFixed(3)}</td>`;
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  // 7. Render Transaction Table and Pagination
  function renderTable() {
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;

    const search = (document.getElementById('table-search')?.value || '').trim().toLowerCase();
    const filtered = filteredRecords.filter(r => {
      if (!search) return true;
      return (
        r.InvoiceNo.toLowerCase().includes(search) ||
        r.Description.toLowerCase().includes(search) ||
        r.Category.toLowerCase().includes(search) ||
        r.Country.toLowerCase().includes(search) ||
        String(r.CustomerID).toLowerCase().includes(search)
      );
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    tbody.innerHTML = pageItems.map(r => {
      return `
        <tr class="hover:bg-[#3E0856]/25 transition">
          <td class="py-2 px-3 text-[#FAAE62] font-semibold">${r.InvoiceNo}</td>
          <td class="py-2 px-3 text-[#c9b9ce]">${r.InvoiceDate}</td>
          <td class="py-2 px-3 text-white font-mono">${r.StockCode}</td>
          <td class="py-2 px-3 font-medium text-white">${r.Description}</td>
          <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[11px] bg-[#3E0856] text-[#FAAE62] border border-[#FAAE62]/30">${r.Category}</span></td>
          <td class="py-2 px-3 text-white">${r.Quantity}</td>
          <td class="py-2 px-3 text-[#c9b9ce] font-mono-num">$${Number(r.UnitPrice).toFixed(2)}</td>
          <td class="py-2 px-3 font-bold text-[#FAAE62] font-mono-num">$${Number(r.Sales).toFixed(2)}</td>
          <td class="py-2 px-3 text-white">${r.CustomerID || 'Guest'}</td>
          <td class="py-2 px-3 text-[#c9b9ce]">${r.Country}</td>
        </tr>
      `;
    }).join('');

    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
      const start = filtered.length === 0 ? 0 : startIdx + 1;
      const end = Math.min(startIdx + pageSize, filtered.length);
      pageInfo.textContent = `Showing ${start} to ${end} of ${filtered.length} entries`;
    }

    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  // 8. Dynamic Filter Application
  function applyFilters() {
    const cat = document.getElementById('filter-category').value;
    const country = document.getElementById('filter-country').value;
    const segment = document.getElementById('filter-segment').value;

    filteredRecords = allRecords.filter(r => {
      const matchCat = cat === 'ALL' || r.Category === cat;
      const matchCountry = country === 'ALL' || r.Country === country;
      return matchCat && matchCountry;
    });

    // Recompute local KPIs for filtered slice
    const totalRev = filteredRecords.reduce((sum, r) => sum + Number(r.Sales || 0), 0);
    const totalUnits = filteredRecords.reduce((sum, r) => sum + Number(r.Quantity || 0), 0);
    const orders = new Set(filteredRecords.map(r => r.InvoiceNo)).size;
    const customers = new Set(filteredRecords.map(r => r.CustomerID).filter(c => c && c !== 'Guest')).size;
    const aov = orders > 0 ? totalRev / orders : 0;

    renderKPIs({
      totalRevenue: totalRev,
      totalUnits: totalUnits,
      uniqueOrders: orders,
      uniqueCustomers: customers,
      avgOrderValue: aov,
      repeatRate: data.kpis.repeatRate
    });

    currentPage = 1;
    renderTable();
  }

  // 9. Event Listeners
  function initEvents() {
    // Filter change
    document.getElementById('filter-category')?.addEventListener('change', applyFilters);
    document.getElementById('filter-country')?.addEventListener('change', applyFilters);
    document.getElementById('filter-segment')?.addEventListener('change', () => {
      const seg = document.getElementById('filter-segment').value;
      if (seg === 'ALL') {
        renderTopCustomers(data.rfm.topCustomers);
      } else {
        const filtered = data.rfm.topCustomers.filter(c => c.Segment === seg);
        renderTopCustomers(filtered);
      }
    });

    // Reset Filters
    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      document.getElementById('filter-category').value = 'ALL';
      document.getElementById('filter-country').value = 'ALL';
      document.getElementById('filter-segment').value = 'ALL';
      filteredRecords = [...allRecords];
      renderKPIs(data.kpis);
      renderTopCustomers(data.rfm.topCustomers);
      currentPage = 1;
      renderTable();
    });

    // Customer Search
    document.getElementById('cust-search')?.addEventListener('input', () => {
      renderTopCustomers(data.rfm.topCustomers);
    });

    // Table Search
    document.getElementById('table-search')?.addEventListener('input', () => {
      currentPage = 1;
      renderTable();
    });

    // Pagination
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      currentPage++;
      renderTable();
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);

    // Print Report
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    // CSV File Upload
    document.getElementById('csv-file-input')?.addEventListener('change', handleFileUpload);
  }

  // 10. Handle Custom CSV File Upload
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert('CSV file appears to be empty or has only a header row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const newRecords = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] || '';
          });

          const qty = Number(row.Quantity || row.qty || 1);
          const price = Number(row.UnitPrice || row.price || 0);
          const sales = Number(row.Sales || row.revenue || (qty * price));

          newRecords.push({
            InvoiceNo: row.InvoiceNo || row.invoice || `UPLOAD_${i}`,
            StockCode: row.StockCode || row.sku || 'SKU001',
            Description: row.Description || row.product || 'Product Item',
            Category: row.Category || 'General',
            Quantity: qty,
            UnitPrice: price,
            Sales: sales,
            InvoiceDate: row.InvoiceDate || row.date || '2024-06-01 12:00',
            CustomerID: row.CustomerID || 'Guest',
            Country: row.Country || 'United Kingdom'
          });
        }

        allRecords = newRecords;
        filteredRecords = [...newRecords];
        currentPage = 1;

        // Recalculate KPIs
        const totalRev = newRecords.reduce((s, r) => s + r.Sales, 0);
        const totalUnits = newRecords.reduce((s, r) => s + r.Quantity, 0);
        const orders = new Set(newRecords.map(r => r.InvoiceNo)).size;
        const customers = new Set(newRecords.map(r => r.CustomerID).filter(c => c && c !== 'Guest')).size;

        renderKPIs({
          totalRevenue: totalRev,
          totalUnits: totalUnits,
          uniqueOrders: orders,
          uniqueCustomers: customers,
          avgOrderValue: orders > 0 ? totalRev / orders : 0,
          repeatRate: 85.0
        });

        renderTable();
        alert(`Successfully parsed and loaded ${newRecords.length} records into dashboard.`);
      } catch (err) {
        alert('Error parsing CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // 11. Export Active Records as CSV
  function exportCsv() {
    const rows = filteredRecords;
    if (!rows || rows.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['InvoiceNo', 'InvoiceDate', 'StockCode', 'Description', 'Category', 'Quantity', 'UnitPrice', 'Sales', 'CustomerID', 'Country'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.InvoiceNo}"`,
        `"${r.InvoiceDate}"`,
        `"${r.StockCode}"`,
        `"${r.Description}"`,
        `"${r.Category}"`,
        r.Quantity,
        r.UnitPrice,
        r.Sales,
        `"${r.CustomerID}"`,
        `"${r.Country}"`
      ].join(','))
    ].join('\n');

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DAVP_Ecommerce_Report_${dateStr}.csv`;
    link.click();
  }

  // 12. Tab Navigation
  function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(tc => {
          if (tc.id === targetId) {
            tc.classList.remove('hidden');
          } else {
            tc.classList.add('hidden');
          }
        });

        // Trigger chart resize when switching tabs
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  // 13. Theme Management (Dark / Light)
  function initTheme() {
    const saved = localStorage.getItem('davp-theme') || 'dark';
    setTheme(saved);

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
      localStorage.setItem('davp-theme', next);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const sun = document.getElementById('theme-icon-sun');
    const moon = document.getElementById('theme-icon-moon');
    if (theme === 'light') {
      sun?.classList.remove('hidden');
      moon?.classList.add('hidden');
    } else {
      sun?.classList.add('hidden');
      moon?.classList.remove('hidden');
    }

    // Refresh charts with updated theme colors if already created
    if (chartMonthly) {
      [chartMonthly, chartDow, chartCategory, chartProducts, chartRfm, chartCountry].forEach(c => {
        if (c) {
          c.options.scales?.x?.ticks && (c.options.scales.x.ticks.color = getTextColor());
          c.options.scales?.y?.ticks && (c.options.scales.y.ticks.color = getTextColor());
          c.options.scales?.x?.grid && (c.options.scales.x.grid.color = getGridColor());
          c.options.scales?.y?.grid && (c.options.scales.y.grid.color = getGridColor());
          c.update();
        }
      });
    }
  }

  function getTextColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '#230432' : '#c9b9ce';
  }

  function getGridColor() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(62, 8, 86, 0.08)' : 'rgba(250, 174, 98, 0.08)';
  }

})();
