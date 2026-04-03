# Development Documentation

Welcome to the Cipher Slate development guide. This document maps out the system architecture and folder structures, empowering contributors to seamlessly extend the "Guided Synthesist" web application.

## Directory Structure

Here is a breakdown of what exactly each folder and core file is responsible for within `cipher_slate`:

### `/web_src` (React Application Core)
The primary folder for the web application codebase, keeping the root directory clean.
- **`/web_src/src/App.tsx`**: The main entry point routing between the Login, Learning Path (Dashboard), and specific Lesson views.
- **`/web_src/src/courseData.ts`**: The Unified Data Layer. This parses our structured Python curriculum JSON and maps it into strictly typed TypeScript formats consumed by the components.
- **`/web_src/src/Sidebar.tsx`**: Renders the collapsible Module & Lesson navigation on the left pane.
- **`/web_src/src/LessonContent.tsx`**: Our core rendering engine. It takes parsed JSON arrays (paragraphs, headings, Python code snippets, and SVG diagrams) and translates them into styled Tailwind elements.
- **`/web_src/src/index.css`**: Global design settings, mapping the Tailwind layers.

### `/docs` (Production Delivery Layer)
The output destination folder configured inside `vite.config.ts`.
- **`index.html`**: The static entry webpage pointing to our compiled React Javascript.
- **`/assets/`**: Contains obfuscated, bundled JavaScript and CSS output after running `npm run build`. Nothing in here should be modified manually.
*(Note: To meet Github Pages standards natively, `docs/` serves as the standalone public folder.)*

### `/python_course` (Legacy / Source Data)
Contains the original static SPA implementation and the foundational curriculum metadata (`data.json`) that drives the entirety of `/src/courseData.ts`. It acts purely as a semantic data reservoir moving forward.

### Root Configs
- **`vite.config.ts`**: Handles routing rules and directs the compiler to push results directly into the `/docs/` environment using relative paths (`base: './'`).
- **`package.json`**: Dependencies ranging from `lucide-react` directly to `motion`.
- **`DESIGN.md`**: Aesthetic manifesto outlining "The Guided Synthesist" design philosophy—covering precise tones, shadows, and interactive logic constraints.

## Extending Lessons
If you want to add new lessons, simply update `python_course/data.json`. The React map component reads this data natively, and the dashboard will automatically regenerate to include new endpoints.
