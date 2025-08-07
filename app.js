const github = new Github();
const ui = new UI();

const userInput = document.querySelector('#searchUser');

userInput.addEventListener('keyup', (e) => {
    const input_text = e.target.value;

    if (input_text != '') {
        github.getUser(input_text).then(data => {
            if (data.profile.message === 'Not Found') {
                ui.showMessage('UserName not found', 'alert alert-danger');
            } else {
                ui.showProfile(data.profile);
                ui.showRepo(data.repo);
            }
        }).catch(error => console.log(error))

    } else {
        ui.clearProfile();
    }
})

 function initializeModalWithCharts() {
    document.querySelectorAll('.loading-overlay').forEach(el => fadeIn(el));
    
    fetch('/run_time_history')
      .then(response => response.json())
      .then(runtimeData => {
        document.querySelectorAll('.loading-overlay').forEach(el => fadeOut(el));
        const enhancedJobsData = mergeJobsWithRuntimeData(jobsData, runtimeData);
        
        const jobsModal = new bootstrap.Modal(document.getElementById('jobsListModal'));
        jobsModal.show();
        initializeJobsDataTable(enhancedJobsData);
      })
      .catch(error => {
        document.querySelectorAll('.loading-overlay').forEach(el => fadeOut(el));
        console.error('Error fetching runtime data:', error);
        
        const enhancedJobsData = jobsData.map(job => ({
          ...job,
          avgRunTime: 'N/A',
          chartData: null
        }));
        
        const jobsModal = new bootstrap.Modal(document.getElementById('jobsListModal'));
        jobsModal.show();
        initializeJobsDataTable(enhancedJobsData);
      });
  }
}

function mergeJobsWithRuntimeData(jobsData, runtimeData) {
  return jobsData.map(job => {
    const runtimeInfo = runtimeData.find(rt => rt.jobname === job.jobname);
    
    if (!runtimeInfo) {
      return {
        ...job,
        avgRunTime: 'N/A',
        chartData: null
      };
    }
    
    const avgRunTime = `${runtimeInfo.AvgRunTime} min`;
    const chartData = createChartData(runtimeInfo);
    
    return {
      ...job,
      avgRunTime,
      chartData
    };
  });
}

function createChartData(runtimeInfo) {
  const dates = Object.keys(runtimeInfo)
    .filter(key => key !== 'jobname' && key !== 'AvgRunTime' && key.match(/^\d{4}-\d{2}-\d{2}$/))
    .sort();

  if (dates.length === 0) return null;

  const labels = dates.map(date => date.substring(5)); // MM-DD format
  const data = dates.map(date => {
    const val = runtimeInfo[date];
    if (val === 'No Run' || val === null || val === undefined) {
      return 0;
    }
    return parseTimeToMinutes(val);
  });
  const noRunFlags = dates.map(date => runtimeInfo[date] === 'No Run');

  return { labels, data, noRunFlags };
}

function parseTimeToMinutes(timeString) {
  // Handle different time formats
  if (typeof timeString !== 'string') {
    return parseFloat(timeString) || 0;
  }
  
  // Remove any trailing text like " min" if present
  const cleanTime = timeString.replace(/\s*min\s*$/i, '').trim();
  
  // Check if it's already in decimal format (e.g., "45.5")
  if (/^\d+\.?\d*$/.test(cleanTime)) {
    return parseFloat(cleanTime);
  }
  
  // Parse time format (mm:ss or hh:mm:ss)
  const timeParts = cleanTime.split(':');
  let totalMinutes = 0;
  
  if (timeParts.length === 2) {
    // mm:ss format
    const minutes = parseInt(timeParts[0], 10) || 0;
    const seconds = parseInt(timeParts[1], 10) || 0;
    totalMinutes = minutes + (seconds / 60);
  } else if (timeParts.length === 3) {
    // hh:mm:ss format
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    totalMinutes = (hours * 60) + minutes + (seconds / 60);
  } else {
    // Fallback to parseFloat for any other format
    totalMinutes = parseFloat(cleanTime) || 0;
  }
  
  return Math.round(totalMinutes * 100) / 100; // Round to 2 decimal places
}


function initializeJobsDataTable(enhancedJobsData) {
  let jobsTable;
  if ($.fn.DataTable.isDataTable('#jobsTable')) {
    $('#jobsTable').DataTable().destroy();
  }
  
  jobsTable = $('#jobsTable').DataTable({
    data: enhancedJobsData,
    columns: [
      { 
        data: 'jobname', 
        title: 'Job Name',
        width: '25%'
      },
      { 
        data: 'status', 
        title: 'Status',
        width: '15%'
      },
      {
        data: 'avgRunTime',
        title: 'Avg Runtime',
        width: '15%',
        className: 'text-center'
      },
      {
        data: 'chartData',
        title: 'Last 5 Days Trend',
        width: '30%',
        render: function(data, type, row, meta) {
          if (type === 'display') {
            if (!data) {
              return '<span class="text-muted">No data available</span>';
            }
            const chartId = `chart-${meta.row}`;
            return `<div style="position: relative; overflow: visible; z-index: 1000;">
  <canvas id="${chartId}" class="runtime-chart"></canvas>
</div>`;
          }
          return data ? 'Chart' : 'No data';
        }
      },
      {
        data: null,
        title: 'Actions',
        width: '15%',
        render: function(data, type, row) {
          const status = row.status.toUpperCase();
          const isClickable = ['NOT_STARTED', 'IN_PROGRESS', 'FAILED'].includes(status);
          
          if (isClickable) {
            return `<button class="btn btn-sm btn-primary view-job-details" data-job-name="${row.jobname}" data-job-status="${row.status}">View Flow</button>`;
          } else {
            return `<button class="btn btn-sm btn-secondary" disabled>View Flow</button>`;
          }
        }
      }
    ],
    responsive: true,
    pageLength: 10,
    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
    language: {
      search: "",
      searchPlaceholder: "Search jobs...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "Showing 0 to 0 of 0 entries",
      infoFiltered: "(filtered from _MAX_ total entries)"
    },
    drawCallback: function() {
      // Create charts after table is drawn
      enhancedJobsData.forEach((job, index) => {
        if (job.chartData) {
          createSparklineChart(`chart-${index}`, job.chartData);
        }
      });
    }
  });
  
  function createSparklineChart(canvasId, chartData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 123, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 123, 255, 0.05)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.data,
        borderColor: '#007bff',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#0056b3',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }],
      noRunFlags: chartData.noRunFlags
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: externalTooltipHandler
        }
      },
      scales: {
        x: { display: false },
        y: { display: false, grid: { display: false } }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function externalTooltipHandler(context) {
  let tooltipEl = document.getElementById('chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltipEl.style.color = '#fff';
    tooltipEl.style.padding = '8px 10px';
    tooltipEl.style.borderRadius = '6px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.whiteSpace = 'nowrap';
    tooltipEl.style.zIndex = '9999';
    document.body.appendChild(tooltipEl);
  }

  const { chart, tooltip } = context;

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  const labels = chart.data.labels;
  const data = chart.data.datasets[0].data;
  const noRunFlags = chart.data.noRunFlags || [];

  tooltipEl.innerHTML = labels.map((label, i) => {
    if (noRunFlags[i]) {
      return `${label}: No Run`;
    }
    
    const minutes = data[i];
    let displayTime;
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      displayTime = `${hours}h ${mins}m`;
    } else {
      displayTime = `${Math.floor(minutes)} min`;

    }
    
    return `${label}: ${displayTime}`;
  }).join('<br>');

  const canvasRect = chart.canvas.getBoundingClientRect();
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = canvasRect.left + window.pageXOffset + tooltip.caretX + 'px';
  tooltipEl.style.top = canvasRect.top + window.pageYOffset + tooltip.caretY + 'px';
}


// Add CSS for charts
if (!document.querySelector('#chart-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'chart-styles';
  styleElement.textContent = `
    .runtime-chart {
      height: 50px !important;
      width: 250px !important;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
        position: relative;
        z-index: 20;
    }
  #jobsTable {
  table-layout: auto; /* ensures the canvas has space */
}

   

    #jobsTable td {
  overflow: visible !important;
  position: relative;
  z-index: 10;
}
    #jobsTable th {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    
    .table-responsive {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(styleElement);
}
