# [WEB_URL](https://penter405.github.io/teach/)
# Cipher Slate: Python Course 

An interactive Python curriculum application built using React, Vite, and Tailwind CSS. The application translates a detailed Python programming PDF into an engaging "Guided Synthesist" interface with progressive learning modules, rich interactive lesson rendering, and code syntax highlighting.

## Getting Started

### Prerequisites
- Node.js (v18+)

### Running Locally
To launch the development server and test local changes:
```bash
cd web_src
npm install
npm run dev
```

### Deployment Build
To generate the production-ready code:
```bash
cd web_src
npm run build
```
This will compile and minify the React application, routing all assets straight into the `docs/` directory for immediate hosting via GitHub Pages.

## Project Structure

```text
teach/
├── api/                  # Vercel serverless functions (backend)
│   ├── chat.js           # Gemini AI Chat endpoint
│   ├── config.js         # Configuration endpoint (e.g., Google OAuth Client ID)
│   ├── login.js          # Google OAuth login endpoint
│   └── _db.js            # Database utility (if applicable)
├── docs/                 # GitHub Pages deployment folder (compiled frontend)
├── python_course/        # Course content definitions
│   └── data.json         # Master course data (JSON format)
├── web_src/              # Frontend React/Vite application source
│   ├── src/              # React components and hooks
│   │   ├── App.tsx       # Main application entry and router
│   │   ├── courseData.ts # Data parsing and course structures
│   │   ├── AIChat.tsx    # AI Chat component
│   │   └── ...           # Other UI components
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Vite configuration
├── README.md             # This file
├── update_course.bat     # auther update his course command
├── vercel.json           # Vercel deployment configuration
└── *.md                  # Design notes and content drafts
```

## Usage
Simply navigate into the `web_src` folder, start the local dev server using `npm run dev` and navigate to `http://localhost:5173`. You can view the curriculum progression map, open individual lessons, and view real-time Python diagrams and callouts.
