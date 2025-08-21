// Global variables
let currentTheme = 'light';
let sidebarExpanded = true;
let realTimeInterval;
let charts = {};

// Sample data based on provided JSON
const sampleData = {
    airQualityData: [
        {"timestamp": "2025-08-20 20:48:00", "aqi": 87, "co2": 420, "pm25": 15, "pm10": 25, "status": "Moderate", "location": "Academic Block A"},
        {"timestamp": "2025-08-20 20:47:00", "aqi": 92, "co2": 435, "pm25": 18, "pm10": 28, "status": "Moderate", "location": "Academic Block A"},
        {"timestamp": "2025-08-20 20:46:00", "aqi": 78, "co2": 398, "pm25": 12, "pm10": 22, "status": "Good", "location": "Academic Block A"}
    ],
    waterQualityData: [
        {"timestamp": "2025-08-20 20:48:00", "ph": 7.2, "turbidity": 2.1, "dissolvedOxygen": 8.5, "temperature": 23.4, "conductivity": 520, "status": "Good"},
        {"timestamp": "2025-08-20 20:47:00", "ph": 7.1, "turbidity": 2.3, "dissolvedOxygen": 8.2, "temperature": 23.6, "conductivity": 515, "status": "Good"}
    ],
    energyData: [
        {"building": "Academic Block CME", "consumption": 145.2, "cost": 21.78, "efficiency": "High"},
        {"building": "Academic Block ICT", "consumption": 132.8, "cost": 19.92, "efficiency": "Medium"},
        {"building": "Central Library", "consumption": 98.5, "cost": 14.78, "efficiency": "High"},
        {"building": "Heritage Canteen", "consumption": 156.7, "cost": 23.51, "efficiency": "Medium"}
    ],
    wasteData: [
        {"type": "Organic", "amount": 45.2, "percentage": 42},
        {"type": "Plastic", "amount": 18.7, "percentage": 17},
        {"type": "Paper", "amount": 24.1, "percentage": 22},
        {"type": "Metal", "amount": 8.3, "percentage": 8},
        {"type": "Glass", "amount": 12.1, "percentage": 11}
    ],
    fuelData: {"consumption": 25.6, "cost": 30.72, "efficiency": 87.5, "tankLevel": 78, "status": "Normal"},
    carbonFootprint: {"scope1": 145.2, "scope2": 287.6, "scope3": 98.4, "total": 531.2, "monthlyTarget": 500},
    alerts: [
        {"type": "warning", "message": "Air quality moderate in Academic Block A", "timestamp": "2025-08-20 20:45:00"},
        {"type": "info", "message": "Energy efficiency improved by 5% this month", "timestamp": "2025-08-20 18:30:00"}
    ]
};

// Chart colors
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeApp();
    setupEventListeners();
    startRealTimeUpdates();
    displayAlerts();
    updateTime();
    setInterval(updateTime, 1000);
    
    // Initialize charts after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 500);
});

function initializeApp() {
    console.log('Setting up initial app state...');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    updateThemeIcon();
    
    // Update KPI values
    updateKPIValues();
    
    // Ensure dashboard is active by default
    navigateToPage('dashboard');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle listener added');
    } else {
        console.error('Theme toggle button not found');
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} navigation items`);
    
    navItems.forEach((item, index) => {
        const page = item.getAttribute('data-page');
        console.log(`Setting up listener for nav item ${index}: ${page}`);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Navigation clicked: ${page}`);
            navigateToPage(page);
        });
    });
    
    // Carbon calculator
    const calculateBtn = document.getElementById('calculateCarbon');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateCarbonFootprint);
    }
    
    // Report generation
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
    
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Modal handlers
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    const ackBtn = document.getElementById('acknowledgeAlert');
    if (ackBtn) {
        ackBtn.addEventListener('click', acknowledgeAlert);
    }
}

function toggleSidebar() {
    console.log('Toggling sidebar...');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        sidebarExpanded = !sidebarExpanded;
        
        // On mobile, show/hide sidebar
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('show');
        }
    }
}

function toggleTheme() {
    console.log('Toggling theme from:', currentTheme);
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    console.log('Theme changed to:', currentTheme);
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        console.log('Theme icon updated to:', themeIcon.className);
    }
}

function navigateToPage(pageId) {
    console.log(`Navigating to page: ${pageId}`);
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
        console.log(`Set active nav item for: ${pageId}`);
    } else {
        console.error(`Nav item not found for page: ${pageId}`);
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`Activated page: ${pageId}`);
    } else {
        console.error(`Page not found: ${pageId}`);
        return;
    }
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('breadcrumbText');
    if (breadcrumb) {
        const pageNames = {
            'dashboard': 'Dashboard',
            'air-quality': 'Air Quality',
            'water-quality': 'Water Quality',
            'energy': 'Energy Monitoring',
            'fuel': 'Fuel Management',
            'waste': 'Waste Management',
            'carbon': 'Carbon Calculator',
            'reports': 'Reports & Analytics'
        };
        breadcrumb.textContent = pageNames[pageId] || 'Dashboard';
    }
    
    // Initialize page-specific content
    setTimeout(() => {
        initializePageContent(pageId);
    }, 100);
    
    // On mobile, hide sidebar after navigation
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('show');
        }
    }
}

function initializePageContent(pageId) {
    console.log(`Initializing content for page: ${pageId}`);
    
    switch(pageId) {
        case 'dashboard':
            updateDashboardCharts();
            break;
        case 'air-quality':
            updateAirQualityPage();
            break;
        case 'water-quality':
            updateWaterQualityPage();
            break;
        case 'energy':
            updateEnergyPage();
            break;
        case 'waste':
            updateWastePage();
            break;
        case 'fuel':
            updateFuelPage();
            break;
        case 'carbon':
            updateCarbonPage();
            break;
        case 'reports':
            updateReportsPage();
            break;
    }
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { 
        hour12: false, 
        timeZone: 'Asia/Kolkata' 
    });
    const dateString = now.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata' 
    });
    
    const currentTime = document.getElementById('currentTime');
    const lastUpdated = document.getElementById('lastUpdated');
    
    if (currentTime) {
        currentTime.textContent = `${dateString} ${timeString}`;
    }
    if (lastUpdated) {
        lastUpdated.textContent = timeString;
    }
}

function updateKPIValues() {
    const latestAir = sampleData.airQualityData[0];
    const latestWater = sampleData.waterQualityData[0];
    const totalEnergy = sampleData.energyData.reduce((sum, item) => sum + item.consumption, 0);
    const totalCost = sampleData.energyData.reduce((sum, item) => sum + item.cost, 0);
    const totalWaste = sampleData.wasteData.reduce((sum, item) => sum + item.amount, 0);
    
    // Update AQI
    const aqiValue = document.getElementById('aqiValue');
    const aqiStatus = document.getElementById('aqiStatus');
    if (aqiValue) aqiValue.textContent = latestAir.aqi;
    if (aqiStatus) {
        aqiStatus.textContent = latestAir.status;
        aqiStatus.className = `kpi-status ${latestAir.status.toLowerCase()}`;
    }
    
    // Update other KPIs
    const waterStatus = document.getElementById('waterStatus');
    if (waterStatus) waterStatus.textContent = latestWater.status;
    
    const energyValue = document.getElementById('energyValue');
    if (energyValue) energyValue.textContent = `${totalEnergy.toFixed(1)} kWh`;
    
    const carbonValue = document.getElementById('carbonValue');
    if (carbonValue) carbonValue.textContent = `${sampleData.carbonFootprint.total} kg`;
    
    const wasteValue = document.getElementById('wasteValue');
    if (wasteValue) wasteValue.textContent = `${totalWaste.toFixed(1)} kg`;
    
    const sustainabilityScore = document.getElementById('sustainabilityScore');
    if (sustainabilityScore) sustainabilityScore.textContent = '78';
}

function displayAlerts() {
    const alertBadges = document.getElementById('alertBadges');
    if (!alertBadges) return;
    
    alertBadges.innerHTML = '';
    
    sampleData.alerts.forEach(alert => {
        const badge = document.createElement('span');
        badge.className = `alert-badge ${alert.type}`;
        badge.textContent = alert.message;
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', () => showAlertModal(alert));
        alertBadges.appendChild(badge);
    });
}

function showAlertModal(alert) {
    const modal = document.getElementById('alertModal');
    const message = document.getElementById('alertMessage');
    if (modal && message) {
        message.textContent = alert.message;
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('alertModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function acknowledgeAlert() {
    closeModal();
    console.log('Alert acknowledged');
}

function initializeCharts() {
    console.log('Initializing charts...');
    try {
        createAirQualityChart();
        createEnergyChart();
        createWaterChart();
        createWasteChart();
        console.log('All dashboard charts initialized');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function updateDashboardCharts() {
    console.log('Updating dashboard charts...');
    
    // Destroy and recreate charts to avoid conflicts
    Object.keys(charts).forEach(key => {
        if (charts[key] && typeof charts[key].destroy === 'function') {
            charts[key].destroy();
        }
    });
    charts = {};
    
    setTimeout(() => {
        createAirQualityChart();
        createEnergyChart();
        createWaterChart();
        createWasteChart();
    }, 100);
}

function createAirQualityChart() {
    const ctx = document.getElementById('airQualityChart');
    if (!ctx) return;
    
    const timeLabels = sampleData.airQualityData.map(item => {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    const aqiData = sampleData.airQualityData.map(item => item.aqi).reverse();
    
    charts.airQuality = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'AQI',
                data: aqiData,
                borderColor: chartColors[0],
                backgroundColor: chartColors[0] + '20',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150
                }
            }
        }
    });
}

function createEnergyChart() {
    const ctx = document.getElementById('energyChart');
    if (!ctx) return;
    
    const buildings = sampleData.energyData.map(item => item.building);
    const consumption = sampleData.energyData.map(item => item.consumption);
    
    charts.energy = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: buildings,
            datasets: [{
                label: 'Consumption (kWh)',
                data: consumption,
                backgroundColor: chartColors.slice(0, buildings.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createWaterChart() {
    const ctx = document.getElementById('waterChart');
    if (!ctx) return;
    
    const latestWater = sampleData.waterQualityData[0];
    
    charts.water = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['pH', 'Turbidity', 'DO', 'Temperature', 'Conductivity'],
            datasets: [{
                data: [
                    (latestWater.ph / 14) * 100,
                    (latestWater.turbidity / 5) * 100,
                    (latestWater.dissolvedOxygen / 10) * 100,
                    (latestWater.temperature / 40) * 100,
                    (latestWater.conductivity / 1000) * 100
                ],
                backgroundColor: chartColors.slice(0, 5)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createWasteChart() {
    const ctx = document.getElementById('wasteChart');
    if (!ctx) return;
    
    const wasteTypes = sampleData.wasteData.map(item => item.type);
    const wasteAmounts = sampleData.wasteData.map(item => item.amount);
    
    charts.waste = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: wasteTypes,
            datasets: [{
                data: wasteAmounts,
                backgroundColor: chartColors.slice(0, wasteTypes.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function updateAirQualityPage() {
    const latestData = sampleData.airQualityData[0];
    
    const currentAQI = document.getElementById('currentAQI');
    const currentAQILabel = document.getElementById('currentAQILabel');
    const co2Value = document.getElementById('co2Value');
    const pm25Value = document.getElementById('pm25Value');
    const pm10Value = document.getElementById('pm10Value');
    
    if (currentAQI) currentAQI.textContent = latestData.aqi;
    if (currentAQILabel) currentAQILabel.textContent = latestData.status;
    if (co2Value) co2Value.textContent = `${latestData.co2} ppm`;
    if (pm25Value) pm25Value.textContent = `${latestData.pm25} μg/m³`;
    if (pm10Value) pm10Value.textContent = `${latestData.pm10} μg/m³`;
    
    // Update AQI color
    if (currentAQILabel && currentAQI) {
        const statusClass = latestData.status.toLowerCase();
        currentAQILabel.className = `aqi-label ${statusClass}`;
        currentAQI.className = `aqi-number ${statusClass}`;
    }
    
    // Create real-time chart
    createRealTimeAirChart();
}

function createRealTimeAirChart() {
    const ctx = document.getElementById('realTimeAirChart');
    if (!ctx) return;
    
    const timeLabels = sampleData.airQualityData.map(item => {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    charts.realTimeAir = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'AQI',
                    data: sampleData.airQualityData.map(item => item.aqi).reverse(),
                    borderColor: chartColors[0],
                    backgroundColor: chartColors[0] + '20',
                    yAxisID: 'y'
                },
                {
                    label: 'CO₂ (ppm)',
                    data: sampleData.airQualityData.map(item => item.co2).reverse(),
                    borderColor: chartColors[1],
                    backgroundColor: chartColors[1] + '20',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'AQI'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'CO₂ (ppm)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateWaterQualityPage() {
    const latestData = sampleData.waterQualityData[0];
    
    // Update gauge values
    const phValue = document.getElementById('phValue');
    const doValue = document.getElementById('doValue');
    const tempValue = document.getElementById('tempValue');
    
    if (phValue) phValue.textContent = latestData.ph;
    if (doValue) doValue.textContent = `${latestData.dissolvedOxygen} mg/L`;
    if (tempValue) tempValue.textContent = `${latestData.temperature}°C`;
    
    // Create gauges
    setTimeout(() => {
        createGaugeChart('phGauge', latestData.ph, 0, 14, 'pH');
        createGaugeChart('doGauge', latestData.dissolvedOxygen, 0, 15, 'DO');
        createGaugeChart('tempGauge', latestData.temperature, 0, 50, 'Temp');
        createWaterTrendsChart();
    }, 100);
}

function createGaugeChart(canvasId, value, min, max, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Draw value arc
    const percentage = (value - min) / (max - min);
    const endAngle = Math.PI + (Math.PI * percentage);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.strokeStyle = chartColors[0];
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = chartColors[0];
    ctx.fill();
}

function createWaterTrendsChart() {
    const ctx = document.getElementById('waterTrendsChart');
    if (!ctx) return;
    
    charts.waterTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampleData.waterQualityData.map(item => {
                const time = new Date(item.timestamp);
                return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            }).reverse(),
            datasets: [
                {
                    label: 'pH',
                    data: sampleData.waterQualityData.map(item => item.ph).reverse(),
                    borderColor: chartColors[0],
                    backgroundColor: chartColors[0] + '20'
                },
                {
                    label: 'Temperature (°C)',
                    data: sampleData.waterQualityData.map(item => item.temperature).reverse(),
                    borderColor: chartColors[1],
                    backgroundColor: chartColors[1] + '20'
                },
                {
                    label: 'DO (mg/L)',
                    data: sampleData.waterQualityData.map(item => item.dissolvedOxygen).reverse(),
                    borderColor: chartColors[2],
                    backgroundColor: chartColors[2] + '20'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function updateEnergyPage() {
    const totalConsumption = sampleData.energyData.reduce((sum, item) => sum + item.consumption, 0);
    const totalCost = sampleData.energyData.reduce((sum, item) => sum + item.cost, 0);
    
    const energyValueEl = document.querySelector('.energy-value');
    const energyCostEl = document.querySelector('.energy-cost');
    
    if (energyValueEl) energyValueEl.textContent = `${totalConsumption.toFixed(1)} kWh`;
    if (energyCostEl) energyCostEl.textContent = `Cost: ₹${totalCost.toFixed(2)}`;
    
    setTimeout(() => {
        createBuildingEnergyChart();
    }, 100);
}

function createBuildingEnergyChart() {
    const ctx = document.getElementById('buildingEnergyChart');
    if (!ctx) return;
    
    charts.buildingEnergy = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleData.energyData.map(item => item.building),
            datasets: [
                {
                    label: 'Consumption (kWh)',
                    data: sampleData.energyData.map(item => item.consumption),
                    backgroundColor: chartColors[0],
                    yAxisID: 'y'
                },
                {
                    label: 'Cost (₹)',
                    data: sampleData.energyData.map(item => item.cost),
                    backgroundColor: chartColors[1],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Consumption (kWh)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cost (₹)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateWastePage() {
    const totalWaste = sampleData.wasteData.reduce((sum, item) => sum + item.amount, 0);
    const wasteTotalEl = document.querySelector('.waste-total');
    if (wasteTotalEl) wasteTotalEl.textContent = `${totalWaste.toFixed(1)} kg`;
    
    setTimeout(() => {
        createWasteDistributionChart();
    }, 100);
}

function createWasteDistributionChart() {
    const ctx = document.getElementById('wasteDistributionChart');
    if (!ctx) return;
    
    charts.wasteDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sampleData.wasteData.map(item => item.type),
            datasets: [{
                data: sampleData.wasteData.map(item => item.amount),
                backgroundColor: chartColors.slice(0, sampleData.wasteData.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = sampleData.wasteData[context.dataIndex];
                            return `${item.type}: ${item.amount}kg (${item.percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateFuelPage() {
    console.log('Fuel page updated');
}

function updateCarbonPage() {
    console.log('Carbon calculator page updated');
}

function updateReportsPage() {
    console.log('Reports page updated');
}

function calculateCarbonFootprint() {
    const activityType = document.getElementById('activityType').value;
    const amount = parseFloat(document.getElementById('activityAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    let carbonEmission = 0;
    const carbonFactors = {
        energy: 0.85, // kg CO2 per kWh
        transport: 0.21, // kg CO2 per km
        waste: 0.5 // kg CO2 per kg waste
    };
    
    carbonEmission = amount * carbonFactors[activityType];
    
    alert(`Carbon footprint for ${activityType}: ${carbonEmission.toFixed(2)} kg CO₂`);
}

function generateReport() {
    const reportData = {
        airQuality: sampleData.airQualityData[0],
        waterQuality: sampleData.waterQualityData[0],
        energy: sampleData.energyData,
        waste: sampleData.wasteData,
        carbonFootprint: sampleData.carbonFootprint
    };
    
    console.log('Generated Report:', reportData);
    alert('Report generated successfully! In a real implementation, this would create a PDF report.');
}

function exportData() {
    const csvData = convertToCSV(sampleData);
    downloadCSV(csvData, 'environmental_data.csv');
}

function convertToCSV(data) {
    const headers = ['Timestamp', 'Type', 'Parameter', 'Value', 'Unit'];
    const rows = [headers.join(',')];
    
    // Add air quality data
    data.airQualityData.forEach(item => {
        rows.push([item.timestamp, 'Air Quality', 'AQI', item.aqi, 'Index'].join(','));
        rows.push([item.timestamp, 'Air Quality', 'CO2', item.co2, 'ppm'].join(','));
        rows.push([item.timestamp, 'Air Quality', 'PM2.5', item.pm25, 'μg/m³'].join(','));
    });
    
    // Add water quality data
    data.waterQualityData.forEach(item => {
        rows.push([item.timestamp, 'Water Quality', 'pH', item.ph, ''].join(','));
        rows.push([item.timestamp, 'Water Quality', 'Temperature', item.temperature, '°C'].join(','));
    });
    
    return rows.join('\n');
}

function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function startRealTimeUpdates() {
    realTimeInterval = setInterval(() => {
        simulateNewSensorData();
        updateKPIValues();
        
        // Update real-time charts if visible
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id === 'air-quality' && charts.realTimeAir) {
            updateRealTimeAirChart();
        }
    }, 5000); // Update every 5 seconds
}

function simulateNewSensorData() {
    // Simulate MQ135 sensor readings
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Generate realistic variations
    const baseAQI = sampleData.airQualityData[0].aqi;
    const newAQI = Math.max(50, Math.min(150, baseAQI + (Math.random() - 0.5) * 10));
    const newCO2 = Math.max(350, Math.min(500, 420 + (Math.random() - 0.5) * 30));
    const newPM25 = Math.max(5, Math.min(35, 15 + (Math.random() - 0.5) * 8));
    const newPM10 = Math.max(10, Math.min(50, 25 + (Math.random() - 0.5) * 10));
    
    let status = 'Good';
    if (newAQI > 100) status = 'Moderate';
    if (newAQI > 150) status = 'Poor';
    if (newAQI > 200) status = 'Hazardous';
    
    const newData = {
        timestamp: timestamp,
        aqi: Math.round(newAQI),
        co2: Math.round(newCO2),
        pm25: Math.round(newPM25),
        pm10: Math.round(newPM10),
        status: status,
        location: "Academic Block A"
    };
    
    // Update the data array
    sampleData.airQualityData.unshift(newData);
    if (sampleData.airQualityData.length > 10) {
        sampleData.airQualityData.pop();
    }
    
    // Check for alerts
    if (newAQI > 100 && !sampleData.alerts.some(alert => 
        alert.message.includes('Air quality moderate') && 
        new Date(alert.timestamp) > new Date(Date.now() - 300000) // Within last 5 minutes
    )) {
        sampleData.alerts.unshift({
            type: 'warning',
            message: `Air quality ${status.toLowerCase()} in Academic Block (AQI: ${Math.round(newAQI)})`,
            timestamp: timestamp
        });
        displayAlerts();
    }
}

function updateRealTimeAirChart() {
    if (!charts.realTimeAir) return;
    
    const timeLabels = sampleData.airQualityData.map(item => {
        const time = new Date(item.timestamp);
        return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }).reverse();
    
    charts.realTimeAir.data.labels = timeLabels;
    charts.realTimeAir.data.datasets[0].data = sampleData.airQualityData.map(item => item.aqi).reverse();
    charts.realTimeAir.data.datasets[1].data = sampleData.airQualityData.map(item => item.co2).reverse();
    charts.realTimeAir.update('none');
}

// Handle responsive sidebar on mobile
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
    }
});