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
  
  // Trial state
  let isTrialExpired = false;
  const TRIAL_START = new Date(2026, 1, 19, 12, 0, 0); // Feb 19, 2026 at 12:00 PM
  const TRIAL_END = new Date(TRIAL_START);
  TRIAL_END.setDate(TRIAL_START.getDate() + 7);
  TRIAL_END.setHours(23, 59, 59, 999); // Feb 26, 2026 at 11:59:59 PM

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

  // Export buttons with trial check
  document.getElementById('exportDailyBtn')?.addEventListener('click', () => downloadCSV(outputs.daily, 'daily_data.csv'));
  document.getElementById('exportWeeklyBtn')?.addEventListener('click', () => downloadCSV(outputs.weekly, 'weekly_data.csv'));
  
  // Premium export buttons with trial check
  document.getElementById('exportMonthlyBtn')?.addEventListener('click', () => {
    if (isTrialExpired) {
      showUpgradeMessage('Monthly data');
      return;
    }
    downloadCSV(outputs.monthly, 'monthly_data.csv');
  });
  
  document.getElementById('exportTrendBtn')?.addEventListener('click', () => {
    if (isTrialExpired) {
      showUpgradeMessage('Trend data');
      return;
    }
    downloadCSV(outputs.trend, 'trend_data.csv');
  });
  
  document.getElementById('exportGrowthBtn')?.addEventListener('click', () => {
    if (isTrialExpired) {
      showUpgradeMessage('Growth data');
      return;
    }
    downloadCSV(outputs.growth, 'growth_data.csv');
  });
  
  document.getElementById('exportSeasonalBtn')?.addEventListener('click', () => {
    if (isTrialExpired) {
      showUpgradeMessage('Seasonal data');
      return;
    }
    downloadCSV(outputs.seasonal, 'seasonal_data.csv');
  });

  if (fileInput) fileInput.addEventListener('change', handleFile);
  if (filterButton) filterButton.addEventListener('click', runAll);

  // ========== UPGRADE MESSAGING ==========
  function showUpgradeMessage(feature) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-warning upgrade-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      border-left: 4px solid #fd79a8;
    `;
    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-crown text-warning mr-3 fa-2x"></i>
        <div>
          <strong>Trial Expired</strong>
          <p class="mb-0">${feature} is now available in the desktop app. <a href="#" onclick="downloadInstaller(); return false;" class="alert-link">Download now</a> for full access.</p>
        </div>
        <button type="button" class="close ml-3" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // ========== SCROLL-TRIGGERED BANNER ==========
  let bannerShown = false;
  const scrollThreshold = 300;

  function checkScroll() {
    if (isTrialExpired) return;
    
    const trialBanner = document.getElementById('trialBanner');
    if (!trialBanner) return;
    
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    if (scrollPosition > scrollThreshold && !bannerShown) {
      trialBanner.classList.add('visible');
      bannerShown = true;
    }
  }

  window.showFullTrialModal = function() {
    if (isTrialExpired) {
      $('#upgradeModal').modal('show');
      return;
    }
    $('#trialOfferModal').modal('show');
    updateCountdown();
  }

  window.addEventListener('scroll', checkScroll);

  document.addEventListener('mouseleave', function(e) {
    if (isTrialExpired) return;
    
    if (e.clientY < 0 && !bannerShown) {
      const trialBanner = document.getElementById('trialBanner');
      if (trialBanner) {
        trialBanner.classList.add('visible');
        bannerShown = true;
      }
    }
  });

  // ========== COUNTDOWN TIMER WITH EXPIRATION ==========
  function updateCountdown() {
    const countdownEl = document.getElementById('countdown');
    const modalCountdown = document.getElementById('modalCountdown');
    const startDateDisplay = document.getElementById('startDateDisplay');
    const endDateDisplay = document.getElementById('endDateDisplay');
    const timeRemaining = document.getElementById('timeRemaining');
    const trialBanner = document.getElementById('trialBanner');
    
    if (!countdownEl) return;
    
    const now = new Date();
    
    // Update date displays
    if (startDateDisplay) {
      startDateDisplay.textContent = TRIAL_START.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      });
    }
    
    if (endDateDisplay) {
      endDateDisplay.textContent = TRIAL_END.toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      });
    }
    
    const diffTime = TRIAL_END - now;
    
    // Check if trial has expired
    if (diffTime <= 0) {
      if (!isTrialExpired) {
        isTrialExpired = true;
        handleTrialExpiration();
      }
      
      countdownEl.innerHTML = '<span class="text-danger">Expired</span>';
      
      if (modalCountdown) {
        modalCountdown.innerHTML = '<span class="text-danger">Trial ended on ' + TRIAL_END.toLocaleDateString() + '</span>';
      }
      
      if (timeRemaining) {
        timeRemaining.textContent = 'Trial expired';
      }
      
      if (trialBanner) {
        trialBanner.classList.remove('visible');
      }
      
      const progressBar = document.getElementById('trialProgress');
      if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.className = 'progress-bar bg-secondary';
      }
      
      return;
    }
    
    // Trial still active
    isTrialExpired = false;
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    // Calculate percentage of trial completed
    const totalDuration = 7 * 24 * 60 * 60 * 1000;
    const elapsed = now - TRIAL_START;
    const percentRemaining = Math.max(0, Math.min(100, 100 - (elapsed / totalDuration * 100)));
    
    // Update progress bar
    const progressBar = document.getElementById('trialProgress');
    if (progressBar) {
      progressBar.style.width = percentRemaining + '%';
      
      if (percentRemaining < 20) {
        progressBar.className = 'progress-bar bg-danger';
      } else if (percentRemaining < 50) {
        progressBar.className = 'progress-bar bg-warning';
      } else {
        progressBar.className = 'progress-bar bg-success';
      }
    }
    
    // Update time remaining text
    if (timeRemaining) {
      if (diffDays > 0) {
        timeRemaining.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
      } else if (diffHours > 0) {
        timeRemaining.textContent = `${diffHours}h ${diffMinutes}m left`;
      } else {
        timeRemaining.textContent = `${diffMinutes}m left`;
      }
    }
    
    // Format banner text
    let bannerText;
    if (diffDays > 0) {
      bannerText = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      bannerText = `${diffHours}h ${diffMinutes}m`;
    } else {
      bannerText = `${diffMinutes}m`;
    }
    
    if (diffDays === 0) {
      countdownEl.innerHTML = `<span class="text-warning font-weight-bold">${bannerText}</span>`;
    } else {
      countdownEl.textContent = bannerText;
    }
    
    // Format modal text
    if (modalCountdown) {
      let modalText;
      if (diffDays > 0) {
        modalText = `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
      } else if (diffHours > 0) {
        modalText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
      } else {
        modalText = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`;
      }
      
      const endDateStr = TRIAL_END.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      modalCountdown.innerHTML = `${modalText} <small class="text-muted">(ends ${endDateStr})</small>`;
    }
  }

  function handleTrialExpiration() {
    console.log('Trial expired at', new Date().toISOString());
    
    // Update premium tabs
    const premiumTabContents = ['monthly', 'trend', 'growth', 'seasonal'];
    
    premiumTabContents.forEach(tabId => {
      const tabPane = document.getElementById(tabId);
      if (tabPane) {
        tabPane.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-crown fa-4x mb-3" style="color: #fd79a8;"></i>
            <h3>Premium Feature</h3>
            <p class="lead">This feature is now available in the desktop app.</p>
            <button class="btn btn-primary btn-lg" onclick="downloadInstaller()">
              <i class="fas fa-download mr-2"></i> Download Windows App
            </button>
            <p class="mt-3 text-muted small">Get unlimited access to all features permanently.</p>
          </div>
        `;
      }
    });
    
    // Hide premium tab badges
    document.querySelectorAll('.nav-link .badge').forEach(badge => {
      badge.style.display = 'none';
    });
    
    // Add Upgrade badges to premium tabs
    document.querySelectorAll('[href="#monthly"], [href="#trend"], [href="#growth"], [href="#seasonal"]').forEach(tab => {
      const parent = tab.parentElement;
      const upgradeBadge = document.createElement('span');
      upgradeBadge.className = 'badge badge-warning ml-1';
      upgradeBadge.textContent = 'Upgrade';
      tab.appendChild(upgradeBadge);
    });
    
    // Update premium export buttons
    ['exportMonthlyBtn', 'exportTrendBtn', 'exportGrowthBtn', 'exportSeasonalBtn'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.remove('export-btn', 'btn-primary');
        btn.classList.add('btn-secondary');
        btn.innerHTML = '<i class="fas fa-lock mr-2"></i> Upgrade to Export';
      }
    });
    
    // Clear premium charts
    if (trendChart) { trendChart.destroy(); trendChart = null; }
    if (growthChart) { growthChart.destroy(); growthChart = null; }
    if (seasonalChart) { seasonalChart.destroy(); seasonalChart = null; }
    
    // Show upgrade modal after 30 seconds
    setTimeout(() => {
      if (document.visibilityState === 'visible' && !sessionStorage.getItem('upgradeModalShown')) {
        $('#upgradeModal').modal('show');
        sessionStorage.setItem('upgradeModalShown', 'true');
      }
    }, 30000);
  }

  // Initialize countdown
  updateCountdown();
  setInterval(updateCountdown, 1000 * 60);

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

    // Build all features but premium ones will be hidden if trial expired
    buildDailyWeeklyMonthly(filtered);
    
    if (!isTrialExpired) {
      buildTrend(filtered);
      buildGrowth(filtered);
      buildSeasonal(filtered);
    } else {
      showPremiumUpgradeMessages();
    }
  }

  function showPremiumUpgradeMessages() {
    const premiumTables = ['trendTable', 'growthTable', 'seasonalTable'];
    premiumTables.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `
          <div class="alert alert-warning text-center">
            <i class="fas fa-crown mr-2"></i>
            <strong>Premium Feature</strong> - Available in desktop app
            <button class="btn btn-sm btn-primary ml-2" onclick="downloadInstaller()">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        `;
      }
    });
    
    // Clear charts
    if (trendChart) { trendChart.destroy(); trendChart = null; }
    if (growthChart) { growthChart.destroy(); growthChart = null; }
    if (seasonalChart) { seasonalChart.destroy(); seasonalChart = null; }
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
      if (!daily[dateISO]) {
        daily[dateISO] = { 
          display: dateDisplay, 
          sendTime: formatTimeFromRow(r['Send Time']), 
          campaigns: {} 
        };
      }
      if (!daily[dateISO].campaigns[campaignName]) {
        daily[dateISO].campaigns[campaignName] = { 
          subject, 
          count: 0, 
          openRateSum: 0, 
          clickRateSum: 0, 
          convRateSum: 0, 
          revenueSum: 0, 
          sendDays, 
          listSegment 
        };
      }
      const dc = daily[dateISO].campaigns[campaignName];
      dc.count++;
      dc.openRateSum += openRate;
      dc.clickRateSum += clickRate;
      dc.convRateSum += convRate;
      dc.revenueSum += revenue;
      
      // Weekly
      if (!weekly[weekKey]) {
        weekly[weekKey] = { 
          display: weekDisplay, 
          revenueSum: 0, 
          recipientsSum: 0, 
          opensSum: 0, 
          clicksSum: 0, 
          count: 0 
        };
      }
      weekly[weekKey].revenueSum += revenue;
      weekly[weekKey].recipientsSum += recipients;
      weekly[weekKey].opensSum += uniqueOpens;
      weekly[weekKey].clicksSum += uniqueClicks;
      weekly[weekKey].count++;
      
      // Monthly
      if (!monthly[monthKey]) {
        monthly[monthKey] = { 
          display: monthDisplay, 
          revenueSum: 0, 
          recipientsSum: 0, 
          opensSum: 0, 
          clicksSum: 0, 
          count: 0 
        };
      }
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
      weeklyOutput.push([
        w.display, 
        formatMoney(w.revenueSum), 
        formatNumberInt(w.recipientsSum), 
        formatNumberInt(w.opensSum), 
        formatNumberInt(w.clicksSum)
      ]);
    });
    outputs.weekly = weeklyOutput;
    renderTable('weeklyTable', weeklyOutput);
    
    // Monthly output (store for potential use)
    const monthlyOutput = [['Month', 'Total Revenue', 'Total Recipients', 'Total Opens', 'Total Clicks']];
    Object.keys(monthly).sort().forEach(monthKey => {
      const m = monthly[monthKey];
      monthlyOutput.push([
        m.display, 
        formatMoney(m.revenueSum), 
        formatNumberInt(m.recipientsSum), 
        formatNumberInt(m.opensSum), 
        formatNumberInt(m.clicksSum)
      ]);
    });
    outputs.monthly = monthlyOutput;
    
    // Only render monthly table if trial not expired
    if (!isTrialExpired) {
      renderTable('monthlyTable', monthlyOutput);
    } else {
      const monthlyTable = document.getElementById('monthlyTable');
      if (monthlyTable) {
        monthlyTable.innerHTML = `
          <div class="alert alert-warning text-center">
            <i class="fas fa-crown mr-2"></i>
            <strong>Monthly data available in desktop app</strong>
            <button class="btn btn-sm btn-primary ml-2" onclick="downloadInstaller()">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        `;
      }
    }
  }

  function buildTrend(rows) {
    if (isTrialExpired) return;
    
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
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Revenue: $' + context.raw.toFixed(2);
                }
              }
            }
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { 
                callback: function(v) { return '$' + v; } 
              } 
            } 
          }
        }
      });
    }
  }

  function buildGrowth(rows) {
    if (isTrialExpired) return;
    
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
            backgroundColor: 'rgba(108, 92, 231, 0.7)',
            borderRadius: 6
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Revenue: $' + context.raw.toFixed(2);
                }
              }
            }
          },
          scales: { 
            x: { 
              ticks: { 
                callback: function(v) { return '$' + v; } 
              } 
            } 
          }
        }
      });
    }
  }

  function buildSeasonal(rows) {
    if (isTrialExpired) return;
    
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
            backgroundColor: 'rgba(253, 121, 168, 0.7)',
            borderRadius: 6
          }] 
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Avg Revenue: $' + context.raw.toFixed(2);
                }
              }
            }
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { 
                callback: function(v) { return '$' + v; } 
              } 
            } 
          }
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
      responsive: true,
      destroy: true
    });
  }

  // ========== CSV DOWNLOAD ==========
  function downloadCSV(arr2d, filename) {
    if (!arr2d || arr2d.length === 0) { 
      alert('No data to export'); 
      return; 
    }
    
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
    setTimeout(() => { 
      document.body.removeChild(a); 
      URL.revokeObjectURL(url); 
    }, 150);
  }

  // ========== INSTALLER DOWNLOAD ==========
  window.downloadInstaller = function() {
    // In production: window.location.href = 'KlaviyoAnalytics_Setup.exe';
    alert('🚀 Windows App download started!\n\nIn production, this would download: KlaviyoAnalytics_Setup.exe');
    console.log('Installer download clicked at', new Date().toISOString());
    
    // Track download event (for analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download_click', {
        'event_category': 'installer',
        'event_label': 'Windows App'
      });
    }
  };

  // ========== INITIALIZATION ==========
  // Check trial status on load
  updateCountdown();
  
  // Add CSS for toast animations if not present
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .upgrade-toast {
      animation: slideIn 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  console.log('Klaviyo Analytics Dashboard initialized');
  console.log('Trial period:', TRIAL_START.toLocaleDateString(), '-', TRIAL_END.toLocaleDateString());
})();