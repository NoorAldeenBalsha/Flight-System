# ✈️ Flight Booking & Management System

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=render)](https://flight-system-1.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A comprehensive, scalable flight booking and reservation platform built as a graduation project. The platform provides automated flight scheduling, seat reservations, user ticket handling, and admin controls with high data integrity and reliability.

🌐 **Live Application:** [flight-system-1.onrender.com](https://flight-system-1.onrender.com/)

---

## 📌 Project Overview

This project was developed to simulate a real-world airline reservation and flight operations engine. It features modular RESTful architecture designed to handle concurrent seat availability, complex booking states, and route planning seamlessly.

---

## 🚀 Key Features

- **Flight Search & Filtering:** Dynamic querying based on departure/arrival locations, dates, price ranges, and cabin classes.
- **Seat Allocation & Booking Engine:** Real-time seat reservation ensuring no double-booking issues.
- **Passenger Management:** Secure passenger credential management, booking history, and ticket statuses.
- **Admin Dashboard:** Administrative panel to schedule flights, manage aircraft layouts, update flight statuses (delayed, on-time, cancelled), and monitor reservations.
- **RESTful API Design:** Clean, modular NestJS architecture separating controllers, services, DTOs, and schemas.

---

## 🛠️ Tech Stack

- **Backend:** NestJS, Node.js, TypeScript
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication & Security:** JWT (JSON Web Tokens), bcrypt
- **Deployment:** Render

---

## 📂 Project Structure

```text
src/
├── auth/           # Authentication modules (login, register, JWT strategies)
├── users/          # User profile and account management
├── flights/        # Flight creation, searching, updates, and scheduling
├── bookings/       # Reservation workflows, seat assignments, and ticketing
├── common/         # Shared guards, decorators, filters, and interceptors
├── main.ts         # Application entry point
└── app.module.ts   # Root module aggregating domain services
```

---

## ⚙️ Getting Started Locally

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/flight-system.git
   cd flight-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flight-db
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1d
   ```

4. **Run the application:**
   ```bash
   # Development mode
   npm run start:dev

   # Production build
   npm run build
   npm run start:prod
   ```

5. **Access the application:**
   - Server runs on: `http://localhost:3000`

---

## 🎓 Academic Context

- **Type:** University Graduation Project
- **Focus:** Backend Engineering, System Architecture & Database Design

---

## 📄 License

This project is licensed under the MIT License - feel free to use and adapt it.