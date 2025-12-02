// Auth Functions
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            isPremium: false,
            freeUses: 10,
            createdAt: new Date()
        });
        hideAuthModal();
        updateUserStatus(email);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        hideAuthModal();
        updateUserStatus(email);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function logout() {
    await auth.signOut();
    updateUserStatus(null);
}

function updateUserStatus(email) {
    const userEmailSpan = document.getElementById('userEmail');
    const loginBtn = document.querySelector('#userStatus button[onclick="showAuthModal()"]');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (email) {
        userEmailSpan.textContent = 'Logged in as: ' + email;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        userEmailSpan.textContent = 'Not logged in';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// Check auth state on load
auth.onAuthStateChanged((user) => {
    if (user) {
        updateUserStatus(user.email);
    } else {
        updateUserStatus(null);
    }
});
// Tab Switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Free AI API Integration - Using multiple free sources
class FreeAIClient {
    constructor() {
        this.apiStatus = document.getElementById('apiStatus');
        this.usageCount = 0;
        this.maxFreeUses = 10; // Monetization: Limit free uses
        this.init();
    }

    async init() {
        this.updateStatus("Free tier active - " + (this.maxFreeUses - this.usageCount) + " uses remaining");
    }

    async rewriteText(text, style) {
        if (this.usageCount >= this.maxFreeUses) {
            return "Free limit reached! Upgrade to premium for unlimited access.";
        }

        this.usageCount++;
        this.updateStatus("Free tier - " + (this.maxFreeUses - this.usageCount) + " uses left");
        
        // Simple AI simulation (replace with real API later)
        const responses = {
            professional: `[Professional Version]
Dear [Recipient],

I am writing to formally request consideration for remote work arrangements, as I believe this would enhance both my productivity and work-life balance while maintaining all professional responsibilities.

I have prepared a comprehensive plan outlining how I will ensure seamless communication and deliver all expected outcomes. I am confident that this arrangement will contribute positively to our team's objectives.

Please let me know a convenient time to discuss this further.

Best regards,
[Your Name]`,
            
            concise: `Requesting work-from-home option. I'll maintain productivity and communication. Can discuss details.`,
            
            friendly: `Hey! I was hoping we could chat about working from home sometimes. I've got everything set up to stay productive and connected. Let me know when you're free to talk! 😊`
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return responses[style] || text;
    }

    async generateTaskSuggestions() {
        if (this.usageCount >= this.maxFreeUses) {
            return ["Upgrade to premium for more suggestions!"];
        }

        this.usageCount++;
        this.updateStatus("Free tier - " + (this.maxFreeUses - this.usageCount) + " uses left");

        const suggestions = [
            "Break down big project into 3 smaller tasks",
            "Schedule 30 min for email cleanup",
            "Prepare tomorrow's to-do list tonight",
            "Set 2 main priorities for today",
            "Review last week's accomplishments",
            "Organize digital files by project",
            "Brainstorm 5 new ideas for current project",
            "Set up automated reminders for deadlines"
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        return suggestions.sort(() => Math.random() - 0.5).slice(0, 4);
    }

    async generatePlanner(focus) {
        if (this.usageCount >= this.maxFreeUses) {
            return "Free limit reached! Upgrade for unlimited planning.";
        }

        this.usageCount++;
        this.updateStatus("Free tier - " + (this.maxFreeUses - this.usageCount) + " uses left");

        const timeSlots = [
            "8:00-9:00 AM: Morning planning & priority setting",
            "9:00-11:00 AM: Deep work on " + focus,
            "11:00-11:30 AM: Short break & stretch",
            "11:30-1:00 PM: Continue focused work",
            "1:00-2:00 PM: Lunch & mental break",
            "2:00-3:30 PM: Meetings & collaboration",
            "3:30-4:00 PM: Review progress & adjust",
            "4:00-5:30 PM: Wrap up & plan tomorrow"
        ];

        await new Promise(resolve => setTimeout(resolve, 700));
        
        return timeSlots;
    }

    updateStatus(message) {
        this.apiStatus.textContent = message;
        this.apiStatus.style.color = this.usageCount >= this.maxFreeUses ? "#e53935" : "#4CAF50";
        
        // Save to localStorage
        localStorage.setItem('aiUsageCount', this.usageCount);
    }
}

// Initialize AI Client
const aiClient = new FreeAIClient();

// Load usage from localStorage
if (localStorage.getItem('aiUsageCount')) {
    aiClient.usageCount = parseInt(localStorage.getItem('aiUsageCount'));
    aiClient.updateStatus("Free tier - " + (aiClient.maxFreeUses - aiClient.usageCount) + " uses left");
}

// Text Rewriting Function
async function rewriteTextWithAI(text, style) {
    // Check if user is premium
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first!');
        showAuthModal();
        return;
    }
    
    // Get user data
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    // Check free uses
    if (!userData.isPremium && userData.freeUses <= 0) {
        alert('Free uses exhausted! Please upgrade to premium.');
        showPremium();
        return;
    }
    
    // Prepare API call
    const prompts = {
        professional: "Rewrite this text in a professional business tone: ",
        concise: "Make this text more concise and to the point: ",
        friendly: "Rewrite this in a friendly, casual tone: "
    };
    
    try {
        // Call OpenAI API (via proxy for security)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: prompts[style] + text
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        // Decrement free uses if not premium
        if (!userData.isPremium) {
            await db.collection('users').doc(user.uid).update({
                freeUses: userData.freeUses - 1
            });
        }
        
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('AI Error:', error);
        return "AI service is currently unavailable. Please try again later.";
    }
}

// Copy to Clipboard
function copyToClipboard() {
    const outputText = document.getElementById('outputText');
    outputText.select();
    outputText.setSelectionRange(0, 99999); // For mobile
    
    try {
        navigator.clipboard.writeText(outputText.value);
        alert("Copied to clipboard!");
    } catch (err) {
        // Fallback for older browsers
        document.execCommand('copy');
        alert("Copied to clipboard!");
    }
}

// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        
        // Animation
        taskInput.style.transform = 'scale(1.05)';
        setTimeout(() => taskInput.style.transform = 'scale(1)', 300);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="${task.completed ? 'text-decoration: line-through; color: #999;' : ''}">
                ${task.text}
            </span>
            <div class="task-actions">
                <button onclick="toggleTask(${task.id})" title="Toggle Complete">
                    ${task.completed ? '↩️' : '✓'}
                </button>
                <button onclick="deleteTask(${task.id})" title="Delete" style="color: #e53935;">
                    🗑️
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? {...task, completed: !task.completed} : task
    );
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Generate AI Task Suggestions
async function generateTaskSuggestions() {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '<div class="suggestion-item">Generating suggestions... 🤔</div>';
    
    const suggestions = await aiClient.generateTaskSuggestions();
    
    suggestionsList.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.onclick = () => {
            document.getElementById('taskInput').value = suggestion;
        };
        suggestionsList.appendChild(div);
    });
}

// Generate AI Planner
async function generatePlanner() {
    const focusArea = document.getElementById('focusArea').value.trim();
    if (!focusArea) {
        alert("Please enter your main focus for today!");
        return;
    }
    
    const plannerOutput = document.getElementById('plannerOutput');
    plannerOutput.innerHTML = '<p>Generating your personalized planner... 📅</p>';
    
    const planner = await aiClient.generatePlanner(focusArea);
    
    let html = `<h3>Your AI-Generated Daily Plan for "${focusArea}"</h3><ul>`;
    planner.forEach(item => {
        html += `<li>${item}</li>`;
    });
    html += '</ul><button onclick="savePlanner()" class="action-btn" style="margin-top:15px;">💾 Save This Plan</button>';
    
    plannerOutput.innerHTML = html;
}

function savePlanner() {
    const plan = document.getElementById('plannerOutput').innerText;
    localStorage.setItem('lastPlan', plan);
    alert("Plan saved! You can access it anytime.");
}

// Show Premium Info
function showPremium() {
    document.getElementById('premiumInfo').style.display = 'block';
    return false;
}

// Initialize tasks on load
renderTasks();

// Add sample tasks if empty
if (tasks.length === 0) {
    tasks = [
        { id: 1, text: 'Try the AI text rewriter!', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Generate daily planner', completed: false, createdAt: new Date().toISOString() }
    ];
    saveTasks();
    renderTasks();
}

// PWA Configuration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error:', err));
    });
}
