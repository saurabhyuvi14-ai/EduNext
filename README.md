# EduNext - Smart Academic Portal

EduNext is a comprehensive, web-based academic management platform designed to streamline interaction between students, Class Representatives (CRs), and administrators ("Boss"). It features a modern, responsive interface for sharing study materials, resolving academic doubts, and managing user profiles.

## 🚀 Key Features

### 1. Role-Based Access Control
- **Student**:
  - Access academic materials by subject (Maths, Physics, SNW, PSP).
  - Post doubts/queries with **image attachments**.
  - View replies and solutions from CRs.
  - Delete their own doubts.
- **Class Representative (CR)**:
  - **Subject-Specific Management**: Upload and manage content only for their assigned subject.
  - **Content Control**: Upload documents, images, or links. Delete any content within their subject.
  - **Doubt Resolution**: View and reply to doubts specifically for their subject.
  - **Rich Replies**: Attach files or images to replies.
  - **Moderation**: Delete any doubt in their subject or their own replies.
- **Boss (System Controller)**:
  - Centralized dashboard for system oversight.
  - **User Registry**: View all registered users (Students/CRs).
  - **User Management**: Reset passwords or personal details for any user.
  - Simplified "Boss" interface for quick administrative actions.

### 2. Academic Content Hub
- **Categorized Resources**: Materials, Assignments, Practice Questions, Contests.
- **Universal Viewer**: Built-in modal to view Images and PDFs directly without downloading.
- **Secure Handling**: Prevention of unauthorized downloads/interactions where applicable.

### 3. Advanced Doubt System
- **Interactive Threads**: Discussion-style doubt resolution.
- **Media Support**: 
  - Students can attach images to doubts.
  - CRs can attach images or documents (PDF/Doc) to their replies.
- **Full Moderation**: comprehensive delete permissions for authors and moderators.

### 4. Modern UI/UX
- **Glassmorphism Design**: Sleek, translucent panels with blurry backgrounds.
- **Responsive Layout**: Optimized for both desktop and mobile devices.
- **Dynamic Interactions**: Real-time DOM updates, toast notifications, and smooth transitions.
- **Tech Trivia**: Fun daily tech facts on the dashboard.

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3 (Custom Properties, Flexbox, Grid), JavaScript (ES6+).
- **Data Persistence**: LocalStorage (Browser-based NoSQL database simulation).
- **Icons**: FontAwesome 5.15.4.
- **Fonts**: Google Fonts (Poppins).

## 📥 Installation & Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/saurabhyuvi14-ai/EduNext.git
   ```
2. **Navigate to the directory**:
   ```bash
   cd EduNext
   ```
3. **Launch the Portal**:
   - Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
   - No backend server or database setup is required.

## 🔑 Default Credentials
The system comes pre-seeded with a default set of users and a main controller.

### System Controller (Boss)
- **ID**: `14607688`
- **Password**: `NST@123`

### Students & CRs
- **User IDs**: Generated based on USNs (e.g., `2102508701` to `2102508825`).
- **Default Password**: `NST@123`
- *Note: Users are prompted to change their password upon first login.*

## 📱 Usage Guide
1. **Login**: Use the credentials above to log in.
2. **Dashboard**: 
   - **Home**: View welcome message and tech facts. (For Boss: View Registry).
   - **Academics**: Browse subjects and view/download materials.
   - **Doubts**: Ask questions or help others (if CR).
   - **Manage Content (CR only)**: Upload new resources.
3. **Profile**: Click the camera icon on the sidebar to update your profile picture.

## 🤝 Contributing
1. Fork the repository.
2. Create feature branch (`git checkout -b feature/NewFeature`).
3. Commit changes (`git commit -m 'Add NewFeature'`).
4. Push to branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---
*Built with ❤️ for improved academic collaboration.*
