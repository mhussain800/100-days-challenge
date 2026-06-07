# 100 Days Challenge Ledger 📜

A sophisticated, minimalist habit and spiritual tracking application designed with a high-end, tactile vintage paper ledger aesthetic. Built for modern performance with a focused, academic feel.

---

## ✨ Features

### 🎨 Design & Aesthetic
* **Vintage Ledger Theme:** A premium design language featuring a textured off-white cream paper background (`#fdfbf7`) paired with a sharp, elegant charcoal black ink (`#2c2b2a`).
* **Academic Typography:** Beautiful integration of **Instrument Serif** for deep, classic headings and **JetBrains Mono** for precise, data-focused tracking text.
* **Micro-Layouts:** Smooth, ultra-compact custom scrollbars and transparent input fields that mimic writing directly on fine stationery.

### 🕋 Tracking Modules
* **Spiritual Accountability:** Log daily routines including prayers (Fajar, Zuhar, Asar, Maghrib, Isha) with dedicated tracking locations (e.g., Masjid or Ghar), Quran recitation, Tafseer, and Dhikr.
* **Routine & Habits:** Track critical daily check-offs such as waking up early (4:30 AM), sleeping early (10:00 PM), and making your bed.
* **Smart Fields:** Interactive dynamic task components (like the **Sleep Tracker**) that morph seamlessly into numerical inputs once checked, allowing you to record exact data points (e.g., hours slept).
* **Health & Vitality:** Dedicated segments to log physical activities like walking, running, gym sessions, and hitting protein targets.

### ⚙️ Technical Core
* **Cloud Database Architecture:** Fully powered by **Google Cloud Firestore (NoSQL)** for lightning-fast, document-based cloud storage localized in the `asia-south1` (Mumbai) region for optimal performance.
* **Optimistic UI Engine:** Checkboxes and inputs update instantly on the screen while silently syncing to the cloud database in the background, ensuring zero lag.
* **Real-time Live Syncing:** Data seamlessly syncs across multiple devices, meaning entries made on a desktop immediately reflect on your mobile device.

### 🔐 Security & Continuity
* **Firebase Authentication:** Secure email and password user gates keeping personal tracking data completely isolated and private.
* **Persistent Login Architecture:** Utilizes `browserLocalPersistence` strategy to ensure you stay securely logged in, completely bypassing the login screen upon re-opening the application.
* **Personalized Onboarding:** Native conditional checking fields that welcome users individually once they establish their ledger profiles.

### 📱 Mobile Optimization & PWA
* **Progressive Web App (PWA):** Fully installable directly onto mobile home screens natively (via Safari on iOS or Chrome on Android), removing the browser address bar for a completely native look.
* **Responsive Mobile Layouts:** Tailored media-query boundaries that hide heavy text strings on mobile viewports to prioritize strict data visualization.
* **Keyboard Focus Guard:** Intelligently managed inputs that prevent annoying device keyboards from automatically hijacking the view when toggling between the tracker and the analytical dashboard.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite
* **Styling:** Tailwind CSS
* **Database & Auth:** Google Firebase (Firestore, Firebase Auth)
* **Icons:** Lucide React
* **Deployment:** Vercel
