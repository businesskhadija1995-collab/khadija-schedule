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

// Initialize the app
function init() {
    loadData();
    displayCurrentDate();
    setupTabs();
    setupManageTabs();
    renderAllTasks();
    renderManageTasks();
}

// Load data from localStorage
function loadData() {
    const savedHabits = localStorage.getItem('habits');
    const savedCompletions = localStorage.getItem('completions');
    
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
    
    if (savedCompletions) {
        completions = JSON.parse(savedCompletions);
    }
    
    // Clean up old completions
    cleanOldCompletions();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('completions', JSON.stringify(completions));
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

// Display current date
function displayCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = today;
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);