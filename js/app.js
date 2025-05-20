// Main Application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  const App = (() => {
    // DOM Elements - Navigation
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    
    // DOM Elements - Theme
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // DOM Elements - Notifications
    const notificationToast = document.getElementById('notificationToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Bootstrap Toast instance
    const toast = new bootstrap.Toast(notificationToast);
    
    // Current page
    let currentPage = 'dashboard';
    
    // Initialize and setup event listeners
    const init = () => {
      setupEventListeners();
      loadThemePreference();
      setGreeting();
      setupSimulation();
      
      // Load initial page
      document.querySelector('.nav-links li.active a').click();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
      // Sidebar toggle
      sidebarToggle.addEventListener('click', toggleSidebar);
      
      // Navigation
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const pageId = link.getAttribute('data-page');
          navigateToPage(pageId);
        });
      });
      
      // Theme toggle
      themeToggle.addEventListener('click', toggleTheme);
      
      // Window resize handler
      window.addEventListener('resize', handleResize);
    };
    
    // Toggle sidebar
    const toggleSidebar = () => {
      sidebar.classList.toggle('active');
    };
    
    // Navigate to page
    const navigateToPage = (pageId) => {
      if (pageId === currentPage) return;
      
      // Update active class in navigation
      navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Show active page
      pages.forEach(page => {
        if (page.id === pageId) {
          page.classList.add('active');
        } else {
          page.classList.remove('active');
        }
      });
      
      // Update current page
      currentPage = pageId;
      
      // On mobile, close sidebar after navigation
      if (window.innerWidth < 992) {
        sidebar.classList.remove('active');
      }
      
      // Trigger page specific initialization
      initPageContent(pageId);
    };
    
    // Initialize page content
    const initPageContent = (pageId) => {
      switch (pageId) {
        case 'dashboard':
          DashboardPage.init();
          break;
        case 'history':
          HistoryPage.init();
          break;
        case 'profile':
          ProfilePage.init();
          break;
      }
    };
    
    // Toggle theme (light/dark)
    const toggleTheme = () => {
      const currentTheme = document.body.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.body.setAttribute('data-bs-theme', newTheme);
      themeIcon.className = newTheme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
      
      // Save preference
      localStorage.setItem('theme', newTheme);
    };
    
    // Load theme preference
    const loadThemePreference = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.body.setAttribute('data-bs-theme', savedTheme);
        themeIcon.className = savedTheme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
      }
    };
    
    // Set greeting based on time of day
    const setGreeting = () => {
      const greetingElement = document.getElementById('greetingText');
      const hour = new Date().getHours();
      let greeting = '';
      
      if (hour < 12) {
        greeting = 'Good morning, ';
      } else if (hour < 18) {
        greeting = 'Good afternoon, ';
      } else {
        greeting = 'Good evening, ';
      }
      
      greetingElement.textContent = greeting;
      
      // Set user name
      const userProfile = MockDataService.getUserProfile();
      document.getElementById('userName').textContent = userProfile.name.split(' ')[0];
    };
    
    // Handle resize
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        sidebar.classList.remove('active');
      }
    };
    
    // Show notification
    const showNotification = (title, message, icon = 'bi-trophy-fill') => {
      const iconElement = notificationToast.querySelector('.toast-header i');
      iconElement.className = `bi ${icon} me-2 text-warning`;
      
      toastTitle.textContent = title;
      toastMessage.textContent = message;
      
      toast.show();
    };
    
    // Setup activity simulation (for demo purposes)
    const setupSimulation = () => {
      // Simulate activity updates every 30 seconds
      setInterval(() => {
        if (currentPage === 'dashboard') {
          const updatedActivity = MockDataService.refreshActivityData();
          DashboardPage.updateActivityData(updatedActivity);
          
          // Random chance of showing a notification
          if (Math.random() > 0.7) {
            const notificationTypes = [
              {
                title: '1,000 Steps Milestone',
                message: `You've reached ${Math.floor(updatedActivity.steps / 1000) * 1000} steps today!`,
                icon: 'bi-footprints me-2 text-primary'
              },
              {
                title: 'Calories Burned',
                message: `You've burned over ${Math.floor(updatedActivity.calories / 100) * 100} calories today!`,
                icon: 'bi-fire me-2 text-danger'
              },
              {
                title: 'Active Time',
                message: `You've been active for ${Math.floor(updatedActivity.activeMinutes / 10) * 10} minutes today!`,
                icon: 'bi-stopwatch me-2 text-success'
              }
            ];
            
            const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
            showNotification(randomNotification.title, randomNotification.message, randomNotification.icon);
          }
        }
      }, 30000);
    };
    
    // Format date: "Monday, January 1"
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Format number with commas
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    // Return public methods
    return {
      init,
      navigateToPage,
      showNotification,
      formatDate,
      formatNumber
    };
  })();
  
  // Initialize the app
  App.init();
});