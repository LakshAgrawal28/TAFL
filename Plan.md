# Implementation Plan - TAFL Grammar Transformation Tool

A premium, interactive web application designed to help students master **Theory of Automata and Formal Languages (TAFL)** concepts by converting **Context-Free Grammars (CFG)** into **Chomsky Normal Form (CNF)** and **Greibach Normal Form (GNF)** step-by-step.

## User Review Required

> [!IMPORTANT]
> **Algorithm Confirmation**: I have outlined the standard academic steps for CNF and GNF. Please verify if your course uses these specific variations or if you need any additional steps (e.g., specific variable naming conventions like $X_a, Y_b$, etc.).
> 
> **Technology Stack**: I propose using **Vite + React** with **Framer Motion** for a high-performance, animation-rich experience. If you prefer a different stack (e.g., Next.js), please let me know before I proceed.

## Proposed Changes

### 1. Project Initialization & Infrastructure
Set up the core project foundation with a focus on speed and visual excellence.

#### [NEW] [package.json](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/package.json)
Initialize with Vite, React, Framer Motion, and Lucide React.
#### [NEW] [index.css](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/index.css)
Global styling with custom CSS variables for the premium dark-themed design system.

---

### 2. Core Logic (Theoretical Algorithms)
Implement the grammar engine with "snapshot" capability for step-by-step display.

#### [NEW] [grammarEngine.js](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/logic/grammarEngine.js)
Contains classes and methods for:
- **CFG Parser**: Parsing user input (e.g., `S -> aB | bA`) into an internal data structure.
- **CNF Transformer**: Sequential functions following:
    1. Null elimination
    2. Unit elimination
    3. Useless symbol elimination
    4. RHS standardization (Terminals and Length)
- **GNF Transformer**:
    1. CNF call
    2. Variable renaming ($A_1, A_2 \dots$)
    3. Left-recursion elimination
    4. Back-substitution

---

### 3. UI/UX Design & Components
A "wow" factor interface featuring glassmorphism and smooth motion.

#### [NEW] [Navbar.jsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/components/Navbar.jsx)
Sleek top bar with project title and links.
#### [NEW] [GrammarInput.jsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/components/GrammarInput.jsx)
Interactive text area for entering CFGs, including pre-loaded examples.
#### [NEW] [StepVisualizer.jsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/components/StepVisualizer.jsx)
The core "Timeline" view that iterates through the transformation snapshots with animated entries.
#### [NEW] [ResultPanel.jsx](file:///c:/Users/LAKSH%20AGRAWAL/Desktop/VSCode/New%20folder/src/components/ResultPanel.jsx)
Final grammar display with "Copy to Clipboard" and "Export" functionality.

---

## Open Questions

> [!CAUTION]
> 1. **Formatting**: Is there a specific way you want the grammar to be entered? (e.g., `S -> aS | EPSILON` or `S -> aS | \e`)?
> 2. **GNF Dependency**: Should the GNF transformation always force a CNF first (standard approach), or allow GNF direct conversion if possible?
> 3. **Visuals**: Do you have a preferred color palette, or should I proceed with the "Deep Abyss" dark mode (Indigo/Cyan accents)?

## Verification Plan

### Automated Logic Testing
- Create a test suite of standard grammars (e.g., Null-heavy, recursion-heavy) to verify the correctness of CNF and GNF string outputs.
- Log each intermediate state to ensure the "step-by-step" narrative is logical.

### Manual UI Verification
- Use the **Browser Subagent** to interact with the deployed local server.
- Verify that entering a grammar and clicking "Convert" triggers the step animations and displays the final result correctly.
- Test responsiveness on mobile and tablet views.
