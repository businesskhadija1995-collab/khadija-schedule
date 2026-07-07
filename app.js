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
    setupEnterKeySubmit();
    renderAllTasks();
    renderManageTasks();

    setInterval(displayCurrentDate, 1000);
    setInterval(checkReminders, 60000);

    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
}

function loadData() {
    try {
        const savedHabits = localStorage.getItem('habits');
        const savedCompletions = localStorage.getItem('completions');
        const savedReminderSettings = localStorage.getItem('reminderSettings');

        if (savedHabits) {
            const parsed = JSON.parse(savedHabits);
            // Merge over the defaults so any missing category (daily/weekly/monthly)
            // is guaranteed to exist as an array instead of undefined.
            habits = {
                daily: Array.isArray(parsed.daily) ? parsed.daily : [],
                weekly: Array.isArray(parsed.weekly) ? parsed.weekly : [],
                monthly: Array.isArray(parsed.monthly) ? parsed.monthly : []
            };
        }

        if (savedCompletions) {
            const parsed = JSON.parse(savedCompletions);
            completions = {
                daily: (parsed.daily && typeof parsed.daily === 'object') ? parsed.daily : {},
                weekly: (parsed.weekly && typeof parsed.weekly === 'object') ? parsed.weekly : {},
                monthly: (parsed.monthly && typeof parsed.monthly === 'object') ? parsed.monthly : {}
            };
        }

        if (savedReminderSettings) {
            const parsed = JSON.parse(savedReminderSettings);
            reminderSettings = {
                daily: { ...reminderSettings.daily, ...(parsed.daily || {}) },
                weekly: { ...reminderSettings.weekly, ...(parsed.weekly || {}) },
                monthly: { ...reminderSettings.monthly, ...(parsed.monthly || {}) }
            };
        }
    } catch (error) {
        // Corrupted or blocked localStorage should never prevent the app from
        // working - fall back to the in-memory defaults already set above.
        console.error('Error loading saved data, starting fresh:', error);
    }

    cleanOldCompletions();

    loadReminderSettings();
}

function saveData() {
    try {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        console.log('Data saved to localStorage:', habits);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Error saving data. Please make sure localStorage is enabled in your browser.');
    }
}

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

function cleanOldCompletions() {
    const today = getTodayKey();
    const currentWeek = getWeekKey();
    const currentMonth = getMonthKey();

    Object.keys(completions.daily).forEach(key => {
        if (key < today - 7) {
            delete completions.daily[key];
        }
    });

    Object.keys(completions.weekly).forEach(key => {
        if (key < currentWeek - 4) {
            delete completions.weekly[key];
        }
    });

    Object.keys(completions.monthly).forEach(key => {
        if (key < currentMonth - 3) {
            delete completions.monthly[key];
        }
    });

    saveData();
}

function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getWeekKey() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((today - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${today.getFullYear()}-W${weekNumber}`;
}

function getMonthKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function displayCurrentDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);
    const time = new Date().toLocaleTimeString('en-US', timeOptions);
    document.getElementById('currentDate').textContent = `${today} • ${time}`;
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

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

// Allow pressing Enter in the input field to add a task (previously only the button worked)
function setupEnterKeySubmit() {
    ['daily', 'weekly', 'monthly'].forEach(type => {
        const input = document.getElementById(`${type}TaskInput`);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addTask(type);
                }
            });
        }
    });
}

function addTask(type) {
    console.log('addTask called with type:', type);

    const inputId = `${type}TaskInput`;
    const input = document.getElementById(inputId);

    if (!input) {
        console.error('Input element not found:', inputId);
        return;
    }

    const taskText = input.value.trim();
    console.log('Task text:', taskText);

    if (taskText) {
        const habit = {
            id: Date.now(),
            text: taskText,
            createdAt: new Date().toISOString()
        };

        habits[type].push(habit);
        console.log(`Added ${type} habit:`, taskText);
        console.log(`Total ${type} habits:`, habits[type].length);
        console.log('Habits array:', habits);
        saveData();
        input.value = '';
        renderAllTasks();
        renderManageTasks();
    } else {
        console.log('Task text is empty, not adding');
    }
}

function deleteHabit(type, id) {
    habits[type] = habits[type].filter(h => h.id !== id);
    saveData();
    renderAllTasks();
    renderManageTasks();
}

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

function renderAllTasks() {
    renderTasks('daily');
    renderTasks('weekly');
    renderTasks('monthly');
}

function getContextualEmoji(text, type) {
    const lowerText = text.toLowerCase();
    const emojiMap = { 'clean': '🧹' };
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (lowerText.includes(keyword)) {
            return emoji;
        }
    }
    const defaultEmojis = {
        daily: '☀️',
        weekly: '📅',
        monthly: '🗓️'
    };
    return defaultEmojis[type] || '✅';
}

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
        symbol.textContent = getContextualEmoji(habit.text, type);

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

function renderManageTasks() {
    renderManageTasksForType('daily');
    renderManageTasksForType('weekly');
    renderManageTasksForType('monthly');
}

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

function openManageModal() {
    document.getElementById('manageModal').style.display = 'block';
}

function closeManageModal() {
    document.getElementById('manageModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('manageModal');
    if (event.target === modal) {
        closeManageModal();
    }
}

function sendDailyReport() {
    sendEmailReport('daily', 'Daily Habits Report');
}

function sendWeeklyReport() {
    sendEmailReport('weekly', 'Weekly Habits Report');
}

function sendMonthlyReport() {
    sendEmailReport('monthly', 'Monthly Habits Report');
}

function sendEmailReport(type, subject) {
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        showEmailStatus('Please configure EmailJS first. See instructions in the code.', 'error');
        return;
    }

    const statusDiv = document.getElementById('emailStatus');
    statusDiv.textContent = 'Sending email...';
    statusDiv.className = 'email-status sending';

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

function showEmailStatus(message, type) {
    const statusDiv = document.getElementById('emailStatus');
    statusDiv.textContent = message;
    statusDiv.className = 'email-status ' + type;

    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'email-status';
    }, 5000);
}

function showReminderStatus(message) {
    const statusDiv = document.getElementById('reminderStatus');
    statusDiv.textContent = message;
    statusDiv.className = 'reminder-status';

    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'reminder-status';
    }, 3000);
}

function checkReminders() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();
    const currentDate = now.getDate();

    if (reminderSettings.daily.enabled) {
        const [hours, minutes] = reminderSettings.daily.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;

        if (currentTime === reminderTime && shouldSendReminder('daily', now)) {
            sendDailyReport();
            lastReminderSent.daily = now.toISOString();
            showReminderStatus('Daily reminder sent!');
        }
    }

    if (reminderSettings.weekly.enabled && currentDay === reminderSettings.weekly.day) {
        const [hours, minutes] = reminderSettings.weekly.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;

        if (currentTime === reminderTime && shouldSendReminder('weekly', now)) {
            sendWeeklyReport();
            lastReminderSent.weekly = now.toISOString();
            showReminderStatus('Weekly reminder sent!');
        }
    }

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

function shouldSendReminder(type, now) {
    if (!lastReminderSent[type]) return true;

    const lastSent = new Date(lastReminderSent[type]);
    const diff = now - lastSent;

    if (type === 'daily') {
        return diff >= 24 * 60 * 60 * 1000;
    }

    if (type === 'weekly') {
        return diff >= 7 * 24 * 60 * 60 * 1000;
    }

    if (type === 'monthly') {
        return diff >= 30 * 24 * 60 * 60 * 1000;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', init);