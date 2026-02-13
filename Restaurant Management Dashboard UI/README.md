
  # Restaurant Management Dashboard UI

  This is a code bundle for Restaurant Management Dashboard UI. The original project is available at https://www.figma.com/design/qJcflr3K9Mg68YBEZ4vGva/Restaurant-Management-Dashboard-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend (Flask)

  The backend lives in `backend/` and uses SQLite.

  Create a virtualenv and install backend deps:

  - Windows PowerShell:
    - `python -m venv .venv`
    - `.\.venv\Scripts\Activate.ps1`
    - `pip install -r backend/requirements.txt`

  Seed sample data (menu/offers/tables/notifications):

  - `python -m backend.seed`

  Run the backend:

  - `python -m backend.app`

  Notes:
  - On startup the backend auto-creates tables if missing.
  - Default API base URL is `http://127.0.0.1:5000`.
  