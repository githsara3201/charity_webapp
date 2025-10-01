Charity Elite 🎉

A full-stack web application for managing and showcasing charity events. The platform allows organizations to host events, track fundraising progress, and help users discover events by category, search, and suggestions.

🚀 Features

Browse all upcoming and past charity events

Search events by keywords

Get event suggestions

View event details (with categories and organizers)

Track fundraising progress (goal_amount vs progress_amount)

Categories and organization management

🛠 Tech Stack

Frontend: Plain HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: MySQL

Hosting: VPS (frontend + backend + database)

📂 Project Structure
charity-elite/
│
├── charity-elite-client/     # Frontend (static HTML, CSS, JS)
├── charity-elite-api/        # Backend (Express.js + MySQL)
│   ├── controllers/          # Event and category controllers
│   ├── routes/               # Express routes
│   ├── config/               # Database connection
│   └── server.js             # Main server entry
└── Dump20251001.sql          # MySQL DB dump

🗄 Database Schema
categories

category_id INT (PK, AUTO_INCREMENT)

name VARCHAR(50)

events

event_id INT (PK, AUTO_INCREMENT)

org_id INT (FK → organizations.org_id)

category_id INT (FK → categories.category_id)

name VARCHAR(100)

description TEXT

event_date DATE

location VARCHAR(100)

goal_amount DECIMAL(10,2)

progress_amount DECIMAL(10,2)

status ENUM('upcoming','past','suspended')

image_url VARCHAR(255)

organizations

org_id INT (PK, AUTO_INCREMENT)

name VARCHAR(100)

description TEXT

contact_email VARCHAR(100)

contact_phone VARCHAR(20)

📡 API Endpoints
Method	Endpoint	Description
GET	/events	Get all events
GET	/events/:id	Get event by ID
GET	/events/suggest	Get event suggestions
GET	/events/search	Search events by query
GET	/event-ids	Get list of event IDs
GET	/categories	Get all categories
⚙️ Installation & Setup
1. Clone the repo
git clone https://github.com/your-username/charity-elite.git
cd charity-elite

2. Import the database
mysql -u root -p charityevents_db < Dump20251001.sql

3. Configure environment variables

Create a .env file inside charity-elite-api/ with:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=charityevents_db
PORT=5000

4. Install dependencies & run backend
cd charity-elite-api
npm install
npm run dev

5. Serve frontend

Place charity-elite-client in your web server root (e.g., /www/wwwroot/charity-elite-client).

Or run locally:

npx serve charity-elite-client -l 3000


Now visit:

Frontend → http://localhost:3000

Backend API → http://localhost:5000/api

🤝 Contributing

Fork the repository

Create a new feature branch (git checkout -b feature-xyz)

Commit your changes (git commit -m "Added xyz feature")

Push to branch (git push origin feature-xyz)

Create a Pull Request
