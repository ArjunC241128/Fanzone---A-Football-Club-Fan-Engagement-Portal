⚽ FanZone – Football Club Fan Engagement Portal
🌟 Key Features
👥 Fan Features
User Registration & Secure Login (Firebase Authentication)
Browse Upcoming & Live Football Matches
View Match Fixtures, Results, and Venues
Explore Club Players and Squad Information
Read Latest Club News and Announcements
AI-Powered Football Chatbot (OpenAI API)
Book Match Tickets Online
Submit Reviews and Feedback
Vote in Fan Polls
Responsive UI for Desktop and Mobile Devices
Protected User Dashboard
Real-time Match Status Display
Interactive Football Club Experience
🛠️ Admin Features
Secure Admin Authentication
Admin Dashboard Overview
Add, Update and Delete Match Information (CRUD)
Manage Club News Articles
Manage Player Profiles
View Ticket Bookings
Manage User Reviews and Feedback
Control Live Match Status
Manage Database Records using MongoDB
AI Chat History Management
Role-based Route Protection
💻 Tech Stack & Technologies Used
Category	Technologies
Frontend	React.js, React Router DOM
Styling	Tailwind CSS, CSS3
Backend	Node.js, Express.js
Database	MongoDB Atlas, Mongoose
Authentication	Firebase Authentication
AI Integration	OpenAI API
HTTP Client	Fetch API
State Management	React Context API
Environment Variables	dotenv
Build Tool	Vite
Version Control	Git & GitHub
Deployment	Vercel (Frontend), Render (Backend)
Programming Language	JavaScript (ES6+)
📁 Project Structure
FANZONE/
├── public/                                 # Static assets
│   └── icons.svg

├── src/
│
├── assets/                                 # Images & media files
│   └── stadium-hero.webp
│
├── Backend/                                # Node.js Express Backend
│   ├── models/
│   │   └── thread.js                       # Chat history schema
│   │
│   ├── routes/
│   │   └── chat.js                         # AI chatbot API routes
│   │
│   ├── utils/
│   │   └── openai.js                       # OpenAI configuration
│   │
│   ├── .env                               # Environment variables
│   ├── Fanzonedata.js                     # Sample backend data
│   └── server.js                          # Express server & API
│
├── components/                             # React Components
│   ├── AuthContext.jsx                    # Authentication context
│   ├── AuthProvider.jsx                   # Context provider
│   ├── Crest.jsx                          # Club logo component
│   ├── FixtureCard.jsx                    # Match fixture card
│   ├── Footer.jsx                         # Website footer
│   ├── Login.jsx                          # User login page
│   ├── MatchCard.jsx                      # Match display component
│   ├── Navbar.jsx                         # Navigation bar
│   ├── News.jsx                           # News section
│   ├── NewsCard.jsx                       # News card component
│   ├── PlayerCard.jsx                     # Player profile card
│   ├── PollWidget.jsx                     # Fan voting widget
│   ├── firebase.init.js                   # Firebase configuration
│   └── fanzoneData.js                     # Frontend sample data
│
├── App.jsx                                # Main application routes
├── main.jsx                               # React entry point
├── package.json                           # Project dependencies
├── vite.config.js                         # Vite configuration
└── README.md                              # Project documentation
⚙️ System Modules
🏠 Home
Hero Banner
Upcoming Matches
Live Match Updates
Club Statistics
⚽ Fixtures
Upcoming Fixtures
Match Schedule
Venue Information
👨‍👩‍👧 Players
Player Profiles
Jersey Number
Position
Team Information
📰 News
Latest Football News
Club Announcements
Match Reports
🎟 Ticket Booking
Book Match Tickets
Booking Confirmation
View Booked Matches
💬 AI Chatbot
Football-related Questions
Club Information
Match Assistance
OpenAI Integration
📊 Poll & Feedback
Fan Voting
Match Feedback
Club Reviews
🔐 Authentication
User Login
User Registration
Protected Routes
Firebase Authentication
🛠 Admin Dashboard
Manage Matches
Manage Players
Manage News
View Bookings
Manage Reviews
🗄️ Database Collections
Users
Matches
Players
News
Bookings
Reviews
Threads (AI Chat History)
🔄 Project Workflow
User
   │
   ▼
React Frontend
   │
   ▼
Express REST API
   │
   ▼
MongoDB Atlas Database
   │
   ▼
OpenAI API (Chatbot)
🚀 Future Improvements
Live Score Integration using WebSocket/Socket.IO
Online Payment Gateway Integration
Push Notifications
Email Notifications
Match Highlight Videos
Favorite Team & Player Feature
Dark Mode Support
Advanced Search & Filters
Match Statistics Dashboard
Multi-language Support
PWA (Progressive Web App)
QR Code Based Ticket Verification
📌 Project Highlights
Modern Responsive User Interface
AI-Powered Football Assistant
Secure Firebase Authentication
RESTful API Architecture
MongoDB Atlas Cloud Database
Admin Dashboard with CRUD Operations
Fan Poll & Review System
Online Match Ticket Booking
OpenAI API Integration
Built using React, Express, MongoDB, and Tailwind CSS (MERN Stack)
Live Project Link
https://fanzone-frontend-075a.onrender.com
