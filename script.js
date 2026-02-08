// --- CONFIGURATION & STATE ---
const DEFAULT_PASSWORD = "NST@123"; // Default for everyone per request context
const CONTROLLER_ID = "14607688"; // Specific Controller ID
const CONTROLLER_PASS = "NST@123"; // Controller Password



const DB_KEYS = {
    USERS: "edunext_users_v1", // New App Name, New DB
    CONTENT: "edunext_content_v1",
    DOUBTS: "edunext_doubts_v1",
    SESSION: "edunext_session_v1"
};

const TECH_FACTS = [
    "The first computer bug was an actual real moth found in 1947.",
    "The first hard drive in 1956 could store only 5MB of data.",
    "More than 90% of the world's currency exists only on computers.",
    "The QWERTY keyboard was designed to slow down typing to prevent jamming.",
    "The first domain name ever registered was Symbolics.com.",
    "Email existed before the World Wide Web.",
    "The original name for Windows was Interface Manager.",
    "Approximately 6,000 new computer viruses are released every month.",
    "HP, Microsoft, and Apple all started in a garage.",
    "The average person blinks 20 times a minute, but only 7 times while using a computer.",
    "The first computer mouse was made of wood.",
    "Only about 10% of the world's currency is physical money.",
    "The Firefox logo isn't a fox; it's a red panda.",
    "Google uses over 1,000 computers to answer a single search query.",
    "The first 1GB hard drive was announced in 1980 and weighed 550 pounds.",
    "TYPEWRITER is the longest word that can be made using one row of the keyboard.",
    "Linux powers the world's top 500 supercomputers.",
    "Python is named after Monty Python, not the snake.",
    "The password for the computer controls of nuclear missiles of the US was 00000000 for 8 years.",
    "SpaceX uses a variant of Linux for its Falcon 9 rocket.",
    "The first banner ad had a Click Through Rate of 44%.",
    "Over 6 billion hours of video are watched on YouTube each month.",
    "Amazon sells more eBooks than printed books.",
    "The name 'Google' is a misspelling of 'Googol' (1 followed by 100 zeros).",
    "The first webcam was created at Cambridge University to check the coffee pot.",
    "GitHub has over 100 million repositories.",
    "JavaScript was created in just 10 days.",
    "The Apollo 11 guidance computer had less processing power than a modern toaster.",
    "There are over 700 programming languages.",
    "Nintendo started as a playing card company in 1889.",
    "The first smartphone was the IBM Simon, released in 1994.",
    "Approximately 90% of the world's data has been created in the last 2 years.",
    "The first tweet was 'just setting up my twttr'.",
    "The average user unlocks their smartphone 150 times a day.",
    "More people have mobile phones than toilets worldwide.",
    "The first alarm clock could only ring at 4 a.m.",
    "Water makes up about 70% of the Earth's surface, similar to the human body.",
    "The shortest war in history lasted 38 minutes.",
    "Octopuses have three hearts.",
    "Honey never spoils.",
    "Bananas are berries, but strawberries aren't.",
    "A day on Venus is longer than a year on Venus.",
    "Wombat poop is cube-shaped.",
    "Sharks existed before trees.",
    "Humans share 50% of their DNA with bananas.",
    "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
    "A cloud can weigh more than a million pounds.",
    "The dot over the letter 'i' is called a tittle.",
    "Only 5% of the ocean has been explored.",
    "The Great Wall of China is not visible from the moon without aid.",
    "Cows have best friends."
];

let currentUser = null;

// --- INITIALIZATION ---
function init() {
    // 0. Version Control (Force Reset for New Passwords)
    const APP_VERSION = "v2.0_NST";
    if (localStorage.getItem('app_version') !== APP_VERSION) {
        console.log("App updated. Resetting database...");
        localStorage.clear();
        localStorage.setItem('app_version', APP_VERSION);
    }

    // 1. Initialize Users (Or Fix Corrupted Data)
    let users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || "[]");

    // Re-seed if empty or old data (simple check: if controller doesn't exist)
    const controllerExists = users.find(u => u.id === CONTROLLER_ID);
    if (!controllerExists || users.length < 100) {
        console.log("Seeding Database for EduNext...");
        seedUsers();
        // Refresh users list after seeding
        users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    }

    if (!localStorage.getItem(DB_KEYS.CONTENT)) {
        localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify([]));
    }

    if (!localStorage.getItem(DB_KEYS.DOUBTS)) {
        localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify([]));
    }

    // 2. Check Session
    const sessionUser = JSON.parse(localStorage.getItem(DB_KEYS.SESSION));
    if (sessionUser) {
        // Validation check
        const currentUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        const valid = currentUsers.find(u => u.id === sessionUser.id);
        if (valid) {
            currentUser = valid;
            loadView('dashboard');
        } else {
            logout();
        }
    } else {
        loadView('login');
    }

    // Start Clock
    setInterval(updateClock, 1000);
}

function seedUsers() {
    const users = [];

    // 1. Generate Students (2102508701 to 2102508825)
    // Total: 125 students
    const startUSN = 2102508701;
    const endUSN = 2102508825;

    for (let usn = startUSN; usn <= endUSN; usn++) {
        users.push({
            id: usn.toString(),
            role: 'student',
            pass: DEFAULT_PASSWORD, // 1436Saurabh
            isFirstLogin: true, // Forces password reset
            name: `Student ${usn}`,
            age: '',
            phone: '',
            profilePic: ''
        });
    }

    // 2. Generate CRs (Subject Specific Unique IDs)
    const crSubjects = [
        { id: 'CR_MATHS', subj: 'Maths' },
        { id: 'CR_PHYSICS', subj: 'Physics' },
        { id: 'CR_SNW', subj: 'SNW' },
        { id: 'CR_PSP', subj: 'PSP' }
    ];

    crSubjects.forEach(cr => {
        users.push({
            id: cr.id,
            role: 'cr',
            subject: cr.subj,
            pass: DEFAULT_PASSWORD,
            isFirstLogin: true,
            name: `CR ${cr.subj}`,
            age: '',
            phone: '',
            profilePic: ''
        });
    });

    // 3. Controller (Admin)
    users.push({
        id: CONTROLLER_ID,
        role: 'admin',
        pass: CONTROLLER_PASS,
        isFirstLogin: true,
        name: "Boss", // Explicit name for Controller
        detailsSubmitted: true, // Prevent setup form
        profilePic: '',
        hidden: true
    });

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    console.log(`Database seeded with ${users.length} users.`);
}

// --- VIEW MANAGEMENT ---
function loadView(viewName) {
    const app = document.getElementById('app');
    const template = document.getElementById(`view-${viewName}`);

    if (!template) return;

    // Fade out effect
    app.style.opacity = '0';

    setTimeout(() => {
        app.innerHTML = '';
        app.appendChild(template.content.cloneNode(true));
        app.style.opacity = '1';

        // View specific logic
        if (viewName === 'login') {
            setupLoginView();
        } else if (viewName === 'setup') {
            setupSetupView();
        } else if (viewName === 'dashboard') {
            setupDashboardView();
        }
    }, 200);
}

// --- LOGIN LOGIC ---
let selectedLoginRole = 'student';

function setupLoginView() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function selectRole(role) {
    selectedLoginRole = role;

    // Update UI
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.role-btn[data-role="${role}"]`).classList.add('active');

    const titles = { 'student': 'Student', 'cr': 'CR' };
    const placeholders = { 'student': 'Enter USN', 'cr': 'Enter CR ID' };

    document.getElementById('login-title').innerText = titles[role];
    document.getElementById('login-id').placeholder = placeholders[role];
}

function handleLogin(e) {
    e.preventDefault();

    // 1. Clear previous states
    const msg = document.getElementById('login-msg');
    msg.innerText = "";
    msg.classList.remove('shake');

    // 2. Capture fresh inputs
    const id = document.getElementById('login-id').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    console.log("Attempting login for:", id);

    // 3. Fetch fresh database
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || "[]");

    // 4. Find User
    const user = users.find(u => u.id === id);

    // 5. Validation Logic
    if (!user) {
        showError("Invalid Credentials"); // User not found
        return;
    }

    // 6. Role Validation (Skip for Controller)
    if (user.id !== CONTROLLER_ID) {
        // Strict Role Check based on current Tab
        if (user.role !== selectedLoginRole) {
            console.log("Role mismatch:", user.role, "vs", selectedLoginRole);
            showError("Invalid Credentials (Role Mismatch)"); // Wrong tab
            return;
        }
    }

    // DEBUG: Print details
    console.log("Input Pass:", pass);
    console.log("Stored User:", user);
    console.log("Stored Pass:", user.pass);

    // 7. Password Check
    if (user.pass === pass) {
        console.log("Password matched. Access granted.");

        // 8. Redirect Logic

        // Case A: First Time Login (Setup Required)
        if (user.isFirstLogin === true || user.pass === DEFAULT_PASSWORD) {
            console.log("First login/Default password. Redirecting to setup.");
            currentUser = user;
            loadView('setup');
            return;
        }

        // Case B: Normal Login
        loginUser(user);

    } else {
        console.log("Password mismatch.");
        console.log("Expected:", user.pass);
        console.log("Got:", pass);
        console.log("Full Users DB:", users);
        showError("Invalid Credentials (Password Mismatch)"); // Wrong password
    }

    function showError(text) {
        msg.innerText = text;
        // Trigger reflow to restart animation if needed
        void msg.offsetWidth;
        msg.classList.add('shake');
        setTimeout(() => msg.classList.remove('shake'), 500);
    }
}

function showForgotPasswordMsg() {
    alert("Please contact the admin for password reset.");
}

// --- SETUP (CHANGE PASSWORD) LOGIC ---
function setupSetupView() {
    if (!currentUser) { loadView('login'); return; }

    document.getElementById('setup-username').value = `${currentUser.id}`;
    document.getElementById('setup-form').addEventListener('submit', handlePasswordChange);
}

function handlePasswordChange(e) {
    e.preventDefault();
    const newPass = document.getElementById('setup-new-pass').value.trim();
    const confirmPass = document.getElementById('setup-confirm-pass').value.trim();

    if (newPass.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Passwords do not match.");
        return;
    }
    if (newPass === DEFAULT_PASSWORD) {
        alert("Please choose a different password than the default.");
        return;
    }

    // Update DB
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    const userIdx = users.findIndex(u => u.id === currentUser.id);

    if (userIdx !== -1) {
        users[userIdx].pass = newPass;
        users[userIdx].isFirstLogin = false; // Disable flag

        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

        // Update local object
        currentUser.pass = newPass;
        currentUser.isFirstLogin = false;

        alert("Password updated successfully! Logging in...");
        loginUser(users[userIdx]);
    }
}

function loginUser(user) {
    currentUser = user;
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
    loadView('dashboard');
}

function logout() {
    localStorage.removeItem(DB_KEYS.SESSION);
    currentUser = null;
    loadView('login');
}

// --- DASHBOARD LOGIC ---
function setupDashboardView() {
    if (!currentUser) return;

    // Set Info
    document.getElementById('dash-username').innerText = currentUser.name;
    const usnEl = document.getElementById('dash-usn');
    if (usnEl) usnEl.innerText = `ID: ${currentUser.id}`;

    loadProfilePic();

    const welcomeName = document.getElementById('dash-welcome-name');
    if (welcomeName) welcomeName.innerText = currentUser.name;
    const roleEl = document.getElementById('dash-role');
    if (roleEl) roleEl.innerText = currentUser.role.toUpperCase();

    // Random Fact
    const fact = TECH_FACTS[Math.floor(Math.random() * TECH_FACTS.length)];
    const quoteEl = document.getElementById('tech-quote');
    if (quoteEl) quoteEl.innerText = `On this day in tech: ${fact}`;

    // Role Specific
    if (currentUser.role === 'cr') {
        const uploadNav = document.getElementById('nav-upload');
        if (uploadNav) uploadNav.classList.remove('hidden');
    }
    else if (currentUser.role === 'admin') {
        // UI Simplification for Boss
        // 1. Sidebar Title
        const dashRole = document.getElementById('dash-role');
        if (dashRole) dashRole.innerText = "BOSS";

        // 2. Reduce Sidebar Menu
        const navLinks = document.querySelectorAll('.nav-links li');
        navLinks.forEach(li => {
            const text = li.innerText.toLowerCase();
            if (!text.includes('home') && !text.includes('sign out')) {
                li.classList.add('hidden');
            }
        });

        // 3. Force Admin View on Load
        showSection('admin');
        renderAdminTable();

        // Force hide details panel for admin
        const detailsPanel = document.getElementById('personal-details-panel');
        if (detailsPanel) detailsPanel.classList.add('hidden');
        return;
    }

    // Bind Forms
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        if (currentUser.role === 'cr') {
            document.getElementById('upload-subject-badge').innerText = currentUser.subject.toUpperCase();
        }
        uploadForm.addEventListener('submit', handleUpload);
    }

    const doubtForm = document.getElementById('doubt-form');
    if (doubtForm) doubtForm.addEventListener('submit', handleDoubtSubmit);

    const detailsForm = document.getElementById('details-form');
    if (detailsForm) {
        // Check if details are already submitted
        if (currentUser.detailsSubmitted) {
            document.getElementById('personal-details-panel').classList.add('hidden');
        } else {
            document.getElementById('personal-details-panel').classList.remove('hidden');
            document.getElementById('detail-name').value = currentUser.name || '';
            document.getElementById('detail-age').value = currentUser.age || '';
            document.getElementById('detail-phone').value = currentUser.phone || '';
            detailsForm.addEventListener('submit', handleDetailsSubmit);
        }
    }
}

function handleDetailsSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('detail-name').value.trim();
    const age = document.getElementById('detail-age').value.trim();
    const phone = document.getElementById('detail-phone').value.trim();

    if (!name) return;

    currentUser.name = name;
    currentUser.age = age;
    currentUser.phone = phone;

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    // For admin, just ensure name is Boss and don't save other details if accidentally triggered
    if (currentUser.role === 'admin') {
        currentUser.name = "Boss";
        // users update logic skipped for admin detail changes as requested not to have option
        // but if code reaches here, just force name
    }

    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        users[idx].name = name;
        users[idx].age = age;
        users[idx].phone = phone;
        users[idx].detailsSubmitted = true; // Mark as submitted
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

        currentUser.detailsSubmitted = true;
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));
    }

    // Hide panel immediately
    document.getElementById('personal-details-panel').classList.add('hidden');


    document.getElementById('dash-username').innerText = name;
    const welcome = document.getElementById('dash-welcome-name');
    if (welcome) welcome.innerText = name;
    alert("Profile Updated.");
}

function updateClock() {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString();
}

// --- NAVIGATION & DOM ---
// --- NAVIGATION & DOM ---
function showSection(sectionId) {
    if (sectionId === 'admin' && currentUser.role !== 'admin') {
        alert("Restricted Access");
        return;
    }

    // Admin Redirect: If Boss clicks "Home" (dashboard), show Registry instead
    if (currentUser.role === 'admin' && sectionId === 'dashboard') {
        document.querySelectorAll('.section').forEach(el => el.classList.add('hidden')); // Hide all first
        document.getElementById('section-admin').classList.remove('hidden');

        const pt = document.getElementById('page-title');
        if (pt) pt.innerText = 'System Registry';

        renderAdminTable();
        return;
    }

    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');

    const titles = {
        'dashboard': 'Dashboard',
        'subjects': 'Academic Subjects',
        'doubts': 'Doubts',
        'upload': 'CR Control Center',
        'admin': 'Main Controller Registry'
    };
    const pt = document.getElementById('page-title');
    if (pt) pt.innerText = titles[sectionId] || 'EduNext';

    if (sectionId === 'doubts') loadDoubtsView();
    if (sectionId === 'subjects') showSubjectList();
}

// --- SUBJECTS LOGIC ---
let currentSubject = null;
let currentTab = 'materials';

function showSubjectList() {
    const grid = document.getElementById('subject-grid');
    if (grid) grid.classList.remove('hidden');
    const detail = document.getElementById('subject-detail-view');
    if (detail) detail.classList.add('hidden');
    const pt = document.getElementById('page-title');
    if (pt) pt.innerText = 'Select Subject';
}

function openSubject(subject) {
    currentSubject = subject;
    document.getElementById('subject-grid').classList.add('hidden');
    document.getElementById('subject-detail-view').classList.remove('hidden');
    document.getElementById('selected-subject-title').innerText = subject;
    document.getElementById('page-title').innerText = `${subject} Repository`;

    switchTab('materials');
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Simple matching
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(b => {
        if (b.innerText.toLowerCase().includes(tab) || b.getAttribute('onclick').includes(tab)) {
            b.classList.add('active');
        }
    });

    renderSubjectContent();
}

function renderSubjectContent() {
    const container = document.getElementById('subject-content-list');
    container.innerHTML = '';

    const content = JSON.parse(localStorage.getItem(DB_KEYS.CONTENT) || "[]");
    const filtered = content.filter(c =>
        c.subject.toLowerCase() === currentSubject.toLowerCase() &&
        c.category === currentTab
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">No content uploaded yet for ${currentTab}.</div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'file-item';
        // Add relative positioning for absolute delete button if needed, or flex
        div.style.position = 'relative';
        div.style.paddingBottom = '35px'; // Space for bottom bar

        let actionButtonsHtml = '';

        // 1. External Link
        if (item.link) {
            // "Link" text merging with icon
            actionButtonsHtml += `<a href="${item.link}" target="_blank" class="cyber-link action-btn" style="margin-right:15px;" title="Open External Resource"><i class="fas fa-link"></i> Link</a> `;
        }

        // 2. View Content (File)
        if (item.fileData) {
            actionButtonsHtml += `<button onclick="viewFile('${item.id}')" class="cyber-link action-btn" style="background:var(--highlight);"><i class="fas fa-eye"></i> View Content</button>`;
        }

        // 3. Delete Button (Calculated but placed in footer)
        let deleteBtnHtml = '';
        if (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === currentSubject.toLowerCase()) {
            deleteBtnHtml = `<button onclick="deleteContent('${item.id}')" class="cyber-link action-btn" style="background:rgba(255,0,0,0.8); color:white; font-size:0.8rem; padding:4px 10px;"><i class="fas fa-trash"></i> Delete</button>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <h4 style="margin:0; font-size:1.1rem; color:var(--text-main); font-weight:600;"><i class="fas fa-file-alt" style="color:var(--highlight); margin-right:8px;"></i> ${item.title}</h4>
                <small style="color:var(--text-muted); white-space:nowrap;">${item.date}</small>
            </div>
            
            <div style="display:flex; align-items:center; flex-wrap:wrap; gap:15px; margin-bottom:5px;">
                ${actionButtonsHtml}
            </div>

            <!-- Footer: Author Left, Delete Right -->
            <div style="position:absolute; bottom:10px; left:15px; right:15px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
                <small style="color:var(--primary); font-size:0.75rem;">Uploaded by ${item.author}</small>
                <div>${deleteBtnHtml}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function viewFile(itemId) {
    const content = JSON.parse(localStorage.getItem(DB_KEYS.CONTENT) || "[]");
    const item = content.find(c => c.id == itemId);

    if (!item || !item.fileData) {
        alert("Content not found locally.");
        return;
    }

    const modal = document.getElementById('file-viewer-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    modal.classList.remove('hidden');

    // Detect type
    const ext = (item.fileType || '').toLowerCase();

    // Universal Viewer Logic
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        // Image: View directly
        body.innerHTML = `<img src="${item.fileData}" oncontextmenu="return false;" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain;">`;
    } else if (ext === 'pdf') {
        // PDF: Embed
        body.innerHTML = `<iframe src="${item.fileData}#toolbar=0" style="width:100%;height:100%;border:none;"></iframe>`;
    } else {
        // Text/Code/Other: Try to show text content or fallback
        // For basic text files we can try to decode, but for now generic message
        body.innerHTML = `
            <div style="text-align:center; color:white;">
                <h3 style="margin-bottom:20px;">Preview Not Available</h3>
                <p>This file type (${ext}) cannot be previewed here.</p>
            </div>`;
    }
}

function closeFileViewer() {
    const modal = document.getElementById('file-viewer-modal');
    if (modal) modal.classList.add('hidden');
    const body = document.getElementById('modal-body');
    if (body) body.innerHTML = '';
}

function makeLink(text) {
    if (!text) return '';
    if (text.startsWith('http')) {
        return `<a href="${text}" target="_blank" class="cyber-link">Open Resource <i class="fas fa-external-link-alt"></i></a>`;
    }
    return text;
}

// --- DOUBTS LOGIC ---
function loadDoubtsView() {
    const select = document.getElementById('doubt-subject-select');
    if (!select) return;
    select.innerHTML = '';
    const subjects = ['Maths', 'Physics', 'SNW', 'PSP'];

    subjects.forEach(sub => {
        let canAsk = true;
        if (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === sub.toLowerCase()) {
            canAsk = false;
        }
        if (canAsk) {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.innerText = sub;
            select.appendChild(opt);
        }
    });

    renderDoubtsList();
}

function handleDoubtSubmit(e) {
    e.preventDefault();
    const subject = document.getElementById('doubt-subject-select').value;
    const text = document.getElementById('doubt-text').value;
    const link = document.getElementById('doubt-link').value;
    const fileInput = document.getElementById('doubt-file');
    const file = fileInput && fileInput.files[0];

    const saveDoubt = (fileData = null) => {
        const newDoubt = {
            id: Date.now(),
            subject: subject,
            text: text,
            link: link,
            imageData: fileData, // Store Base64
            authorId: currentUser.id,
            authorName: currentUser.name,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
            replies: []
        };

        const doubts = JSON.parse(localStorage.getItem(DB_KEYS.DOUBTS) || "[]");
        doubts.push(newDoubt);

        try {
            localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify(doubts));
            e.target.reset();
            document.getElementById('file-name-display').innerText = "";
            alert("Query Posted Successfully.");
            renderDoubtsList();
        } catch (err) {
            alert("Storage full! Image too large.");
            doubts.pop(); // Revert
            localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify(doubts));
        }
    };

    if (file) {
        if (file.size > 2000000) { // 2MB limit
            alert("Image too large (>2MB). Please compress it.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
            saveDoubt(evt.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        saveDoubt(null);
    }
}

function renderDoubtsList() {
    const list = document.getElementById('doubts-list');
    if (!list) return;
    list.innerHTML = '';

    let doubts = JSON.parse(localStorage.getItem(DB_KEYS.DOUBTS) || "[]");

    // Filter for CRs to only see their subject's doubts
    if (currentUser.role === 'cr') {
        doubts = doubts.filter(d => d.subject.toLowerCase() === currentUser.subject.toLowerCase());
    }

    // Reverse to show newest first
    doubts.slice().reverse().forEach(d => {
        const div = document.createElement('div');
        div.className = 'doubt-item glass-panel';
        div.style.padding = "15px";
        div.style.marginBottom = "15px";

        // Reply Section
        let repliesHtml = '';
        if (d.replies && d.replies.length > 0) {
            repliesHtml += `<div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                <small style="color:var(--highlight); font-weight:bold;">Answers from CR:</small>`;
            d.replies.forEach((r, index) => {
                let attachmentHtml = '';
                if (r.attachmentData) {
                    // Check file type
                    if (r.attachmentData.startsWith('data:image')) {
                        attachmentHtml = `<div style="margin-top:5px;"><img src="${r.attachmentData}" style="max-width:150px; border-radius:5px; cursor:pointer;" onclick="openImageModal('${r.attachmentData}')"></div>`;
                    } else {
                        attachmentHtml = `<div style="margin-top:5px;"><a href="${r.attachmentData}" download="attachment" class="cyber-link">Download Attachment</a></div>`;
                    }
                }

                // Reply Delete Option
                let deleteReplyHtml = '';
                if (currentUser.name === r.authorName || (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase())) {
                    deleteReplyHtml = `<i class="fas fa-trash" style="color:#ff4444; cursor:pointer; font-size:0.8rem; margin-left:10px;" onclick="deleteReply(${d.id}, ${index})" title="Delete Reply"></i>`;
                }

                repliesHtml += `<div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:5px; margin-top:5px; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                         <div><strong style="color:var(--secondary);">${r.authorName}:</strong> ${r.text}</div>
                         <div>${deleteReplyHtml}</div>
                    </div>
                    ${attachmentHtml}
                    <div style="font-size:0.7rem; color:#888;">${r.date}</div>
                </div>`;
            });
            repliesHtml += `</div>`;
        }

        // Reply Input (Only for correct CR)
        let replyInputHtml = '';
        if (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase()) {
            replyInputHtml = `
            <div style="margin-top:10px; display:flex; flex-direction:column; gap:5px;">
                <input type="text" id="reply-input-${d.id}" placeholder="Type answer..." style="padding:5px; font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                   <input type="file" id="reply-file-${d.id}" style="font-size:0.8rem; color:var(--text-muted);">
                   <button onclick="postReply(${d.id})" class="cyber-btn small-btn" style="width:auto; padding:5px 15px;">Send</button>
                </div>
            </div>`;
        }

        // Student Doubt Image Display
        let studentImageHtml = '';
        if (d.imageData) {
            studentImageHtml = `<div style="margin-top:10px;"><img src="${d.imageData}" style="max-width:100%; max-height:200px; object-fit:contain; border-radius:8px; cursor:pointer;" onclick="openImageModal('${d.imageData}')"></div>`;
        } else if (d.hasImage) {
            // Backward compatibility for old "hasImage" boolean
            studentImageHtml = `<div style="color:var(--primary); font-size:0.9rem;"><i class="fas fa-paperclip"></i> Image Attachment (Legacy)</div>`;
        }

        // Check delete permissions for the Doubt itself
        // 1. Author (Student) can delete their own doubt
        // 2. CR of the subject can delete any doubt in that subject
        let showDeleteDoubt = false;
        if (d.authorId === currentUser.id) {
            showDeleteDoubt = true;
        } else if (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase()) {
            showDeleteDoubt = true;
        }

        let deleteDoubtHtml = '';
        if (showDeleteDoubt) {
            deleteDoubtHtml = `<button onclick="deleteDoubt(${d.id})" class="cyber-link action-btn" style="background:rgba(255,0,0,0.8); color:white; font-size:0.8rem; padding:4px 10px;"><i class="fas fa-trash"></i> Delete</button>`;
        }

        // Add Delete Button to Main Doubt Card Footer
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span class="badge" style="background:var(--primary);color:#000; padding:2px 8px; border-radius:4px;">${d.subject}</span>
                <small style="color:#aaa;">${d.authorName} • ${d.date}</small>
            </div>
            <p style="font-size:1.1rem; margin-bottom:10px;">${d.text}</p>
            ${d.link ? `<div style="margin-bottom:5px;"><a href="${d.link}" target="_blank" style="color:var(--secondary)">Reference Link</a></div>` : ''}
            ${studentImageHtml}
            ${repliesHtml}
            ${replyInputHtml}
            
            ${showDeleteDoubt ? `<div style="display:flex; justify-content:flex-end; margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">${deleteDoubtHtml}</div>` : ''}
        `;
        list.appendChild(div);
    });
}

function postReply(doubtId) {
    const input = document.getElementById(`reply-input-${doubtId}`);
    const text = input.value.trim();
    const fileInput = document.getElementById(`reply-file-${doubtId}`);
    const file = fileInput && fileInput.files[0];

    if (!text && !file) {
        alert("Please enter text or attach a file.");
        return;
    }

    const saveReply = (fileData = null) => {
        const doubts = JSON.parse(localStorage.getItem(DB_KEYS.DOUBTS));
        const doubtIndex = doubts.findIndex(d => d.id === doubtId);

        if (doubtIndex !== -1) {
            if (!doubts[doubtIndex].replies) doubts[doubtIndex].replies = [];

            doubts[doubtIndex].replies.push({
                authorName: currentUser.name,
                text: text,
                attachmentData: fileData,
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
            });

            try {
                localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify(doubts));
                alert("Reply posted.");
                renderDoubtsList();
            } catch (err) {
                alert("Storage full! Attachment too large.");
                // Could try to revert but simple alert is ok for now
            }
        }
    };

    if (file) {
        if (file.size > 2000000) {
            alert("Attachment too large (>2MB).");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
            saveReply(evt.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        saveReply(null);
    }
}

function openImageModal(imgSrc) {
    const modal = document.getElementById('file-viewer-modal');
    const body = document.getElementById('modal-body');
    if (modal && body) {
        body.innerHTML = `<img src="${imgSrc}" oncontextmenu="return false;" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain;">`;
        modal.classList.remove('hidden');
    }
}

function deleteDoubt(doubtId) {
    if (!confirm("Permanently delete this discussion?")) return;

    let doubts = JSON.parse(localStorage.getItem(DB_KEYS.DOUBTS) || "[]");
    const initialLen = doubts.length;
    doubts = doubts.filter(d => d.id != doubtId); // loose equality

    if (doubts.length < initialLen) {
        localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify(doubts));
        renderDoubtsList();
    } else {
        alert("Error: Doubt not found.");
    }
}

function deleteReply(doubtId, replyIndex) {
    if (!confirm("Delete this reply?")) return;

    let doubts = JSON.parse(localStorage.getItem(DB_KEYS.DOUBTS) || "[]");
    const doubtIndex = doubts.findIndex(d => d.id == doubtId); // loose equality

    if (doubtIndex !== -1 && doubts[doubtIndex].replies && doubts[doubtIndex].replies[replyIndex]) {
        doubts[doubtIndex].replies.splice(replyIndex, 1);
        localStorage.setItem(DB_KEYS.DOUBTS, JSON.stringify(doubts));
        renderDoubtsList();
    }
}

// --- UPLOAD LOGIC ---
function handleUpload(e) {
    e.preventDefault();
    // Allow any user with role 'cr' to upload. They upload to their assigned subject automatically.
    if (currentUser.role !== 'cr') return;

    const fileInput = document.getElementById('upload-file');
    const file = fileInput && fileInput.files[0];

    // Allow all file types (Removed Image restriction)
    // if (file) { ... }

    // Helper to save
    const saveContent = (fileData = null, fileName = null, fileType = null) => {
        const newItem = {
            id: Date.now(),
            category: document.getElementById('upload-category').value,
            title: document.getElementById('upload-title').value,
            link: document.getElementById('upload-link').value,
            fileData: fileData, // Base64
            fileName: fileName,
            fileType: fileType,
            subject: currentUser.subject,
            author: currentUser.name,
            date: new Date().toLocaleDateString()
        };

        const content = JSON.parse(localStorage.getItem(DB_KEYS.CONTENT) || "[]");
        content.push(newItem);

        try {
            localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify(content));
            document.getElementById('upload-status').innerText = "Resource Added Successfully!";
            setTimeout(() => document.getElementById('upload-status').innerText = "", 3000);
            e.target.reset();
        } catch (err) {
            alert("Storage full! File too large. Please use a Link instead.");
            // Revert push
            content.pop();
            localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify(content));
        }
    };

    if (file) {
        if (file.size > 2000000) { // 2MB limit warning
            alert("File is too large for browser storage (>2MB). Please upload to Drive and share the link.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (evt) {
            saveContent(evt.target.result, file.name, file.name.split('.').pop());
        };
        reader.readAsDataURL(file);
    } else {
        saveContent();
    }
}

function deleteContent(itemId) {
    let content = JSON.parse(localStorage.getItem(DB_KEYS.CONTENT) || "[]");
    const item = content.find(c => c.id == itemId);

    if (!item) {
        alert("Item not found.");
        return;
    }

    if (!confirm(`Permanently delete "${item.title}"?`)) return;

    const initialLen = content.length;
    content = content.filter(c => c.id != itemId); // loose equality for string/number id check

    if (content.length < initialLen) {
        localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify(content));
        // alert("Deleted."); // Optional, maybe too noisy
        renderSubjectContent();
    } else {
        alert("Error: Item not found.");
    }
}

// --- ADMIN LOGIC ---
function renderAdminTable() {
    const tbody = document.getElementById('admin-user-table');
    if (!tbody) return;

    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));

    users.filter(u => u.role !== 'admin' && !u.hidden).forEach(u => {
        const tr = document.createElement('tr');

        let imgTag = `<div class="admin-profile-pic">?</div>`;
        if (u.profilePic) {
            imgTag = `<img src="${u.profilePic}" class="admin-profile-pic" style="width:40px;height:40px;border-radius:5px;">`;
        }

        tr.innerHTML = `
            <td style="color:var(--primary);">${u.id}</td>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    ${imgTag}
                    <div>
                        <div style="font-weight:bold;">${u.name}</div>
                        <div style="font-size:0.8rem; color:#888;">${u.phone || 'No Phone'}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge" style="background:${u.role === 'cr' ? 'var(--secondary)' : '#333'}">${u.role.toUpperCase()}</span></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="action-btn" onclick="resetUserPassword('${u.id}')" title="Reset Password">
                        <i class="fas fa-key"></i> Pass
                    </button>
                    <button class="action-btn" style="background:#ff9f1c;" onclick="resetPersonalDetails('${u.id}')" title="Reset Profile">
                        <i class="fas fa-user-edit"></i> Profile
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function resetUserPassword(userId) {
    if (!confirm(`Reset password for ${userId} to default?`)) return;

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    const idx = users.findIndex(u => u.id === userId);

    if (idx !== -1) {
        users[idx].pass = DEFAULT_PASSWORD;
        users[idx].isFirstLogin = true;
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        renderAdminTable();
        alert(`Password reset for ${userId}. Helper: User needs to change password on next login.`);
    }
}

function resetPersonalDetails(userId) {
    if (!confirm(`Reset personal details for ${userId}? They will need to re-enter everything.`)) return;

    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    const idx = users.findIndex(u => u.id === userId);

    if (idx !== -1) {
        // Reset to initial state
        users[idx].detailsSubmitted = false;
        users[idx].isFirstLogin = true; // Force security setup again as requested
        users[idx].pass = DEFAULT_PASSWORD; // "Reset ... Password"
        users[idx].name = users[idx].role === 'student' ? `Student ${userId}` : `CR ${users[idx].subject}`; // Reset name generic
        users[idx].age = '';
        users[idx].phone = '';
        users[idx].profilePic = ''; // Clear image

        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        renderAdminTable();
        alert(`Personal details reset for ${userId}.`);
    }
}

// --- PROFILE PICTURE ---
function triggerProfileUpload() {
    const el = document.getElementById('profile-upload-input');
    if (el) el.click();
}

function handleProfileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const base64String = event.target.result;

        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        const idx = users.findIndex(u => u.id === currentUser.id);

        if (idx !== -1) {
            users[idx].profilePic = base64String;
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
            currentUser.profilePic = base64String;

            // Save Session
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));

            loadProfilePic();
        }
    };
    reader.readAsDataURL(file);
}

function loadProfilePic() {
    const img = document.getElementById('profile-img-preview');
    const initials = document.getElementById('profile-initials');
    if (!img || !initials) return;

    if (currentUser.profilePic) {
        img.src = currentUser.profilePic;
        img.classList.remove('hidden');
        initials.classList.add('hidden');
    } else {
        img.classList.add('hidden');
        initials.classList.remove('hidden');
    }
}

window.addEventListener('DOMContentLoaded', init);
