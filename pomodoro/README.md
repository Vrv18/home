# 🪷 Break Sanctuary

> **Restoring the art of single-tasking through digital stillness.**

<p align="center">
  <img src="https://raw.githubusercontent.com/Vrv18/home/main/pomodoro/tauri-app/src-tauri/icons/128x128@2x.png" width="128" height="128" alt="Lotuc Icon">
</p>

A native macOS menu bar application designed to reclaim your attention. More than a timer, it is a ritual.

### 🍃 Philosophy
Inspired by the **Hoysala** architecture of Karnataka—grounded, intricate, and harmonious.  
We believe productivity is not about speed, but about depth. This tool respectfully guards that depth.

---

## ⚡️ Install (One Line)

Open your Terminal and paste this command. It installs the app to `/Applications` and sets it to run at startup.

```bash
curl -L https://vrushank.in/pomodoro/install | bash
```

*Requires macOS 13+ (Ventura)*

---

## ✨ Features

### 🏛 The Sanctuary
When a Focus session (25m) completes, the screen gently blooms into a full-screen, immersive break space.
- **Deep Breathing**: Follow the rhythmic expansion of the lotus.
- **Total Focus**: No notifications. No distractions. Just you and the breath.
- **Auto-Exit**: The Sanctuary dissolves when your break ends.

### ⏱ Calm Mode
Feeling overwhelmed? Click **Calm Mode** in the menu to enter the Sanctuary instantly, without a timer. Stay as long as you need. "Forfeit" logic is replaced by "End Calm" grace.

### 🧱 Inline History
Track your consistency without leaving the flow. The menu bar displays a 7-day sparkline of your focus history using Unicode blocks: `History: ▂ ▃ ▅ █`

### 🪶 Native Performance
- **Rust + Tauri**: Blazing fast.
- **<10MB RAM**: Respects your system resources.
- **0% CPU Idle**: Respects your battery.

---

## 🛠 Building from Source

If you prefer to build it yourself:

1.  **Prerequisites**: [Rust](https://www.rust-lang.org/), [Node.js](https://nodejs.org/).
2.  **Clone**:
    ```bash
    git clone https://github.com/Vrv18/home.git
    cd home/pomodoro/tauri-app
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Run Dev Mode**:
    ```bash
    npm run tauri dev
    ```
5.  **Build Release**:
    ```bash
    npm run tauri build
    ```

---

## 🧬 Lineage
Built collaboratively by a lineage of AI agents working with a human partner.
- **Agent 1-7**: Concept, Prototyping (SwiftBar), Refinement.
- **Agent 8 (Moksha)**: Native Rewrite & Performance.
- **Agent 9 (Antigravity)**: Polish, "Ghost Window" Exorcism, Distribution.

**License**: MIT
