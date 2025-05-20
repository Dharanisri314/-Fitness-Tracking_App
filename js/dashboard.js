// Dashboard Page Module
const DashboardPage = (() => {
  // DOM Elements
  const currentDateElement = document.getElementById('currentDate');
  const stepsCount = document.getElementById('stepsCount');
  const stepsProgress = document.getElementById('stepsProgress');
  const stepsPercentage = document.getElementById('stepsPercentage');
  const caloriesCount = document.getElementById('caloriesCount');
  const caloriesProgress = document.getElementById('caloriesProgress');
  const activeTime = document.getElementById('activeTime');
  const activeProgress = document.getElementById('activeProgress');
  const activityTimeline = document.getElementById('activityTimeline');
  const achievementsList = document.getElementById('achievementsList');
  const healthStats = document.getElementById('healthStats');
  const stepGoalBadge = document.getElementById('stepGoalBadge');

  // Activity data
  let todayActivity = null;
  
  // Initialize the dashboard page
  const init = () => {
    // Set current date
    const today = new Date();
    currentDateElement.textContent = App.formatDate(today);
    
    // Load activity data
    loadActivityData();
    
    // Load achievements
    loadAchievements();
    
    // Load health stats
    loadHealthStats();
  };
  
  // Load activity data
  const loadActivityData = () => {
    todayActivity = MockDataService.getTodayActivity();
    updateActivityData(todayActivity);
  };
  
  // Update activity data display
  const updateActivityData = (activity) => {
    if (!activity) return;
    
    // Cache the activity
    todayActivity = activity;
    
    // Get user profile for goals
    const userProfile = MockDataService.getUserProfile();
    const { goals } = userProfile;
    
    // Update steps goal badge
    stepGoalBadge.textContent = `Goal: ${App.formatNumber(goals.steps)}`;
    
    // Update steps
    const stepsValue = activity.steps;
    const stepsGoal = goals.steps;
    const stepsPercent = Math.min(Math.round((stepsValue / stepsGoal) * 100), 100);
    
    stepsCount.textContent = App.formatNumber(stepsValue);
    stepsPercentage.textContent = `${stepsPercent}%`;
    stepsProgress.style.background = `conic-gradient(var(--primary-color) ${stepsPercent}%, var(--neutral-200) 0%)`;
    
    if (stepsValue >= stepsGoal && !stepsProgress.classList.contains('goal-reached')) {
      stepsProgress.classList.add('goal-reached');
      stepsProgress.classList.add('pulse-animation');
      setTimeout(() => {
        stepsProgress.classList.remove('pulse-animation');
      }, 750);
    }
    
    // Update calories
    const caloriesValue = activity.calories;
    const caloriesGoal = goals.calories;
    const caloriesPercent = Math.min(Math.round((caloriesValue / caloriesGoal) * 100), 100);
    
    caloriesCount.textContent = App.formatNumber(caloriesValue);
    caloriesProgress.style.background = `conic-gradient(var(--accent-color) ${caloriesPercent}%, var(--neutral-200) 0%)`;
    
    // Update active time
    const activeValue = activity.activeMinutes;
    const activeGoal = goals.activeMinutes;
    const activePercent = Math.min(Math.round((activeValue / activeGoal) * 100), 100);
    
    activeTime.textContent = App.formatNumber(activeValue);
    activeProgress.style.background = `conic-gradient(var(--success-color) ${activePercent}%, var(--neutral-200) 0%)`;
    
    // Update timeline
    updateTimeline(activity);
  };
  
  // Update activity timeline
  const updateTimeline = (activity) => {
    // Clear current timeline
    activityTimeline.innerHTML = '';
    
    // Get current hour
    const currentHour = new Date().getHours();
    
    // Display meaningful activities from the hourly breakdown
    const hourlyData = activity.hourlyBreakdown.slice(0, currentHour + 1);
    
    // Sort by significance (highest values first)
    const significantActivities = hourlyData
      .filter(hour => hour.steps > 100 || hour.activeMinutes > 0)
      .sort((a, b) => {
        const aSignificance = a.steps + (a.activeMinutes * 100);
        const bSignificance = b.steps + (b.activeMinutes * 100);
        return bSignificance - aSignificance;
      })
      .slice(0, 5); // Limit to top 5
    
    // Add timeline items
    significantActivities.forEach(hour => {
      const timeStr = `${hour.hour === 0 ? '12' : (hour.hour > 12 ? hour.hour - 12 : hour.hour)}${hour.hour >= 12 ? 'PM' : 'AM'}`;
      
      // Determine which activity to highlight
      let itemType, content;
      if (hour.activeMinutes > 5) {
        itemType = 'active';
        content = `<i class="bi bi-stopwatch"></i> ${hour.activeMinutes} minutes of activity`;
      } else if (hour.steps > 500) {
        itemType = 'steps';
        content = `<i class="bi bi-footprints"></i> ${hour.steps} steps taken`;
      } else {
        itemType = 'calories';
        content = `<i class="bi bi-fire"></i> ${hour.calories} calories burned`;
      }
      
      const timelineItem = document.createElement('div');
      timelineItem.className = `timeline-item ${itemType}`;
      timelineItem.innerHTML = `
        <div class="timeline-time">${timeStr}</div>
        <div class="timeline-content">${content}</div>
      `;
      
      activityTimeline.appendChild(timelineItem);
    });
    
    // If no significant activities
    if (significantActivities.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center text-muted py-3';
      emptyState.innerHTML = '<i class="bi bi-calendar-x"></i> No significant activity recorded yet today.';
      activityTimeline.appendChild(emptyState);
    }
  };
  
  // Load achievements
  const loadAchievements = () => {
    const achievements = MockDataService.getAchievements();
    
    // Clear current achievements
    achievementsList.innerHTML = '';
    
    // Add achievements
    if (achievements.length === 0) {
      achievementsList.innerHTML = `
        <div class="text-center text-muted py-3">
          <i class="bi bi-trophy"></i> Complete your goals to earn achievements!
        </div>
      `;
    } else {
      achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        achievementItem.innerHTML = `
          <div class="achievement-icon">
            <i class="bi ${achievement.icon}"></i>
          </div>
          <div class="achievement-details">
            <div class="achievement-title">${achievement.title}</div>
            <p class="achievement-desc">${achievement.description}</p>
          </div>
        `;
        
        achievementsList.appendChild(achievementItem);
      });
    }
  };
  
  // Load health stats
  const loadHealthStats = () => {
    const metrics = MockDataService.getHealthMetrics();
    
    // Clear current health stats
    healthStats.innerHTML = '';
    
    // Add health stat items
    const healthItems = [
      {
        label: 'BMI',
        value: metrics.bmi,
        unit: '',
        icon: 'bi-rulers'
      },
      {
        label: 'Resting Heart Rate',
        value: metrics.restingHeartRate,
        unit: 'bpm',
        icon: 'bi-heart-pulse'
      },
      {
        label: 'Sleep',
        value: metrics.sleepHours,
        unit: 'hours',
        icon: 'bi-moon'
      },
      {
        label: 'Water Intake',
        value: (metrics.waterIntake / 1000).toFixed(1),
        unit: 'L',
        icon: 'bi-droplet'
      }
    ];
    
    healthItems.forEach(item => {
      const statItem = document.createElement('div');
      statItem.className = 'health-stat-item';
      statItem.innerHTML = `
        <div class="health-stat-label">
          <i class="bi ${item.icon}"></i> ${item.label}
        </div>
        <div class="health-stat-value">
          ${item.value}<span>${item.unit}</span>
        </div>
      `;
      
      healthStats.appendChild(statItem);
    });
  };
  
  // Return public methods
  return {
    init,
    updateActivityData
  };
})();