# Design System Specification: Editorial Tech-Learning

## 1. Overview & Creative North Star: "The Guided Synthesist"
The Creative North Star for this design system is **"The Guided Synthesist."** This approach bridges the gap between high-level editorial sophistication and the structured logic of programming. Rather than a generic "dashboard" look, the experience should feel like a premium digital publication that has been brought to life with interactive, playful elements.

We break the "template" look through **Intentional Asymmetry**. Hero sections should feature overlapping elements—where code blocks (Tertiary) bleed into whitespace (Surface), and the "Explorer" character peeks from behind containers. This layering suggests depth and discovery, moving away from a flat, static grid.

---

## 2. Colors: Tonal Depth & The No-Line Rule
Our palette utilizes slate blues for authority and vibrant accents for logic.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to create a "ghost" perimeter. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface-container tiers to create "nested" depth:
*   **Base:** `surface` (#f7f9fb)
*   **Sub-sections:** `surface-container-low` (#f1f4f6)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) for a "pop-out" effect.
*   **Navigation/Sidebars:** `surface-container` (#eaeef1) or `surface-container-high` (#e3e9ec).

### The "Glass & Gradient" Rule
To avoid a "flat-UI" fatigue, floating elements (like code tooltips or progress overlays) should use **Glassmorphism**.
*   **Recipe:** `surface-variant` at 60% opacity + 12px `backdrop-blur`.
*   **Signature Textures:** Use subtle linear gradients for CTAs. Transition from `primary` (#575f75) to `primary-container` (#dae2fd) at a 135-degree angle to give buttons a "lithographic" sheen.

---

## 3. Typography: Editorial Logic
We utilize two distinct personalities: **Space Grotesk** for structural impact and **Inter** for functional clarity.

*   **Display & Headlines (Space Grotesk):** These are our "Editorial Voices." Use `display-lg` for hero statements. The wide apertures of Space Grotesk feel tech-forward yet approachable.
*   **Body & Titles (Inter):** Inter handles the heavy lifting of instructional text. Use `title-md` for lesson headers to ensure maximum legibility against code snippets.
*   **Code Snippets (Monospace - Not explicitly in scale but implied):** All code must be rendered in a high-contrast monospace (e.g., JetBrains Mono) using `tertiary` (#6e3bd8) and `secondary` (#00687b) for syntax highlighting.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely replaced by **Tonal Layering**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card (#ffffff) on top of a `surface-container-low` (#f1f4f6) background. The change in luminance is enough to signify elevation.
*   **Ambient Shadows:** When an element must "float" (e.g., a modal or the Explorer character), use a tinted shadow: `on-surface` (#2d3337) at 6% opacity, with a 32px blur and 8px Y-offset. This mimics natural light reflecting off a slate-blue surface.
*   **The Ghost Border Fallback:** If accessibility requires a border (e.g., high-contrast mode), use `outline-variant` (#acb3b7) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-dim`), `full` roundedness, `title-sm` text.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** No background. `on-primary-container` text with a subtle `primary` underline (2px offset).

### Input Fields
*   **Style:** Containers use `surface-container-low`. Upon focus, the background shifts to `surface-container-lowest` with a 2px `secondary` bottom-bar.
*   **Error State:** Use `error` (#ac3434) text and a `error-container` (#f56965) subtle glow.

### Cards & Learning Modules
*   **Rule:** Forbid divider lines.
*   **Structure:** Use `xl` (1.5rem) roundedness for module cards. Separate content blocks with `1.5rem` to `2rem` of vertical white space. Use `secondary-container` (#acedff) for small "Tag" chips to categorize languages.

### The "Explorer" Component (Playful Element)
*   The "little person" explorer should be treated as a floating UI guide. They should never be trapped inside a box; they should overlap the edges of `surface-containers`, breaking the layout's rigid lines.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. A lesson sidebar might have 32px padding on the left and 48px on the right to feel "curated."
*   **Do** use `tertiary` (#6e3bd8) for "Aha!" moments or successful code execution notifications.
*   **Do** maximize whitespace. If it feels like "too much," it’s likely just right for an editorial feel.

### Don't
*   **Don't** use 1px solid dividers to separate list items. Use a `4px` gap and a subtle background hover state using `surface-container-high`.
*   **Don't** use pure black (#000000). Always use `on-surface` (#2d3337) for text to maintain the slate-blue tonal harmony.
*   **Don't** use standard "Material" shadows. Keep elevations soft, tinted, and wide.