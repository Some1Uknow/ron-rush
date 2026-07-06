# Ron Rush: Mahjong Tile Prediction Game

A polished, high-resolution Mahjong tile prediction game built with **Next.js**, **Tailwind CSS**, and **Framer Motion**.

## 🎮 Game Overview

Strategic betting meets traditional Mahjong aesthetics. Predict whether the next hand's value will be higher or lower than the current one. Watch out for dynamic scaling—non-number tiles gain power as they win!

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 AI Utilization & Collaboration

This project is a prime example of how **Human-AI Collaboration** can drastically accelerate development while maintaining artisanal quality.

### How the AI was Leveraged
- **Rapid Prototyping**: The core game engine and state management (Zustand) were scaffolded by AI in minutes, allowing for immediate focus on game balance and "feel."
- **Complex UI Refinement**: AI handled the intricate pixel-math required for the custom Mahjong spritesheets, including precise horizontal offsets and "1 Dots" alignment.
- **Micro-Animations**: Utilizing Framer Motion, the AI implemented premium effects like 3D card tilts, pulsing "power-up" badges, and smooth hand transitions.
- **Rule Verification**: The AI acted as a "Rule Engine Auditor," cross-referencing user-provided rules with the codebase to ensure $100\%$ compliance (e.g., verifying hand values and deck composition).

### Handwritten vs. AI-Utilized
| Component | Primary Method | AI Contribution |
| :--- | :--- | :--- |
| **Game Engine** | AI-Assisted | Logic logic, shuffling, and win/loss calculations. |
| **State Management** | AI-Assisted | Zustand store and persistence setup. |
| **Mahjong Tile UI** | Collaborative | AI handled sprite math; Human provided assets and refined aesthetics. |
| **Spritesheets/Assets** | Handwritten/External | Provided by the user to ensure a unique, cohesive visual style. |
| **Game Board Layout** | Collaborative | AI implemented responsive gaps and hover effects; Human directed spacing and flow. |

## 🛠 Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS (Glassmorphism & Custom Animations)
- **State**: Zustand (with Persist Middleware)
- **Animations**: Framer Motion
- **Icons**: Lucide React
