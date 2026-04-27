# MediSync

MediSync is a comprehensive digital health and clinical management portal. It connects patients with doctors, offering a seamless experience for finding practitioners, booking appointments, managing medical records, and handling payments. The platform supports three primary roles: **Patients**, **Doctors**, and **Administrators**.

## Project Structure

This is a full-stack application organized as a monorepo:

- `/frontend` - A React/Vite web application providing the user interface for all roles.
- `/backend` - A Node.js/Express API serving the frontend and managing the MongoDB database.

## Quick Start (Development)

To run the entire application (both frontend and backend) simultaneously from the root directory:

1. **Install Root Dependencies**:
   ```bash
   npm install
   ```

2. **Install All Project Dependencies** (runs install in root, frontend, and backend):
   ```bash
   npm run install-all
   ```

3. **Set Up Environment Variables**:
   Ensure you have a `.env` file in the `/backend` directory containing the necessary keys (like `MONGO_URI`, `JWT_SECRET`, etc.).

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   This uses `concurrently` to launch both the backend server (on port 5000) and the Vite frontend (on port 5173/5174).

## Deployment
For deployment, the frontend and backend should be built and hosted independently or served through the Node backend in production mode. See the respective `README.md` files in the `/frontend` and `/backend` directories for specific deployment instructions.
