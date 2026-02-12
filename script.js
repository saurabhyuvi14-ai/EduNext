
// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- DYNAMIC CONFIGURATION ---
let app, analytics, db, auth;
let DEFAULT_PASSWORD, CONTROLLER_ID;

const DB_KEYS = {
    SESSION: "edunext_session_v1"
};

// Facts
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
    "The first tweet was 'just setting up my twttr'."
];

async function initializeAppWithConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();

        // Init Firebase
        app = initializeApp(config.firebase);
        analytics = getAnalytics(app);
        db = getFirestore(app);

        // Set App Constants
        DEFAULT_PASSWORD = config.app.defaultPass;
        CONTROLLER_ID = config.app.controllerId;

        console.log("Configuration Loaded.");
        return true;
    } catch (error) {
        console.error("Failed to load configuration:", error);
        document.body.innerHTML = '<h1 style="color:white;text-align:center;margin-top:20%;">System Error: Config Failed</h1>';
        return false;
    }
}

// Global State
let currentUser = null;
let currentSubject = null;
let currentTab = 'materials';

// --- DATA ACCESS LAYER (Firestore) ---

// Seeding Check & Execution
// Seeding Check & Execution
async function checkAndSeedDatabase() {
    // Ensure Anonymous Auth (for reading users to verify password)
    auth = getAuth(app);
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log("Authenticated anonymously.");
        } catch (authErr) {
            console.warn("Auth Silent Fail:", authErr);
        }
    }

    // Check if Controller exists
    const controllerDocRef = doc(db, "users", CONTROLLER_ID);
    const docSnap = await getDoc(controllerDocRef);

    if (!docSnap.exists()) {
        console.log("Seeding Database...");

        // 1. Seed Controller (Boss)
        await setDoc(doc(db, "users", CONTROLLER_ID), {
            id: CONTROLLER_ID,
            pass: "NST@123", // Default per config
            role: "admin",
            name: "Boss",
            isFirstLogin: true,
            detailsSubmitted: false, // Boss doesn't need personal details usually but keep consistent
            hidden: true // Hide from general list maybe? No, Boss views registry.
        });

        // 2. Seed CRs (1 per subject)
        const subjects = ['Maths', 'Physics', 'SNW', 'PSP'];
        for (let sub of subjects) {
            // Predictable ID generation or Random? Let's use simple logic or random
            // Per previous logic, USNs were 2102508701...
            // Let's create dummy CRs for now
            // Just for demonstration, creating CRs with distinct IDs if needed
            // Actually, let's skip auto-creating CRs if not present, user can add them?
            // "The user's previous request mentioned generating specific USNs".
            // Let's implement that logic here.
        }

        // 3. Seed Students
        // Generate USNs: 2102508701 to 2102508825
        const startUSN = 2102508701;
        const endUSN = 2102508825;
        const crUSNs = [2102508726, 2102508752, 2102508785, 2102508810]; // Randomly pick some as CRs or defined

        let subjectIndex = 0;

        const batchPromises = [];

        for (let i = startUSN; i <= endUSN; i++) {
            const id = i.toString();
            let role = 'student';
            let subject = '';

            // Assign CR based on index logic or specific IDs
            if (crUSNs.includes(i)) {
                role = 'cr';
                subject = subjects[subjectIndex % 4];
                subjectIndex++;
            }

            const userData = {
                id: id,
                pass: DEFAULT_PASSWORD,
                role: role,
                name: role === 'cr' ? `CR ${subject}` : `Student ${id.slice(-3)}`,
                subject: subject, // Only for CR
                isFirstLogin: true,
                detailsSubmitted: false,
                age: '',
                phone: '',
                profilePic: ''
            };

            batchPromises.push(setDoc(doc(db, "users", id), userData));
        }

        await Promise.all(batchPromises);
        console.log("Database Seeded Successfully.");
        alert("Database Connected & Seeded with Default Users.");
    } else {
        console.log("Database already initialized.");
    }
}


// --- AUTHENTICATION ---
async function login() {
    const userIdInput = document.getElementById('login-id');
    const passwordInput = document.getElementById('login-pass');
    const statusMsg = document.getElementById('login-msg');

    // Clear previous status
    if (statusMsg) statusMsg.innerText = "";
    if (userIdInput) userIdInput.classList.remove('shake');
    if (passwordInput) passwordInput.classList.remove('shake');

    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (!userId || !password) {
        statusMsg.innerText = "Please enter both User ID and Password.";
        userIdInput.classList.add('shake');
        return;
    }

    try {
        statusMsg.innerText = "Verifying...";

        // Ensure Auth (Anonymously if needed for basic read rules)
        auth = getAuth(app);
        if (!auth.currentUser) {
            try {
                await signInAnonymously(auth);
            } catch (err) {
                console.warn("Anon Auth Failed (Silent):", err);
                // Proceed anyway, maybe rules are public or it will fail later silently
            }
        }

        // Fetch User from Firestore
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const user = userSnap.data();
            if (user.pass === password) {
                // Success
                currentUser = user;
                localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));

                statusMsg.style.color = "#4cc9f0";
                statusMsg.innerText = "Access Granted. Redirecting...";

                setTimeout(() => {
                    initDashboard();
                }, 800);
            } else {
                statusMsg.style.color = "#ff4d6d";
                statusMsg.innerText = "Invalid Password.";
                passwordInput.classList.add('shake');
            }
        } else {
            statusMsg.style.color = "#ff4d6d";
            statusMsg.innerText = "User ID not found in database.";
            userIdInput.classList.add('shake');
        }
    } catch (error) {
        console.error("Login Error:", error);
        // Show actual error to help debug
        let errMsg = error.message;
        if (error.code) errMsg = `Code: ${error.code}`;
        statusMsg.innerText = "Login Failed: " + errMsg;
    }
}

function logout() {
    localStorage.removeItem(DB_KEYS.SESSION);
    location.reload();
}


// --- DASHBOARD LOGIC ---

async function initDashboard() {
    document.getElementById('login-view').classList.add('hidden');

    // Setup Check (First Login)
    if (currentUser.isFirstLogin && currentUser.role !== 'admin') {
        // Admin might skip, but user said "All users including admin" might need setup?
        // Let's follow existing logic: Admin skips setup usually unless enforced.
        // If current user is Admin (Boss), maybe skip setup.
        if (currentUser.id === CONTROLLER_ID) {
            setupDashboardView();
        } else {
            setupFirstLogin();
        }
    } else {
        setupDashboardView();
    }
}

function setupFirstLogin() {
    const template = document.getElementById('setup-account');
    const clone = template.content.cloneNode(true);
    document.body.appendChild(clone);
    document.getElementById('setup-userid').value = currentUser.id;
    document.getElementById('setup-form').addEventListener('submit', handleSetupSubmit);
}

async function handleSetupSubmit(e) {
    e.preventDefault();
    const pass1 = document.getElementById('setup-new-pass').value;
    const pass2 = document.getElementById('setup-confirm-pass').value;

    if (pass1 !== pass2) {
        alert("Passwords do not match!");
        return;
    }
    if (pass1.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
            pass: pass1,
            isFirstLogin: false
        });

        currentUser.pass = pass1;
        currentUser.isFirstLogin = false;
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));

        document.querySelector('.setup-container').remove();
        setupDashboardView();
        alert("Account Secured. Welcome!");
    } catch (err) {
        console.error("Setup Error:", err);
        alert("Failed to update password. Try again.");
    }
}


function setupDashboardView() {
    // Render Dashboard Template
    const template = document.getElementById('view-dashboard');
    const clone = template.content.cloneNode(true);
    document.body.innerHTML = ''; // Clear Body
    document.body.appendChild(clone);

    // Bind Global Functions for HTML onClick
    // Since module scope prevents global access, we attach necessary functions to window
    // (We do this at end of file, but good to remember context here)

    // Set User Info
    document.getElementById('dash-username').innerText = currentUser.name;
    const usnEl = document.getElementById('dash-usn');
    if (usnEl) usnEl.innerText = `ID: ${currentUser.id}`; // Masked or full

    loadProfilePic();

    const welcomeName = document.getElementById('dash-welcome-name');
    if (welcomeName) welcomeName.innerText = currentUser.name;
    const roleEl = document.getElementById('dash-role');
    if (roleEl) roleEl.innerText = currentUser.role.toUpperCase() === 'ADMIN' ? 'BOSS' : currentUser.role.toUpperCase();

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
        const dashRole = document.getElementById('dash-role');
        if (dashRole) dashRole.innerText = "BOSS";

        const navLinks = document.querySelectorAll('.nav-links li');
        navLinks.forEach(li => {
            const text = li.innerText.toLowerCase();
            if (!text.includes('home') && !text.includes('sign out')) {
                li.classList.add('hidden');
            }
        });

        showSection('admin');
        renderAdminTable();
        return; // Skip other setup
    }

    // Bind Forms
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        if (currentUser.role === 'cr') {
            const badge = document.getElementById('upload-subject-badge');
            if (badge) badge.innerText = currentUser.subject.toUpperCase();
        }
        uploadForm.addEventListener('submit', handleUpload);
    }

    const doubtForm = document.getElementById('doubt-form');
    if (doubtForm) doubtForm.addEventListener('submit', handleDoubtSubmit);

    // Personal Details Logic
    const detailsForm = document.getElementById('details-form');
    if (detailsForm) {
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

    // Initial Render
    showSection('dashboard');
    startClock();
}

async function handleDetailsSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('detail-name').value;
    const age = document.getElementById('detail-age').value;
    const phone = document.getElementById('detail-phone').value;

    try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
            name: name,
            age: age,
            phone: phone,
            detailsSubmitted: true
        });

        currentUser.name = name;
        currentUser.age = age;
        currentUser.phone = phone;
        currentUser.detailsSubmitted = true;
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));

        document.getElementById('personal-details-panel').classList.add('hidden');
        document.getElementById('dash-username').innerText = name;
        const welcome = document.getElementById('dash-welcome-name');
        if (welcome) welcome.innerText = name;
        alert("Profile Updated.");
    } catch (err) {
        console.error("Profile Update Error", err);
        alert("Update failed.");
    }
}


// --- CONTENT & ACADEMICS ---

function showSection(sectionId) {
    // Close sidebar on mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }

    if (sectionId === 'admin' && currentUser.role !== 'admin') {
        alert("Restricted Access");
        return;
    }

    // Boss Home Redirect
    if (currentUser.role === 'admin' && sectionId === 'dashboard') {
        document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
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

    // Highlight Active Nav (if simple text match logic)
    // Here we rely on onclick passing 'sectionId' but visual active state is handled via querySelectorAll removal above
    // We need to find the LI that corresponds to this section to add 'active'
    // Simple loop:
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(li => {
        if (li.getAttribute('onclick') && li.getAttribute('onclick').includes(sectionId)) {
            li.classList.add('active');
        }
    });

    if (sectionId === 'doubts') renderDoubtsList(); // Fetch fresh
    if (sectionId === 'subjects') showSubjectList();
}

function showSubjectList() {
    document.getElementById('subject-grid').classList.remove('hidden');
    document.getElementById('subject-detail-view').classList.add('hidden');
    document.getElementById('page-title').innerText = 'Academic Subjects';
}

function openSubject(subject) {
    currentSubject = subject;
    document.getElementById('subject-grid').classList.add('hidden');
    document.getElementById('subject-detail-view').classList.remove('hidden');
    document.getElementById('selected-subject-title').innerText = subject;
    document.getElementById('page-title').innerText = `Academics: ${subject}`;
    switchTab('materials'); // Load default tab
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Highlight active
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(b => {
        if (b.innerText.toLowerCase().includes(tab) || b.getAttribute('onclick').includes(tab)) {
            b.classList.add('active');
        }
    });

    renderSubjectContent();
}

async function renderSubjectContent() {
    const container = document.getElementById('subject-content-list');
    container.innerHTML = '<div style="text-align:center; padding:20px;">Loading content...</div>';

    try {
        // Query Firestore: content where subject == currentSubject AND category == currentTab
        const q = query(
            collection(db, "content"),
            where("subject", "==", currentSubject),
            where("category", "==", currentTab)
            // orderBy("date", "desc") // Requires index, use client sort for now if small
        );

        const querySnapshot = await getDocs(q);
        const content = [];
        querySnapshot.forEach((doc) => {
            content.push({ id: doc.id, ...doc.data() });
        });

        // Sort client side (descending date/time)
        // Assuming date is string "MM/DD/YYYY", simplistic sort might fail.
        // For robustness, relying on insertion order or adding timestamp field.
        // Let's use reverse order of fetch if reliable, or sort by ID (Date.now())
        content.sort((a, b) => b.timestamp - a.timestamp); // Assuming we add timestamp on upload

        container.innerHTML = '';

        if (content.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">No content uploaded yet for ${currentTab}.</div>`;
            return;
        }

        content.forEach(item => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.style.position = 'relative';
            div.style.paddingBottom = '35px';

            let actionButtonsHtml = '';
            if (item.link) {
                actionButtonsHtml += `<a href="${item.link}" target="_blank" class="cyber-link action-btn" style="margin-right:15px;" title="Open External Resource"><i class="fas fa-link"></i> Link</a> `;
            }
            if (item.fileData) {
                // If storing large base64 in Firestore, it works but isn't efficient. Best practice is Storage.
                // But request says "remove hardcoded data". Migrating to Firestore with base64 is seamless transition for now.
                actionButtonsHtml += `<button onclick="viewFile('${item.id}')" class="cyber-link action-btn" style="background:var(--highlight);"><i class="fas fa-eye"></i> View Content</button>`;
            }

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

                <div style="position:absolute; bottom:10px; left:15px; right:15px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
                    <small style="color:var(--primary); font-size:0.75rem;">Uploaded by ${item.author}</small>
                    <div>${deleteBtnHtml}</div>
                </div>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error fetching content:", err);
        container.innerHTML = '<div style="color:red; text-align:center;">Error loading content.</div>';
    }
}

async function handleUpload(e) {
    e.preventDefault();
    if (currentUser.role !== 'cr') return;

    const fileInput = document.getElementById('upload-file');
    const file = fileInput && fileInput.files[0];
    const category = document.getElementById('upload-category').value;
    const title = document.getElementById('upload-title').value;
    const link = document.getElementById('upload-link').value;

    const saveContent = async (fileData = null, fileName = null, fileType = null) => {
        const newItem = {
            category: category,
            title: title,
            link: link,
            fileData: fileData,
            fileName: fileName,
            fileType: fileType,
            subject: currentUser.subject,
            author: currentUser.name,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now() // For sorting
        };

        try {
            await addDoc(collection(db, "content"), newItem);
            document.getElementById('upload-status').innerText = "Resource Added Successfully!";
            setTimeout(() => document.getElementById('upload-status').innerText = "", 3000);
            e.target.reset();
            if (currentSubject === currentUser.subject && currentTab === category) {
                renderSubjectContent(); // Refresh if viewing same tab
            }
        } catch (err) {
            console.error("Upload Error:", err);
            alert("Failed to upload. " + err.message);
        }
    };

    if (file) {
        if (file.size > 5000000) { // Bump limit to 5MB for Firestore? Firestore doc limit is 1MB!
            // Uh oh. Firestore Document Max Size is 1MB. Base64 images/PDFs can easily exceed this.
            // Using Firebase Storage is recommended.
            // But implementing Storage requires more UI logic (upload task etc).
            // For now, if "remove hardcoded data" is purely DB, I will stick to 1MB limit check.
            alert("File is too large > 1MB. Please use Firebase Storage or smaller files.");
            return;
        }

        // Actually, let's keep it safe at 900KB
        if (file.size > 900000) {
            alert("File too large (>900KB) for Database Storage. Please link Google Drive instead.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
            saveContent(evt.target.result, file.name, file.type);
        };
        reader.readAsDataURL(file);
    } else {
        saveContent(null);
    }
}

async function deleteContent(docId) {
    if (!confirm("Permanently delete this item?")) return;
    try {
        await deleteDoc(doc(db, "content", docId));
        renderSubjectContent();
    } catch (err) {
        console.error("Deletion Failed:", err);
        alert("Failed to delete.");
    }
}

async function viewFile(docId) {
    // Need to fetch doc content purely?
    // In renderSubjectContent we do not pass the full base64 to onclick to save HTML size?
    // Or we did? In loop: `viewFile('${item.id}')`.
    // We need to fetch it now.

    // Slight Optimization: pass data if small, but fetching is cleaner
    const modal = document.getElementById('file-viewer-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    body.innerHTML = '<div style="color:white;">Loading...</div>';
    modal.classList.remove('hidden');

    try {
        const docSnap = await getDoc(doc(db, "content", docId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const fileData = data.fileData;

            if (fileData.startsWith('data:image')) {
                body.innerHTML = `<img src="${fileData}" oncontextmenu="return false;" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain;">`;
            } else if (fileData.startsWith('data:application/pdf')) {
                body.innerHTML = `<iframe src="${fileData}" style="width:100%;height:100%;border:none;"></iframe>`;
            } else {
                body.innerHTML = `<div style="text-align:center;color:white;">Preview not available.<br><a href="${fileData}" download="${data.fileName || 'file'}" class="cyber-btn small-btn" style="margin-top:20px;display:inline-block;">Download File</a></div>`;
            }
        } else {
            body.innerHTML = '<div style="color:red;">File not found.</div>';
        }
    } catch (err) {
        console.error("View Error:", err);
        body.innerHTML = '<div style="color:red;">Error loading file.</div>';
    }
}


// --- DOUBTS SYSTEM ---

async function renderDoubtsList() {
    const list = document.getElementById('doubts-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center; padding:20px;">Loading discussions...</div>';

    try {
        let q = query(collection(db, "doubts")/*, orderBy("timestamp", "desc")*/);
        if (currentUser.role === 'cr') {
            q = query(collection(db, "doubts"), where("subject", "==", currentUser.subject));
        }

        const querySnapshot = await getDocs(q);
        const doubts = [];
        querySnapshot.forEach(doc => {
            doubts.push({ id: doc.id, ...doc.data() });
        });

        doubts.sort((a, b) => b.timestamp - a.timestamp); // Manual sort

        list.innerHTML = '';
        if (doubts.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">No queries found.</div>';
            return;
        }

        doubts.forEach(d => {
            const div = document.createElement('div');
            div.className = 'doubt-item glass-panel';
            div.style.padding = "15px";
            div.style.marginBottom = "15px";

            // Replies HTML Generation
            let repliesHtml = '';
            if (d.replies && d.replies.length > 0) {
                repliesHtml += `<div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                     <small style="color:var(--highlight); font-weight:bold;">Answers from CR:</small>`;
                d.replies.forEach((r, index) => {
                    let attachmentHtml = '';
                    if (r.attachmentData) {
                        if (r.attachmentData.startsWith('data:image')) {
                            attachmentHtml = `<div style="margin-top:5px;"><img src="${r.attachmentData}" style="max-width:150px; border-radius:5px; cursor:pointer;" onclick="openImageModal('${r.attachmentData}')"></div>`;
                        } else {
                            attachmentHtml = `<div style="margin-top:5px;"><a href="${r.attachmentData}" download="attachment" class="cyber-link">Download Attachment</a></div>`;
                        }
                    }

                    let deleteReplyHtml = '';
                    if (currentUser.name === r.authorName || (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase())) {
                        // Pass Indices? UpdateDoc requires updating the whole array usually or specific field.
                        // We will need a helper to delete reply by filtering the array and updating doc.
                        // We pass `d.id` and `index`.
                        deleteReplyHtml = `<i class="fas fa-trash" style="color:#ff4444; cursor:pointer; font-size:0.8rem; margin-left:10px;" onclick="deleteReply('${d.id}', ${index})" title="Delete Reply"></i>`;
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
                repliesHtml += '</div>';
            }

            // Reply Input
            let replyInputHtml = '';
            if (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase()) {
                replyInputHtml = `
                <div style="margin-top:10px; display:flex; flex-direction:column; gap:5px;">
                    <input type="text" id="reply-input-${d.id}" placeholder="Type answer..." style="padding:5px; font-size:0.9rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                       <input type="file" id="reply-file-${d.id}" style="font-size:0.8rem; color:var(--text-muted);">
                       <button onclick="postReply('${d.id}')" class="cyber-btn small-btn" style="width:auto; padding:5px 15px;">Send</button>
                    </div>
                </div>`;
            }

            // Image
            let studentImageHtml = '';
            if (d.imageData) {
                studentImageHtml = `<div style="margin-top:10px;"><img src="${d.imageData}" style="max-width:100%; max-height:200px; object-fit:contain; border-radius:8px; cursor:pointer;" onclick="openImageModal('${d.imageData}')"></div>`;
            }

            // Delete Doubt Button
            let showDeleteDoubt = false;
            if (d.authorId === currentUser.id || (currentUser.role === 'cr' && currentUser.subject.toLowerCase() === d.subject.toLowerCase())) {
                showDeleteDoubt = true;
            }
            let deleteDoubtHtml = showDeleteDoubt ? `<button onclick="deleteDoubt('${d.id}')" class="cyber-link action-btn" style="background:rgba(255,0,0,0.8); color:white; font-size:0.8rem; padding:4px 10px;"><i class="fas fa-trash"></i> Delete</button>` : '';

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

    } catch (err) {
        console.error("Error fetching doubts:", err);
    }
}

async function handleDoubtSubmit(e) {
    e.preventDefault();
    const subject = document.getElementById('doubt-subject-select').value;
    const text = document.getElementById('doubt-text').value;
    const link = document.getElementById('doubt-link').value;
    const fileInput = document.getElementById('doubt-file');
    const file = fileInput && fileInput.files[0];

    const saveDoubt = async (fileData = null) => {
        const newDoubt = {
            subject: subject,
            text: text,
            link: link,
            imageData: fileData,
            authorId: currentUser.id,
            authorName: currentUser.name,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            replies: []
        };

        try {
            await addDoc(collection(db, "doubts"), newDoubt);
            e.target.reset();
            document.getElementById('file-name-display').innerText = "";
            alert("Query Posted Successfully.");
            renderDoubtsList();
        } catch (err) {
            console.error("Doubt Post Error:", err);
            alert("Failed to post query. " + err.message);
        }
    };

    if (file) {
        // Size validation
        if (file.size > 900000) { alert("Image too large (>900KB)."); return; }
        const reader = new FileReader();
        reader.onload = function (evt) {
            saveDoubt(evt.target.result);
        }
        reader.readAsDataURL(file);
    } else {
        saveDoubt(null);
    }
}

async function postReply(doubtId) {
    const input = document.getElementById(`reply-input-${doubtId}`);
    const text = input.value.trim();
    const fileInput = document.getElementById(`reply-file-${doubtId}`);
    const file = fileInput && fileInput.files[0];

    if (!text && !file) {
        alert("Please enter text or attach a file.");
        return;
    }

    const saveReply = async (fileData = null) => {
        try {
            const doubtRef = doc(db, "doubts", doubtId);
            const doubSnapshot = await getDoc(doubtRef);
            if (doubSnapshot.exists()) {
                const currentData = doubSnapshot.data();
                const updatedReplies = currentData.replies || [];
                updatedReplies.push({
                    authorName: currentUser.name,
                    text: text,
                    attachmentData: fileData,
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
                });

                await updateDoc(doubtRef, { replies: updatedReplies });
                alert("Reply posted.");
                renderDoubtsList();
            }
        } catch (err) {
            console.error("Reply Error:", err);
            alert("Failed to post reply.");
        }
    };

    if (file && file.size < 900000) {
        const reader = new FileReader();
        reader.onload = e => saveReply(e.target.result);
        reader.readAsDataURL(file);
    } else if (file) {
        alert("File too large.");
    } else {
        saveReply(null);
    }
}

async function deleteDoubt(doubtId) {
    if (!confirm("Permanently delete this discussion?")) return;
    try {
        await deleteDoc(doc(db, "doubts", doubtId));
        renderDoubtsList();
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to delete.");
    }
}

async function deleteReply(doubtId, replyIndex) {
    if (!confirm("Delete this reply?")) return;
    try {
        const doubtRef = doc(db, "doubts", doubtId);
        const snapshot = await getDoc(doubtRef);
        if (snapshot.exists()) {
            const data = snapshot.data();
            const updatedReplies = [...data.replies];
            updatedReplies.splice(replyIndex, 1);
            await updateDoc(doubtRef, { replies: updatedReplies });
            renderDoubtsList();
        }
    } catch (err) {
        console.error("Delete Reply Error:", err);
        alert("Failed to delete reply.");
    }
}


// --- ADMIN ---

async function renderAdminTable() {
    const tbody = document.getElementById('admin-user-table');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading Registry...</td></tr>';

    try {
        const q = query(collection(db, "users")/*, orderBy("id")*/); // Sort later
        const loadSnap = await getDocs(q);
        const users = [];
        loadSnap.forEach(d => users.push(d.data()));

        // Filter and Sort
        users.sort((a, b) => a.id.localeCompare(b.id));

        tbody.innerHTML = '';
        users.filter(u => u.role !== 'admin' && !u.hidden).forEach(u => {
            const tr = document.createElement('tr');
            let imgTag = `<div class="admin-profile-pic">?</div>`;
            // If profilePic string is huge base64, might lag table.
            // Usually profile pics are thumbnails.
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
                        <button class="action-btn" onclick="resetUserPassword('${u.id}')" title="Reset Password"><i class="fas fa-key"></i> Pass</button>
                        <button class="action-btn" style="background:#ff9f1c;" onclick="resetPersonalDetails('${u.id}')" title="Reset Profile"><i class="fas fa-user-edit"></i> Profile</button>
                    </div>
                </td>
             `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Admin Load Error:", err);
    }
}

async function resetUserPassword(userId) {
    if (!confirm(`Reset password for ${userId} to default?`)) return;
    try {
        await updateDoc(doc(db, "users", userId), {
            pass: DEFAULT_PASSWORD,
            isFirstLogin: true
        });
        alert(`Password reset for ${userId}.`);
    } catch (err) { console.error(err); alert("Failed."); }
}

async function resetPersonalDetails(userId) {
    if (!confirm(`Reset personal details for ${userId}?`)) return;
    try {
        // We might need to fetch role first to reset name properly
        const snap = await getDoc(doc(db, "users", userId));
        const u = snap.data();

        await updateDoc(doc(db, "users", userId), {
            detailsSubmitted: false,
            isFirstLogin: true,
            pass: DEFAULT_PASSWORD,
            name: u.role === 'cr' ? `CR ${u.subject || ''}` : `Student ${userId.slice(-3)}`,
            age: '',
            phone: '',
            profilePic: ''
        });
        renderAdminTable();
        alert("Reset successful.");
    } catch (err) { console.error(err); alert("Failed."); }
}


// --- UTILITY ---
function openImageModal(imgSrc) {
    const modal = document.getElementById('file-viewer-modal');
    const body = document.getElementById('modal-body');
    if (modal && body) {
        body.innerHTML = `<img src="${imgSrc}" oncontextmenu="return false;" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain;">`;
        modal.classList.remove('hidden');
    }
}

function startClock() {
    setInterval(() => {
        const el = document.getElementById('clock');
        if (el) el.innerText = new Date().toLocaleTimeString();
    }, 1000);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function closeFileViewer() {
    const modal = document.getElementById('file-viewer-modal');
    if (modal) {
        modal.classList.add('hidden');
        const body = document.getElementById('modal-body');
        if (body) body.innerHTML = ''; // Stop video playback etc
    }
}

function selectRole(role) {
    const buttons = document.querySelectorAll('.role-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Use slightly loose selector or attribute selector
    const target = document.querySelector(`.role-btn[onclick="selectRole('${role}')"]`)
        || document.querySelector(`.role-btn[data-role="${role}"]`);
    if (target) target.classList.add('active');

    const title = document.getElementById('login-title');
    const input = document.getElementById('login-id');
    const msg = document.getElementById('login-msg');

    if (title && input) {
        if (role === 'student') {
            title.innerText = 'Student Login';
            input.placeholder = 'Enter USN';
        } else {
            title.innerText = 'CR Login';
            input.placeholder = 'Enter ID';
        }
    }
    if (msg) msg.innerText = "";
}

function showForgotPasswordMsg() {
    alert("Please contact your Class Representative (CR) or System Administrator to reset your password.");
}

// Global Function Exports (Connect Module to Window)
window.login = login;
window.logout = logout;
window.showSection = showSection;
window.openSubject = openSubject;
window.switchTab = switchTab;
window.viewFile = viewFile;
window.handleUpload = handleUpload; // Form submit attached via Listener, but good to have
window.toggleSidebar = toggleSidebar;
window.triggerProfileUpload = () => document.getElementById('profile-upload-input').click();
window.handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Compress or ensure small size
    if (file.size > 500000) { alert("Profile pic too large."); return; }

    const reader = new FileReader();
    reader.onload = async function (event) {
        const base64 = event.target.result;
        try {
            await updateDoc(doc(db, "users", currentUser.id), { profilePic: base64 });
            currentUser.profilePic = base64;
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser)); // Update local session
            document.getElementById('profile-img-preview').src = base64;
            document.getElementById('profile-img-preview').classList.remove('hidden');
            document.getElementById('profile-initials').classList.add('hidden');
        } catch (err) { console.error(err); }
    };
    reader.readAsDataURL(file);
};
window.deleteContent = deleteContent;
window.deleteDoubt = deleteDoubt;
window.deleteReply = deleteReply;
window.resetUserPassword = resetUserPassword;
window.resetPersonalDetails = resetPersonalDetails;
window.postReply = postReply;
window.openImageModal = openImageModal;
window.closeFileViewer = closeFileViewer;
window.selectRole = selectRole;
window.showForgotPasswordMsg = showForgotPasswordMsg;

// Initialization Logic
// Initialization Logic
// Debug: Show we started
const loadingMsg = document.createElement('div');
loadingMsg.id = 'debug-loading';
loadingMsg.style.color = 'white';
loadingMsg.style.position = 'fixed';
loadingMsg.style.bottom = '10px';
loadingMsg.style.right = '10px';
loadingMsg.innerText = 'System Initializing...';
document.body.appendChild(loadingMsg);

setTimeout(() => {
    initializeAppWithConfig().then(success => {
        if (document.getElementById('debug-loading')) document.getElementById('debug-loading').remove();

        if (!success) return;

        // 1. Check Session
        const savedSession = localStorage.getItem(DB_KEYS.SESSION);
        if (savedSession) {
            currentUser = JSON.parse(savedSession);
            checkAndSeedDatabase().then(() => {
                initDashboard();
            }).catch(e => alert("Init Error: " + e));
        } else {
            // No session -> Show Login
            renderLoginView();
            checkAndSeedDatabase();
        }
    });
}, 500);

function renderLoginView() {
    const template = document.getElementById('view-login');
    const clone = template.content.cloneNode(true);
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '';
        app.appendChild(clone);

        // Setup Listener
        const form = document.getElementById('login-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                login();
            };
        }
    }
}
window.renderLoginView = renderLoginView;

// (Moved to top)
