// History Page Module
const HistoryPage = (() => {
  // DOM Elements
  const stepsChartCanvas = document.getElementById('stepsChart');
  const caloriesChartCanvas = document.getElementById('caloriesChart');
  const activityTable = document.getElementById('activityTable');
  const periodButtons = document.querySelectorAll('.period-selector button');
  
  // Chart instances
  let stepsChart = null;
  let caloriesChart = null;
  
  // Data period
  let currentPeriod = 'week';
  
  // Chart config
  const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += App.formatNumber(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return App.formatNumber(value);
          }
        }
      }
    }
  };
  
  // Initialize the history page
  const init = () => {
    setupEventListeners();
    loadHistoryData();
  };
  
  // Setup event listeners
  const setupEventListeners = () => {
    periodButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        periodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update period and reload data
        currentPeriod = button.getAttribute('data-period');
        loadHistoryData();
      });
    });
  };
  
  // Load history data
  const loadHistoryData = () => {
    const days = currentPeriod === 'week' ? 7 : 30;
    const activityHistory = MockDataService.getActivityHistory(days);
    
    // Update charts
    updateStepsChart(activityHistory);
    updateCaloriesChart(activityHistory);
    
    // Update activity table
    updateActivityTable(activityHistory);
  };
  
  // Update steps chart
  const updateStepsChart = (activityHistory) => {
    // Prepare data
    const labels = activityHistory.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const stepsData = activityHistory.map(day => day.steps);
    
    // User's step goal
    const userProfile = MockDataService.getUserProfile();
    const stepGoal = userProfile.goals.steps;
    
    // Create goal line dataset
    const goalData = Array(labels.length).fill(stepGoal);
    



    
    // Create chart data
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Steps',
          data: stepsData,
          backgroundColor: 'rgba(67, 97, 238, 0.8)',
          borderColor: 'rgba(67, 97, 238, 1)',
          borderWidth: 2,
          borderRadius: 5,
          maxBarThickness: 40
        },
        {
          label: 'Goal',
          data: goalData,
          type: 'line',
          fill: false,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0
        }
      ]
    };
    
    // Destroy existing chart
    if (stepsChart) {
      stepsChart.destroy();
    }
    
    // Create chart
    stepsChart = new Chart(stepsChartCanvas, {
      type: 'bar',
      data: data,
      options: chartConfig
    });
  };
  
  // Update calories chart
  const updateCaloriesChart = (activityHistory) => {
    // Prepare data
    const labels = activityHistory.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const caloriesData = activityHistory.map(day => day.calories);
    
    // User's calorie goal
    const userProfile = MockDataService.getUserProfile();
    const calorieGoal = userProfile.goals.calories;
    
    // Create goal line dataset
    const goalData = Array(labels.length).fill(calorieGoal);
    
    // Create chart data
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Calories',
          data: caloriesData,
          backgroundColor: 'rgba(247, 37, 133, 0.8)',
          borderColor: 'rgba(247, 37, 133, 1)',
          borderWidth: 2,
          borderRadius: 5,
          maxBarThickness: 40
        },
        {
          label: 'Goal',
          data: goalData,
          type: 'line',
          fill: false,
          borderColor: 'rgba(76, 201, 168, 0.8)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0
        }
      ]
    };
    
    // Destroy existing chart
    if (caloriesChart) {
      caloriesChart.destroy();
    }
    
    // Create chart
    caloriesChart = new Chart(caloriesChartCanvas, {
      type: 'bar',
      data: data,
      options: chartConfig
    });
  };
  
  // Update activity table
  const updateActivityTable = (activityHistory) => {
    // Clear current table
    activityTable.innerHTML = '';
    
    // Sort by date (most recent first)
    const sortedHistory = [...activityHistory].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Add rows
    sortedHistory.forEach(activity => {
      const date = new Date(activity.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      
      const goalsMet = [
        activity.goalsMet.steps,
        activity.goalsMet.calories,
        activity.goalsMet.activeMinutes
      ].filter(Boolean).length;
      
      const goalsMark = goalsMet > 0 ? 
        `<span class="goal-status met"><i class="bi bi-check"></i></span>` : 
        `<span class="goal-status not-met"><i class="bi bi-x"></i></span>`;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${App.formatNumber(activity.steps)}</td>
        <td>${App.formatNumber(activity.calories)}</td>
        <td>${activity.activeMinutes}</td>
        <td class="text-center">${goalsMark}</td>
      `;
      
      activityTable.appendChild(row);
    });
    
    // If no history
    if (sortedHistory.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" class="text-center py-3">No activity data available.</td>
      `;
      activityTable.appendChild(emptyRow);
    }
  };
  
  // Return public methods
  return {
    init
  };
})();




  // Map initialization
  var map = L.map('map').setView([11.0168, 76.9558], 13); // Coimbatore location

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Marker
  L.marker([11.0168, 76.9558]).addTo(map)
    .bindPopup('Your Activity Location')
    .openPopup();



