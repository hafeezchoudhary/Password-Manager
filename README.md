# 🔐 Password Manager Web Application

A **secure web application** for storing, managing, and retrieving passwords safely. Built with **Next.js**, **Tailwind CSS**, **MongoDB**, and **Node.js**, this project combines **security**, **usability**, and a **responsive interface**.  

---

## ✨ Features
- 🔒 **Encrypted password storage** for maximum security  
- 👤 **User authentication** to protect data  
- 📊 **Responsive dashboard** for easy password management  
- ➕✏️❌ Ability to **add, edit, delete, and search** passwords  
- 🖥️ Clean and **intuitive interface** for smooth navigation  

---

## 🛠 Technologies Used
- ⚛️ **Next.js** – Frontend & backend framework  
- 🎨 **Tailwind CSS** – Styling & responsive design  
- 🗄️ **MongoDB** – Database for storing credentials  
- 🟢 **Node.js** – Backend server and API  
- 💻 **JavaScript** – Core logic and interactivity  

---

## 🚀 Installation
1. **Clone the repository**:  
```bash
git clone https://github.com/your-username/password-manager.git
cd password-manager
````

2. **Install dependencies**:

```bash
npm install
```

3. **Create a `.env` file** in the root directory and add:

```
MONGO_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
```

4. **Run the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📌 Usage

* 📝 Register a new user and log in
* ➕ Add new passwords with title, username, and password
* ✏️ Edit or ❌ Delete existing passwords
* 🔍 Search passwords using the built-in search feature

---

## 🔐 Security

* 🔑 All passwords are **encrypted** before storing
* 👮 Authentication ensures only authorized users access data
* ⚠️ Sensitive data in `.env` should **never be committed** to GitHub
