// Data structure for habits
let habits = {
    daily: [],
    weekly: [],
    monthly: []
};

// Completion tracking
let completions = {
    daily: {},
    weekly: {},
    monthly: {}
};

// Reminder settings
let reminderSettings = {
    daily: { enabled: false, time: '09:00' },
    weekly: { enabled: false, day: 1, time: '09:00' },
    monthly: { enabled: false, day: 1, time: '09:00' }
};

// Track when reminders were last sent
let lastReminderSent = {
    daily: null,
    weekly: null,
    monthly: null
};

// EmailJS Configuration - REPLACE WITH YOUR ACTUAL VALUES
const EMAILJS_PUBLIC_KEY = 'SBoX6bx7M9EVmVeji';
const EMAILJS_SERVICE_ID = 'service_hm3g7t9';
const EMAILJS_TEMPLATE_ID = 'template_0exa8cq';
const RECIPIENT_EMAIL = 'businesskhadija18@gmail.com';

// Initialize the app
function init() {
    loadData();
    displayCurrentDate();
    setupTabs();
    setupManageTabs();
    renderAllTasks();
    renderManageTasks();
    
    // Update time every second
    setInterval(displayCurrentDate, 1000);
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
    
    // Initialize EmailJS (will work once you add your public key)
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
}

// Load data from localStorage
function loadData() {
    const savedHabits = localStorage.getItem('habits');
    const savedCompletions = localStorage.getItem('completions');
    const savedReminderSettings = localStorage.getItem('reminderSettings');
    
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
    
    if (savedCompletions) {
        completions = JSON.parse(savedCompletions);
    }
    
    if (savedReminderSettings) {
        reminderSettings = JSON.parse(savedReminderSettings);
    }
    
    // Clean up old completions
    cleanOldCompletions();
    
    // Load reminder settings into UI
    loadReminderSettings();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('completions', JSON.stringify(completions));
}

// Save reminder settings
function saveReminderSettings() {
    reminderSettings.daily.enabled = document.getElementById('dailyReminderEnabled').checked;
    reminderSettings.daily.time = document.getElementById('dailyReminderTime').value;
    
    reminderSettings.weekly.enabled = document.getElementById('weeklyReminderEnabled').checked;
    reminderSettings.weekly.day = parseInt(document.getElementById('weeklyReminderDay').value);
    reminderSettings.weekly.time = document.getElementById('weeklyReminderTime').value;
    
    reminderSettings.monthly.enabled = document.getElementById('monthlyReminderEnabled').checked;
    reminderSettings.monthly.day = parseInt(document.getElementById('monthlyReminderDay').value);
    reminderSettings.monthly.time = document.getElementById('monthlyReminderTime').value;
    
    localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
    
    showReminderStatus('Reminder settings saved');
}

// Load reminder settings into UI
function loadReminderSettings() {
    document.getElementById('dailyReminderEnabled').checked = reminderSettings.daily.enabled;
    document.getElementById('dailyReminderTime').value = reminderSettings.daily.time;
    
    document.getElementById('weeklyReminderEnabled').checked = reminderSettings.weekly.enabled;
    document.getElementById('weeklyReminderDay').value = reminderSettings.weekly.day;
    document.getElementById('weeklyReminderTime').value = reminderSettings.weekly.time;
    
    document.getElementById('monthlyReminderEnabled').checked = reminderSettings.monthly.enabled;
    document.getElementById('monthlyReminderDay').value = reminderSettings.monthly.day;
    document.getElementById('monthlyReminderTime').value = reminderSettings.monthly.time;
}

// Clean up old completions to prevent storage bloat
function cleanOldCompletions() {
    const today = getTodayKey();
    const currentWeek = getWeekKey();
    const currentMonth = getMonthKey();
    
    // Clean daily completions (keep only last 7 days)
    Object.keys(completions.daily).forEach(key => {
        if (key < today - 7) {
            delete completions.daily[key];
        }
    });
    
    // Clean weekly completions (keep only last 4 weeks)
    Object.keys(completions.weekly).forEach(key => {
        if (key < currentWeek - 4) {
            delete completions.weekly[key];
        }
    });
    
    // Clean monthly completions (keep only last 3 months)
    Object.keys(completions.monthly).forEach(key => {
        if (key < currentMonth - 3) {
            delete completions.monthly[key];
        }
    });
    
    saveData();
}

// Get today's key for daily tracking
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get week key for weekly tracking
function getWeekKey() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((today - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${today.getFullYear()}-W${weekNumber}`;
}

// Get month key for monthly tracking
function getMonthKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

// Display current date and time
function displayCurrentDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);
    const time = new Date().toLocaleTimeString('en-US', timeOptions);
    document.getElementById('currentDate').textContent = `${today} • ${time}`;
}

// Setup tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup manage modal tabs
function setupManageTabs() {
    const tabBtns = document.querySelectorAll('.manage-tab-btn');
    const tabPanes = document.querySelectorAll('.manage-tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-manage-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Add a new habit
function addTask(type) {
    const inputId = `${type}TaskInput`;
    const input = document.getElementById(inputId);
    const taskText = input.value.trim();
    
    if (taskText) {
        const habit = {
            id: Date.now(),
            text: taskText,
            createdAt: new Date().toISOString()
        };
        
        habits[type].push(habit);
        saveData();
        input.value = '';
        renderAllTasks();
        renderManageTasks();
    }
}

// Delete a habit
function deleteHabit(type, id) {
    habits[type] = habits[type].filter(h => h.id !== id);
    saveData();
    renderAllTasks();
    renderManageTasks();
}

// Toggle task completion
function toggleTask(type, habitId) {
    let key;
    if (type === 'daily') {
        key = getTodayKey();
    } else if (type === 'weekly') {
        key = getWeekKey();
    } else if (type === 'monthly') {
        key = getMonthKey();
    }
    
    if (!completions[type][key]) {
        completions[type][key] = [];
    }
    
    const index = completions[type][key].indexOf(habitId);
    if (index > -1) {
        completions[type][key].splice(index, 1);
    } else {
        completions[type][key].push(habitId);
    }
    
    saveData();
    renderAllTasks();
}

// Check if a task is completed
function isCompleted(type, habitId) {
    let key;
    if (type === 'daily') {
        key = getTodayKey();
    } else if (type === 'weekly') {
        key = getWeekKey();
    } else if (type === 'monthly') {
        key = getMonthKey();
    }
    
    return completions[type][key] && completions[type][key].includes(habitId);
}

// Render all task lists
function renderAllTasks() {
    renderTasks('daily');
    renderTasks('weekly');
    renderTasks('monthly');
}

// Get contextual emoji based on habit text
function getContextualEmoji(text) {
    const lowerText = text.toLowerCase();
    
    const emojiMap = {
        // Cleaning
        'clean': '🧹',
        'room': '🏠',
        'house': '🏠',
        'dishes': '🍽️',
        'laundry': '👕',
        'wash': '🧼',
        'sweep': '🧹',
        'mop': '🧹',
        'dust': '✨',
        'organize': '📦',
        'declutter': '📦',
        
        // Morning/wake up
        'wake': '☀️',
        'morning': '🌅',
        'sleep': '😴',
        'bed': '🛏️',
        'alarm': '⏰',
        'rise': '🌅',
        'up': '☀️',
        
        // Exercise/fitness
        'exercise': '🏋️',
        'workout': '💪',
        'gym': '🏋️',
        'run': '🏃',
        'jog': '🏃',
        'walk': '🚶',
        'yoga': '🧘',
        'stretch': '🧘',
        'fitness': '💪',
        'sport': '⚽',
        
        // Food/cooking
        'cook': '🍳',
        'breakfast': '🥐',
        'lunch': '🥪',
        'dinner': '🍽️',
        'eat': '🍽️',
        'meal': '🍽️',
        'grocery': '🛒',
        'shopping': '🛒',
        'kitchen': '🍳',
        
        // Health/self-care
        'shower': '🚿',
        'bath': '🛁',
        'brush': '🪥',
        'teeth': '🪥',
        'skin': '🧴',
        'face': '😊',
        'hair': '💇',
        'meditate': '🧘',
        'relax': '😌',
        'rest': '😴',
        'health': '❤️',
        'doctor': '🏥',
        'medicine': '💊',
        
        // Work/study
        'work': '💼',
        'job': '💼',
        'office': '🏢',
        'study': '📚',
        'read': '📖',
        'learn': '📚',
        'book': '📖',
        'class': '🎓',
        'school': '🎓',
        'homework': '📝',
        'project': '📋',
        'meeting': '🤝',
        'email': '📧',
        
        // Social/family
        'family': '👨‍👩‍👧‍👦',
        'friend': '👫',
        'call': '📞',
        'phone': '📞',
        'text': '💬',
        'message': '💬',
        'visit': '🏠',
        'party': '🎉',
        'social': '👥',
        
        // Money/finance
        'money': '💰',
        'pay': '💳',
        'bill': '📄',
        'budget': '📊',
        'save': '🐷',
        'bank': '🏦',
        'invest': '📈',
        
        // Water/hydration
        'water': '💧',
        'drink': '💧',
        'hydrate': '💧',
        
        // Nature/outdoors
        'garden': '🌻',
        'plant': '🌱',
        'nature': '🌲',
        'outside': '🌳',
        'park': '🌳',
        
        // Creative/hobbies
        'write': '✍️',
        'draw': '🎨',
        'paint': '🎨',
        'music': '🎵',
        'play': '🎮',
        'game': '🎮',
        'craft': '✂️',
        'photo': '📸',
        'camera': '📸',
        
        // Technology
        'computer': '💻',
        'laptop': '💻',
        'phone': '📱',
        'app': '📱',
        'code': '💻',
        'programming': '💻',
        
        // Pets
        'dog': '🐕',
        'cat': '🐱',
        'pet': '🐾',
        'feed': '🍽️',
        
        // Travel/transport
        'car': '🚗',
        'drive': '🚗',
        'bus': '🚌',
        'train': '🚆',
        'bike': '🚲',
        'travel': '✈️',
        'trip': '✈️',
        
        // Shopping
        'buy': '🛒',
        'store': '🏪',
        'shop': '🛍️',
        
        // General positive
        'happy': '😊',
        'smile': '😊',
        'grateful': '🙏',
        'thank': '🙏',
        'pray': '🙏',
        'goal': '🎯',
        'dream': '💭',
        'plan': '📋',
        'schedule': '📅',
        'routine': '🔄',
        'habit': '✨',
    };
    
    // Check for matching keywords
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (lowerText.includes(keyword)) {
            return emoji;
        }
    }
    
    // Default emojis based on type if no keyword match
    const defaultEmojis = {
        daily: '☀️',
        weekly: '📅',
        monthly: '🗓️'
    };
    
    return defaultEmojis[type] || '✅';
}

// Render tasks for a specific type
function renderTasks(type) {
    const listId = `${type}Tasks`;
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    habits[type].forEach(habit => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (isCompleted(type, habit.id)) {
            li.classList.add('completed');
        }
        
        const symbol = document.createElement('span');
        symbol.className = 'task-symbol';
        symbol.textContent = getContextualEmoji(habit.text);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isCompleted(type, habit.id);
        checkbox.addEventListener('change', () => toggleTask(type, habit.id));
        
        const span = document.createElement('span');
        span.textContent = habit.text;
        
        li.appendChild(symbol);
        li.appendChild(checkbox);
        li.appendChild(span);
        list.appendChild(li);
    });
}

// Render manage tasks
function renderManageTasks() {
    renderManageTasksForType('daily');
    renderManageTasksForType('weekly');
    renderManageTasksForType('monthly');
}

// Render manage tasks for a specific type
function renderManageTasksForType(type) {
    const listId = `manage${type.charAt(0).toUpperCase() + type.slice(1)}Tasks`;
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    habits[type].forEach(habit => {
        const li = document.createElement('li');
        li.className = 'manage-task-item';
        
        const span = document.createElement('span');
        span.textContent = habit.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteHabit(type, habit.id));
        
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

// Open manage modal
function openManageModal() {
    document.getElementById('manageModal').style.display = 'block';
}

// Close manage modal
function closeManageModal() {
    document.getElementById('manageModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('manageModal');
    if (event.target === modal) {
        closeManageModal();
    }
}

// Send daily report email
function sendDailyReport() {
    sendEmailReport('daily', 'Daily Habits Report');
}

// Send weekly report email
function sendWeeklyReport() {
    sendEmailReport('weekly', 'Weekly Habits Report');
}

// Send monthly report email
function sendMonthlyReport() {
    sendEmailReport('monthly', 'Monthly Habits Report');
}

// Generic email report sender
function sendEmailReport(type, subject) {
    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        showEmailStatus('Please configure EmailJS first. See instructions in the code.', 'error');
        return;
    }

    const statusDiv = document.getElementById('emailStatus');
    statusDiv.textContent = 'Sending email...';
    statusDiv.className = 'email-status sending';

    // Generate report content
    const report = generateReport(type);
    
    const templateParams = {
        to_email: RECIPIENT_EMAIL,
        subject: subject,
        report_content: report.content,
        report_date: new Date().toLocaleDateString(),
        report_type: type
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function() {
            showEmailStatus('Email sent successfully to ' + RECIPIENT_EMAIL, 'success');
        }, function(error) {
            showEmailStatus('Failed to send email: ' + JSON.stringify(error), 'error');
        });
}

// Generate report content for a specific type
function generateReport(type) {
    const today = new Date();
    let content = '';
    
    content += `<h2>${type.charAt(0).toUpperCase() + type.slice(1)} Habits Report</h2>`;
    content += `<p><strong>Date:</strong> ${today.toLocaleDateString()}</p>`;
    content += `<p><strong>Time:</strong> ${today.toLocaleTimeString()}</p>`;
    
    content += `<h3>Your ${type} Habits:</h3>`;
    content += `<ul>`;
    
    if (habits[type] && habits[type].length > 0) {
        habits[type].forEach(habit => {
            const completed = isCompleted(type, habit.id);
            const status = completed ? '✅ Completed' : '⬜ Not completed';
            content += `<li>${habit.text} - ${status}</li>`;
        });
    } else {
        content += `<li>No ${type} habits set up yet.</li>`;
    }
    
    content += `</ul>`;
    
    // Add completion statistics
    const total = habits[type].length;
    const completedCount = habits[type].filter(h => isCompleted(type, h.id)).length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    content += `<h3>Progress:</h3>`;
    content += `<p>Completed: ${completedCount}/${total} (${percentage}%)</p>`;
    
    return {
        content: content,
        total: total,
        completed: completedCount,
        percentage: percentage
    };
}

// Show email status message
function showEmailStatus(message, type) {
    const statusDiv = document.getElementById('emailStatus');
    statusDiv.textContent = message;
    statusDiv.className = 'email-status ' + type;
    
    // Clear status after 5 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'email-status';
    }, 5000);
}

// Show reminder status message
function showReminderStatus(message) {
    const statusDiv = document.getElementById('reminderStatus');
    statusDiv.textContent = message;
    statusDiv.className = 'reminder-status';
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'reminder-status';
    }, 3000);
}

// Check if it's time to send reminders
function checkReminders() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.getDate();
    
    // Check daily reminder
    if (reminderSettings.daily.enabled) {
        const [hours, minutes] = reminderSettings.daily.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        
        if (currentTime === reminderTime && shouldSendReminder('daily', now)) {
            sendDailyReport();
            lastReminderSent.daily = now.toISOString();
            showReminderStatus('Daily reminder sent!');
        }
    }
    
    // Check weekly reminder
    if (reminderSettings.weekly.enabled && currentDay === reminderSettings.weekly.day) {
        const [hours, minutes] = reminderSettings.weekly.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        
        if (currentTime === reminderTime && shouldSendReminder('weekly', now)) {
            sendWeeklyReport();
            lastReminderSent.weekly = now.toISOString();
            showReminderStatus('Weekly reminder sent!');
        }
    }
    
    // Check monthly reminder
    if (reminderSettings.monthly.enabled && currentDate === reminderSettings.monthly.day) {
        const [hours, minutes] = reminderSettings.monthly.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        
        if (currentTime === reminderTime && shouldSendReminder('monthly', now)) {
            sendMonthlyReport();
            lastReminderSent.monthly = now.toISOString();
            showReminderStatus('Monthly reminder sent!');
        }
    }
}

// Check if reminder should be sent (prevent duplicate sends)
function shouldSendReminder(type, now) {
    if (!lastReminderSent[type]) return true;
    
    const lastSent = new Date(lastReminderSent[type]);
    const diff = now - lastSent;
    
    // For daily: only send if last sent was yesterday or earlier
    if (type === 'daily') {
        return diff >= 24 * 60 * 60 * 1000; // 24 hours
    }
    
    // For weekly: only send if last sent was 7+ days ago
    if (type === 'weekly') {
        return diff >= 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    
    // For monthly: only send if last sent was 30+ days ago
    if (type === 'monthly') {
        return diff >= 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    
    return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);