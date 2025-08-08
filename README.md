# Kivu Back-End

## 🌍 About This Project
This is the **server-side system** for the **Ibirwa Kivu Bike Tours platform**.  
It works hand-in-hand with the website to:
- Store and manage **tour information**, **bookings**, and **user details**.
- Allow **admins** to add and update content.
- Let customers **browse tours**, **check details**, and **book online**.

The front-end (what visitors see) is here: [ibirwa-kivu-bike-tours.netlify.app](https://ibirwa-kivu-bike-tours.netlify.app/)  
The back-end (this repository) powers the data and booking system.

---

## 🎯 Purpose
The goal of this back-end is to:
- Handle all requests from the front-end.
- Store information safely in a database.
- Allow secure logins for admins.
- Keep bookings and tour details up to date.

---

## 🔑 How Authentication Works
Some actions (like adding or updating tours) are for **admins only**.  
- **Admins** log in with a username and password.
- After logging in, they can manage tours and see bookings.
- Public visitors don’t need to log in — they can just view tours and make bookings.

---

## 🔗 API Usage Flows

### **1. Viewing Tours**
- Visitors open the front-end website.
- The site asks this back-end for a list of tours.
- Back-end sends the list, and the site displays it.

### **2. Booking a Tour**
- Visitor chooses a tour and submits booking details.
- Back-end stores the booking in the database.
- Admin can later check the booking and confirm it.

### **3. Admin Management**
- Admin logs in.
- They can:
  - Add a new tour.
  - Edit tour details.
  - Remove a tour.
  - View all bookings.

---

## 📍 Endpoints (Simplified)

| Method | Endpoint | What it Does | Who Can Use It |
|--------|----------|--------------|----------------|
| GET    | `/api/tours` | Get all tours | Anyone |
| GET    | `/api/tours/:id` | Get details for one tour | Anyone |
| POST   | `/api/tours` | Add a new tour | Admin only |
| PUT    | `/api/tours/:id` | Update a tour | Admin only |
| DELETE | `/api/tours/:id` | Delete a tour | Admin only |
| POST   | `/api/bookings` | Make a booking | Anyone |
| GET    | `/api/bookings` | See all bookings | Admin only |
| POST   | `/api/auth/login` | Admin login | Admin only |

---

## 🐞 Current Limitations
- Tour images must be uploaded in the correct format.
- No built-in notification system yet (email/SMS coming soon).
- Bookings are not auto-confirmed — admin must review them.

---

## 🚀 How to Use Locally (For Developers)
```bash
# 1. Clone this repository
git clone https://github.com/habyarimanacaleb/Kivu-back-end.git

# 2. Go into the folder
cd Kivu-back-end

# 3. Install the needed packages
npm install

# 4. Create a file called .env and add:
PORT=5000
MONGO_URI=your_database_link
JWT_SECRET=your_secret_key

# 5. Start the server
npm run dev

---
## 📊 System Flow Diagram
flowchart TD
    A[Visitor Opens Website] --> B[Front-End Requests Data]
    B --> C[Back-End API]
    C --> D[(Database)]
    C -->|If Booking| E[Store Booking]
    C -->|If Admin Login| F[Verify Credentials]
    F -->|Success| G[Admin Dashboard]
    G --> H[Manage Tours & View Bookings]
    D --> B


---

##📈 Version
1.0.0 – First release with:

- Tour management

- Booking system

- Admin login

---

## 🤝 Contribution
If you want to improve this project:

1. Fork this repo.

2. Make your changes.

3. Create a pull request.

## 📜 License
Project MIT License.

You can just **copy-paste** this into your project’s `README.md` file and commit it to GitHub.  





