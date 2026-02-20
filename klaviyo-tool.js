(function() {
  // ========== HELPER FUNCTIONS ==========
  function safeParseFloat(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  
  function parsePercentage(value) {
    if (!value) return 0;
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', '')) / 100 || 0;
    }
    return parseFloat(value) || 0;
  }

  function parseSendTime(value) {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value)) return value;
    let s = String(value).trim();
    let dt = new Date(s);
    if (!isNaN(dt)) return dt;
    dt = new Date(s.replace(/-/g, '/'));
    if (!isNaN(dt)) return dt;
    return null;
  }

  function isValidDate(d) { return d instanceof Date && !isNaN(d); }
  
  function formatDateLong(d) {
    const dt = (d && !(d instanceof Date)) ? parseSendTime(d) : d;
    return isValidDate(dt) ? dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  }
  
  function formatDateISO(d) {
    const dt = (d && !(d instanceof Date)) ? parseSendTime(d) : d;
    if (!isValidDate(dt)) return '';
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }
  
  function formatMonthKey(d) {
    const dt = (d && !(d instanceof Date)) ? parseSendTime(d) : d;
    if (!isValidDate(dt)) return '';
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
  }

  function getWeekStartDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  
  function formatWeekDisplay(date) {
    const s = getWeekStartDate(date);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return formatDateLong(s) + ' - ' + formatDateLong(e);
  }
  
  function formatWeekKey(d) {
    const ws = getWeekStartDate(d);
    return ws.getFullYear() + '-' + String(ws.getMonth() + 1).padStart(2, '0') + '-' + String(ws.getDate()).padStart(2, '0');
  }
  
  function formatTimeFromRow(raw) {
    const dt = parseSendTime(raw);
    return isValidDate(dt) ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  }
  
  function formatNumberInt(n) {
    return n ? Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n)) : '0';
  }
  
  function formatMoney(n) {
    return n ? Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '0.00';
  }

  // ========== STATE ==========
  let rawData = [];
  const outputs = { daily: null, weekly: null, monthly: null, trend: null, growth: null, seasonal: null };
  let trendChart = null, growthChart = null, seasonalChart = null;

  // ========== UI ELEMENTS ==========
  const fileInput = document.getElementById('csvUpload');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const filterButton = document.getElementById('filterButton');

  // File input label
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const fileName = e.target.files[0] ? e.target.files[0].name : "Choose file...";
      e.target.nextElementSibling.textContent = fileName;
    });
  }

  // Export buttons
  document.getElementById('exportDailyBtn')?.addEventListener('click', () => downloadCSV(outputs.daily, 'daily_data.csv'));
  document.getElementById('exportWeeklyBtn')?.addEventListener('click', () => downloadCSV(outputs.weekly, 'weekly_data.csv'));
  document.getElementById('exportMonthlyBtn')?.addEventListener('click', () => downloadCSV(outputs.monthly, 'monthly_data.csv'));
  document.getElementById('exportTrendBtn')?.addEventListener('click', () => downloadCSV(outputs.trend, 'trend_data.csv'));
  document.getElementById('exportGrowthBtn')?.addEventListener('click', () => downloadCSV(outputs.growth, 'growth_data.csv'));
  document.getElementById('exportSeasonalBtn')?.addEventListener('click', () => downloadCSV(outputs.seasonal, 'seasonal_data.csv'));

  if (fileInput) fileInput.addEventListener('change', handleFile);
  if (filterButton) filterButton.addEventListener('click', runAll);

  // ========== SCROLL-TRIGGERED BANNER ==========
  let bannerShown = false;
  const scrollThreshold = 300; // Show after scrolling 300px

  function checkScroll() {
    const trialBanner = document.getElementById('trialBanner');
    if (!trialBanner) return;
    
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    if (scrollPosition > scrollThreshold && !bannerShown) {
      trialBanner.classList.add('visible');
      bannerShown = true;
      console.log('Trial banner shown at scroll position:', scrollPosition);
    }
  }

  // Show full trial modal when mini banner is clicked
  window.showFullTrialModal = function() {
    $('#trialOfferModal').modal('show');
    
    // Update modal countdown
    const countdownEl = document.getElementById('countdown');
    const modalCountdown = document.getElementById('modalCountdown');
    if (countdownEl && modalCountdown) {
      modalCountdown.textContent = countdownEl.textContent;
    }
  }

  // Add scroll listener
  window.addEventListener('scroll', checkScroll);

  // Also show banner if user is about to leave (exit intent)
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 0 && !bannerShown) {
      const trialBanner = document.getElementById('trialBanner');
      if (trialBanner) {
        trialBanner.classList.add('visible');
        bannerShown = true;
      }
    }
  });

  // ========== COUNTDOWN TIMER ==========
function updateCountdown() {
  const countdownEl = document.getElementById('countdown');
  const modalCountdown = document.getElementById('modalCountdown');
  if (!countdownEl) return;
  
  const now = new Date();
  
  // Set end date to 7 days from now at 11:59:59 PM
  const endDate = new Date();
  endDate.setDate(now.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);
  
  const diffTime = endDate - now;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  let countdownText;
  if (diffDays > 0) {
    if (diffDays === 1 && diffHours === 0) {
      countdownText = `1 day`;
    } else if (diffDays > 1) {
      countdownText = `${diffDays} days`;
    } else {
      countdownText = `${diffDays} day`;
    }
  } else if (diffHours > 0) {
    countdownText = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    countdownText = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    countdownText = 'Last day!';
  }
  
  // For banner - show simpler format
  const bannerText = diffDays > 0 ? `${diffDays} day${diffDays > 1 ? 's' : ''}` : 'Last day!';
  countdownEl.textContent = bannerText;
  
  // For modal - show more detailed format
  if (modalCountdown) {
    if (diffDays > 0) {
      modalCountdown.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    } else if (diffHours > 0) {
      modalCountdown.textContent = `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
    } else {
      modalCountdown.textContent = 'Last day!';
    }
  }
  
  console.log('Countdown updated:', { diffDays, diffHours, diffMinutes, bannerText });
}

// Initialize countdown
updateCountdown();

// Update every minute instead of every hour for more accuracy
setInterval(updateCountdown, 1000 * 60);

// Also update when modal is shown
$('#trialOfferModal').on('show.bs.modal', function() {
  updateCountdown();
});

  // ========== DATA PROCESSING ==========
  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    loadingIndicator.style.display = 'flex';
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        loadingIndicator.style.display = 'none';
        if (results.errors && results.errors.length) {
          alert('CSV parse error: ' + results.errors[0].message);
          return;
        }
        rawData = results.data;
        runAll();
      },
      error: function(err) {
        loadingIndicator.style.display = 'none';
        alert('CSV parse error: ' + err.message);
      }
    });
  }

  function runAll() {
    if (!rawData || rawData.length === 0) {
      alert('Please upload a Klaviyo CSV first.');
      return;
    }

    const startVal = document.getElementById('startDate').value;
    const endVal = document.getElementById('endDate').value;
    const start = startVal ? new Date(startVal) : null;
    const end = endVal ? new Date(endVal) : null;

    const filtered = rawData.filter(r => {
      const dt = parseSendTime(r['Send Time']);
      if (!isValidDate(dt)) return false;
      if (start && dt < start) return false;
      if (end && dt > end) return false;
      return true;
    });

    if (filtered.length === 0) {
      alert('No data matches selected date range.');
      clearAll();
      return;
    }

    buildDailyWeeklyMonthly(filtered);
    buildTrend(filtered);
    buildGrowth(filtered);
    buildSeasonal(filtered);
  }

  function clearAll() {
    ['dailyTable', 'weeklyTable', 'monthlyTable', 'trendTable', 'growthTable', 'seasonalTable'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="alert alert-info">No data available.</div>';
    });
    if (trendChart) { trendChart.destroy(); trendChart = null; }
    if (growthChart) { growthChart.destroy(); growthChart = null; }
    if (seasonalChart) { seasonalChart.destroy(); seasonalChart = null; }
  }

  // ========== BUILD FUNCTIONS ==========
  function buildDailyWeeklyMonthly(rows) {
    const daily = {}, weekly = {}, monthly = {};
    
    rows.forEach(r => {
      const dt = parseSendTime(r['Send Time']);
      if (!isValidDate(dt)) return;
      
      const dateISO = formatDateISO(dt);
      const dateDisplay = formatDateLong(dt);
      const weekKey = formatWeekKey(dt);
      const weekDisplay = formatWeekDisplay(dt);
      const monthKey = formatMonthKey(dt);
      const monthDisplay = dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      const campaignName = r['Campaign Name'] || 'Unknown';
      const subject = r['Subject'] || '';
      const sendDays = r['Send Weekday'] || '';
      const listSegment = r['List'] || '';
      
      const revenue = safeParseFloat(r['Revenue']);
      const openRate = parsePercentage(r['Open Rate']);
      const clickRate = parsePercentage(r['Click Rate']);
      const convRate = parsePercentage(r['Placed Order Rate']);
      const recipients = safeParseFloat(r['Total Recipients']);
      const uniqueOpens = safeParseFloat(r['Unique Opens']);
      const uniqueClicks = safeParseFloat(r['Unique Clicks']);
      
      // Daily
      if (!daily[dateISO]) daily[dateISO] = { display: dateDisplay, sendTime: formatTimeFromRow(r['Send Time']), campaigns: {} };
      if (!daily[dateISO].campaigns[campaignName]) {
        daily[dateISO].campaigns[campaignName] = { subject, count: 0, openRateSum: 0, clickRateSum: 0, convRateSum: 0, revenueSum: 0, sendDays, listSegment };
      }
      const dc = daily[dateISO].campaigns[campaignName];
      dc.count++;
      dc.openRateSum += openRate;
      dc.clickRateSum += clickRate;
      dc.convRateSum += convRate;
      dc.revenueSum += revenue;
      
      // Weekly
      if (!weekly[weekKey]) weekly[weekKey] = { display: weekDisplay, revenueSum: 0, recipientsSum: 0, opensSum: 0, clicksSum: 0, count: 0 };
      weekly[weekKey].revenueSum += revenue;
      weekly[weekKey].recipientsSum += recipients;
      weekly[weekKey].opensSum += uniqueOpens;
      weekly[weekKey].clicksSum += uniqueClicks;
      weekly[weekKey].count++;
      
      // Monthly
      if (!monthly[monthKey]) monthly[monthKey] = { display: monthDisplay, revenueSum: 0, recipientsSum: 0, opensSum: 0, clicksSum: 0, count: 0 };
      monthly[monthKey].revenueSum += revenue;
      monthly[monthKey].recipientsSum += recipients;
      monthly[monthKey].opensSum += uniqueOpens;
      monthly[monthKey].clicksSum += uniqueClicks;
      monthly[monthKey].count++;
    });
    
    // Daily output
    const dailyOutput = [['Date Sent', 'Campaign Name', 'Subject', 'Open Rate', 'Click Rate', 'Conversion Rate', 'Send Time', 'Send Days', 'List / Segment', 'Revenue']];
    Object.keys(daily).sort().forEach(dateISO => {
      const info = daily[dateISO];
      Object.keys(info.campaigns).forEach(cn => {
        const c = info.campaigns[cn];
        dailyOutput.push([
          info.display,
          cn,
          c.subject || '',
          (c.count ? (c.openRateSum / c.count) * 100 : 0).toFixed(2) + '%',
          (c.count ? (c.clickRateSum / c.count) * 100 : 0).toFixed(2) + '%',
          (c.count ? (c.convRateSum / c.count) * 100 : 0).toFixed(2) + '%',
          info.sendTime || '',
          c.sendDays || '',
          c.listSegment || '',
          formatMoney(c.revenueSum)
        ]);
      });
    });
    outputs.daily = dailyOutput;
    renderTable('dailyTable', dailyOutput);
    
    // Weekly output
    const weeklyOutput = [['Week', 'Total Revenue', 'Total Recipients', 'Total Opens', 'Total Clicks']];
    Object.keys(weekly).sort().forEach(weekKey => {
      const w = weekly[weekKey];
      weeklyOutput.push([w.display, formatMoney(w.revenueSum), formatNumberInt(w.recipientsSum), formatNumberInt(w.opensSum), formatNumberInt(w.clicksSum)]);
    });
    outputs.weekly = weeklyOutput;
    renderTable('weeklyTable', weeklyOutput);
    
    // Monthly output
    const monthlyOutput = [['Month', 'Total Revenue', 'Total Recipients', 'Total Opens', 'Total Clicks']];
    Object.keys(monthly).sort().forEach(monthKey => {
      const m = monthly[monthKey];
      monthlyOutput.push([m.display, formatMoney(m.revenueSum), formatNumberInt(m.recipientsSum), formatNumberInt(m.opensSum), formatNumberInt(m.clicksSum)]);
    });
    outputs.monthly = monthlyOutput;
    renderTable('monthlyTable', monthlyOutput);
  }

  function buildTrend(rows) {
    const trend = {};
    rows.forEach(r => {
      const dt = parseSendTime(r['Send Time']);
      if (!isValidDate(dt)) return;
      const ym = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
      const revenue = safeParseFloat(r['Revenue']);
      if (!trend[ym]) trend[ym] = { revenueSum: 0, count: 0 };
      trend[ym].revenueSum += revenue;
      trend[ym].count++;
    });
    
    const months = Object.keys(trend).sort();
    const trendOutput = [['Month', 'Total Revenue']];
    months.forEach(m => {
      trendOutput.push([m, formatMoney(trend[m].revenueSum)]);
    });
    outputs.trend = trendOutput;
    renderTable('trendTable', trendOutput);
    
    // Chart
    const labels = months;
    const data = months.map(m => trend[m].revenueSum);
    if (trendChart) trendChart.destroy();
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (ctx) {
      trendChart = new Chart(ctx, {
        type: 'line',
        data: { 
          labels, 
          datasets: [{ 
            label: 'Total Revenue', 
            data, 
            borderColor: '#6c5ce7', 
            backgroundColor: 'rgba(108, 92, 231, 0.1)',
            tension: 0.3,
            fill: true
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } }
        }
      });
    }
  }

  function buildGrowth(rows) {
    const growth = {};
    rows.forEach(r => {
      const name = r['Campaign Name'] || 'Unknown';
      const revenue = safeParseFloat(r['Revenue']);
      if (!growth[name]) growth[name] = { revenueSum: 0, count: 0 };
      growth[name].revenueSum += revenue;
      growth[name].count++;
    });
    
    const sorted = Object.keys(growth).sort((a, b) => growth[b].revenueSum - growth[a].revenueSum);
    const growthOutput = [['Campaign Name', 'Total Revenue']];
    sorted.forEach(name => {
      growthOutput.push([name, formatMoney(growth[name].revenueSum)]);
    });
    outputs.growth = growthOutput;
    renderTable('growthTable', growthOutput);
    
    // Chart (top 10)
    const top = sorted.slice(0, 10);
    const labels = top;
    const data = top.map(n => growth[n].revenueSum);
    if (growthChart) growthChart.destroy();
    const ctx = document.getElementById('growthChart')?.getContext('2d');
    if (ctx) {
      growthChart = new Chart(ctx, {
        type: 'bar',
        data: { 
          labels, 
          datasets: [{ 
            label: 'Total Revenue', 
            data, 
            backgroundColor: 'rgba(108, 92, 231, 0.7)'
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: { x: { ticks: { callback: v => '$' + v } } }
        }
      });
    }
  }

  function buildSeasonal(rows) {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekdayAgg = {};
    
    rows.forEach(r => {
      const dt = parseSendTime(r['Send Time']);
      if (!isValidDate(dt)) return;
      const wd = dt.toLocaleDateString('en-US', { weekday: 'long' });
      const revenue = safeParseFloat(r['Revenue']);
      if (!weekdayAgg[wd]) weekdayAgg[wd] = { sum: 0, count: 0 };
      weekdayAgg[wd].sum += revenue;
      weekdayAgg[wd].count++;
    });
    
    const seasonalOutput = [['Day of Week', 'Average Revenue']];
    weekdays.forEach(d => {
      const o = weekdayAgg[d];
      seasonalOutput.push([d, formatMoney(o ? o.sum / o.count : 0)]);
    });
    outputs.seasonal = seasonalOutput;
    renderTable('seasonalTable', seasonalOutput);
    
    // Chart
    const labels = weekdays;
    const data = weekdays.map(d => weekdayAgg[d] ? weekdayAgg[d].sum / weekdayAgg[d].count : 0);
    if (seasonalChart) seasonalChart.destroy();
    const ctx = document.getElementById('seasonalChart')?.getContext('2d');
    if (ctx) {
      seasonalChart = new Chart(ctx, {
        type: 'bar',
        data: { 
          labels, 
          datasets: [{ 
            label: 'Average Revenue', 
            data, 
            backgroundColor: 'rgba(253, 121, 168, 0.7)'
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v } } }
        }
      });
    }
  }

  // ========== RENDER TABLE ==========
  function renderTable(containerId, arr2d) {
    const container = document.getElementById(containerId);
    if (!container || !arr2d || arr2d.length < 1) {
      if (container) container.innerHTML = '<div class="alert alert-info">No data available.</div>';
      return;
    }
    
    let html = '<table class="table table-bordered table-striped display"><thead><tr>';
    arr2d[0].forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    
    for (let i = 1; i < arr2d.length; i++) {
      html += '<tr>';
      arr2d[i].forEach(cell => {
        if (typeof cell === 'string' && cell.startsWith('$')) {
          html += `<td class="font-weight-bold text-success">${cell}</td>`;
        } else if (typeof cell === 'string' && cell.endsWith('%')) {
          const value = parseFloat(cell);
          let color = 'text-warning';
          if (value > 50) color = 'text-success';
          else if (value > 20) color = 'text-primary';
          html += `<td class="${color}">${cell}</td>`;
        } else {
          html += `<td>${cell}</td>`;
        }
      });
      html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Initialize DataTable
    const $tbl = $(container).find('table');
    if ($.fn.DataTable.isDataTable($tbl)) $tbl.DataTable().destroy();
    $tbl.DataTable({ 
      paging: true, 
      searching: true, 
      ordering: true, 
      lengthMenu: [10, 25, 50, 100],
      responsive: true
    });
  }

  // ========== CSV DOWNLOAD ==========
  function downloadCSV(arr2d, filename) {
    if (!arr2d || arr2d.length === 0) { alert('No data to export'); return; }
    
    const rows = arr2d.map(r => r.map(cell => {
      if (cell === null || cell === undefined) return '';
      const s = String(cell).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(','));
    
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 150);
  }

  // ========== INSTALLER DOWNLOAD ==========
  window.downloadInstaller = function() {
    alert('🚀 Windows App download started!\n\nIn production, this would download: KlaviyoAnalytics_Setup.exe');
    console.log('Installer download clicked at', new Date().toISOString());
    // In production: window.location.href = 'KlaviyoAnalytics_Setup.exe';
  };


})();
