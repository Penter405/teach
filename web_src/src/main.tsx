import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadCourseData } from './courseData';

// Load course data at runtime (no build needed for data.json changes),
// then render the app once data is available.
const root = document.getElementById('root')!;

loadCourseData()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((err) => {
    console.error('Failed to load course data:', err);
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#64748b;">
        <div style="text-align:center">
          <p style="font-size:1.5rem;font-weight:bold;margin-bottom:0.5rem">⚠️ Failed to load course data</p>
          <p style="font-size:0.875rem">${err.message}</p>
        </div>
      </div>
    `;
  });
