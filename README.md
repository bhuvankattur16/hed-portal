# HED Retrieval System

A retrieval system for HED (Health, Education, Development) data.

## Project Structure

- `frontend/`: React application.
- `backend/`: FastAPI application.

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd hed-retrieval-system
```

### 2. Set Up the Backend (FastAPI)

The backend uses Python. You need to create a virtual environment to manage its dependencies.

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **Linux/macOS:**
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up environment variables:
   - Check if there is a `.env.example` file. 
   - Create a `.env` file in the `backend/` directory and add the necessary environment variables (like API keys or database URLs) provided by the repository owner.
6. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend should now be running, typically on `http://localhost:8000`.*

### 3. Set Up the Frontend (React)

Open a **new terminal window** to start the frontend alongside the backend.

1. Navigate to the frontend folder (from the project root):
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `frontend/` directory if required, based on any `.env.example` provided.
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be accessible in your browser, typically on `http://localhost:5173`.*
