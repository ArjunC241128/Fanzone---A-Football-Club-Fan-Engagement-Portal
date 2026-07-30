# ⚽ FanZone – Football Club Fan Engagement Portal
FanZone provides a complete digital platform that connects football clubs with their supporters. Visitors can browse public pages such as Home, About, Contact, fixtures, and latest news before creating an account. Registered users can securely log in, update their profiles, book or RSVP for matches, view player information, submit ratings and reviews, and communicate with the AI chatbot. Administrators have access to a dedicated dashboard where they can create, update, delete, and manage matches, players, news, bookings, reviews, and users. The project also includes advanced features such as live match tracking, powerful search and filtering, responsive design, and secure role-based authorization. These features make FanZone an interactive, user-friendly, and efficient football club management and fan engagement system.
## 🌟 Key Features


### 👥 Fan Features

- User Registration & Secure Login (Firebase Authentication)
- Browse Upcoming & Live Football Matches
- View Match Fixtures, Results, and Venues
- Explore Club Players and Squad Information
- Read Latest Club News
- AI-Powered Football Chatbot (OpenAI API)
- Book Match Tickets
- Submit Reviews & Feedback
- Vote in Fan Polls
- Responsive UI
## 🛠️ Admin Features

- 🔐 Secure Admin Authentication
- 📊 Admin Dashboard
- ⚽ Add, Update, and Delete Match Information (CRUD)
- 👥 Manage Player Profiles (CRUD)
- 📰 Publish, Edit, and Delete News Articles
- 🎟️ View and Manage Ticket Bookings
- ⭐ Monitor User Reviews and Feedback
- 🔴 Update Live Match Status
- 🗄️ Manage MongoDB Database Records
- 🤖 AI Chat History Management
- 🛡️ Role-based Access Control
- 📈 Dashboard Analytics and Statistics
## 💻 Tech Stack & Technologies Used

| Category | Technology |
|-----------|------------|
| Frontend | React.js, React Router DOM |
| Styling | Tailwind CSS, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | Firebase Authentication |
| AI | OpenAI API |
| Build Tool | Vite |
| Deployment | Vercel, Render |
## 📂 Project Structure

```text
FANZONE/
├── public/
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── stadium-hero.webp
│   ├── Backend/
│   │   ├── models/
│   │   │   └── thread.js
│   │   ├── routes/
│   │   │   └── chat.js
│   │   ├── utils/
│   │   │   └── openai.js
│   │   ├── .env
│   │   ├── server.js
│   │   └── Fanzonedata.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── MatchCard.jsx
│   │   ├── News.jsx
│   │   ├── NewsCard.jsx
│   │   ├── PlayerCard.jsx
│   │   ├── PollWidget.jsx
│   │   ├── AuthProvider.jsx
│   │   ├── AuthContext.jsx
│   │   └── firebase.init.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md

Live Project Link
https://fanzone-frontend-075a.onrender.com
