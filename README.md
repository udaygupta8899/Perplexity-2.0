# Perplexity‑2.0

A Perplexity AI–inspired conversational search assistant built with FastAPI (backend) and vanilla HTML/CSS/JS (frontend).

---

## 🌐 Live Demo

- **Frontend (Netlify):** [https://adorable-pony-bb7521.netlify.app/]  
- **Backend API (Render):** [YOUR_RENDER_URL]  

---

## 🚀 Features

- Natural-language search interface powered by vanilla JavaScript  
- Stateful conversation flow  
- **Backend**: FastAPI with async support, containerized via Docker  
- **Frontend**: Clean HTML/CSS/JS, deployed on Netlify  
- **Deployment**: Backend on Render, frontend on Netlify  

---

## 📁 Project Structure

```

/
├── backend/           # FastAPI backend
│   ├── Dockerfile
│   └── app/
│       ├── main.py
│       └── ... (routes, models, utils)
├── frontend/          # Static HTML/CSS/JS
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .gitignore
└── README.md

````

---

## 🧰 Prerequisites

- **Backend**:
  - Python 3.10+  
  - Docker (for local dev)  
- **Frontend**:
  - No build tools—static files only  
- **Deployment**:
  - Render account (for backend)  
  - Netlify account (for frontend)

---

## 🧪 Local Development

### Backend (FastAPI)

```bash
git clone https://github.com/udaygupta8899/Perplexity-2.0.git
cd Perplexity-2.0/backend

# Build and run via Docker
docker build -t perplexity-backend .
docker run -p 8000:8000 perplexity-backend
````

Your FastAPI server will be available at `http://localhost:8000`.

---

### Frontend (HTML/CSS/JS)

```bash
cd ../frontend
# No install needed—just open `index.html` in a browser,
# or serve it with a simple HTTP server:
python3 -m http.server 3000
```

Your frontend will be available at `http://localhost:3000`.

> ⚠️ Ensure `script.js` points to your backend (e.g., `http://localhost:8000`) during local development.

---

## ✨ Deployment

### ✅ Backend on Render

1. Connect your GitHub repo.
2. Choose `backend/` as the service root.
3. Use Dockerfile for build and run.
4. Set ENV variables as needed (e.g. API keys, CORS origins).

### ✅ Frontend on Netlify

1. Connect repo and use `frontend/` as publish directory.
2. Set Build command: *(none required)*
3. Set Publish directory: `frontend/`
4. Add any needed environment variables (e.g., API URL).

---

## 🧩 Tech Stack

* **Backend**: FastAPI + Python (async, dependency injection)
* **Frontend**: Vanilla HTML, CSS, and JavaScript
* **Styling**: Your custom CSS or framework of choice
* **Containerization**: Docker
* **Deployments**: Render (backend) & Netlify (frontend)

---

## 🛠️ Customization

* Backend: edit `backend/app/main.py` and related modules
* Frontend: customize `index.html`, `styles.css`, `script.js`
* To add features (context memory, richer UI):

  * Extend FastAPI routes or integrate databases
  * Enhance UI with components or interactive elements

---

## ✅ Contributing

1. Fork this repo
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes (`git commit -m "Add feature"`)
4. Push the branch and open a Pull Request

---

## 📝 License

This project is released under the **MIT License** — see `LICENSE` for details.

---

## 🙏 Acknowledgments

* Inspired by **Perplexity AI**'s conversational search UI
* Powered by **FastAPI**, **Docker**, **Netlify**, **Render**, and plain JavaScript

---