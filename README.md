<div align="center">
  <img src="assets/icon-128.png" width="96" height="96" alt="GitLayer Logo" />
  <h1>GitLayer</h1>
  <p><strong>Git-style version control directly inside Figma</strong></p>
</div>

GitLayer is a powerful Figma plugin that brings Git-style version control directly into the design workflow. It bridges the gap between design and development by allowing designers to commit serialized JSON snapshots of their Figma canvas directly to a connected GitHub repository.

## Features

- **GitHub Authentication**: Securely connect to your GitHub account using a Personal Access Token (PAT). Tokens are persisted locally for a seamless experience.
- **Repository & Branch Management**: Create new repositories or select existing ones, switch branches, and create new branches directly within Figma.
- **Branch Comparison**: Compare branches with real-time Ahead / Behind counters and commits matching GitHub Desktop.
- **Visual Diagram & Inspection**: View interactive diagram previews of historical commits and place previews directly beside your current canvas.
- **Dual UI Modes**: 
  - **Minimized Floating Toolbar**: A sleek, non-intrusive pill interface that hovers over your canvas for quick commits.
  - **GitHub Desktop Interface**: A maximized view that mirrors the GitHub Desktop experience, complete with history and branch comparison.
- **Live Sync**: Instantly watch your Figma nodes serialize into JSON in real-time as you drag, drop, and edit shapes on the canvas.
- **One-Click Commits**: Write a summary, add a description, and push your design snapshot directly to your branch without ever leaving Figma.

<p align="center">
  <img src="assets/cover-art-1920x960.png" width="100%" alt="GitLayer - Git version control directly inside Figma" />
</p>

## How it Works

When you commit, GitLayer recursively serializes the current Figma page and all of its nodes (Frames, Rectangles, Text, etc.) into a lightweight JSON structure. It then uses the GitHub REST API to create or update a `figma-snapshot.json` file in your linked repository.

## Development Setup

To run GitLayer locally on your machine and test it in Figma:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Plugin**
   ```bash
   npm run build
   ```
   *Note: You must run the build command anytime you make changes to `code.ts`.*

3. **Load into Figma**
   - Open the Figma Desktop App.
   - Go to **Plugins** > **Development** > **Import plugin from manifest...**
   - Select the `manifest.json` file located in this repository folder.
   - Run the plugin!

## Tech Stack

- **Figma Plugin API**: Interacts with the canvas to read node properties (`code.ts`).
- **HTML / CSS / JavaScript**: Powers the user interface and handles network requests (`ui.html`).
- **TypeScript**: Ensures type-safety when interacting with Figma nodes.
- **GitHub REST API**: Used for fetching repositories, creating repos, and pushing commits.

## Documentation & Wiki

Explore the complete [GitLayer Wiki](https://github.com/theabhishekarmagi/GitLayer/wiki) or browse our local [wiki/](./wiki/Home.md) directory:

- [Getting Started](./wiki/Getting-Started.md) — Installation, Figma setup, and GitHub PAT configuration.
- [Architecture & Technical Design](./wiki/Architecture-&-Technical-Design.md) — Figma sandbox vs. UI iframe, node serialization, and GitHub REST API integration.
- [User Guide & Workflows](./wiki/User-Guide.md) — Dual UI modes, branch creation, Ahead/Behind comparison, and canvas side-by-side previews.
- [Development & Contributing](./wiki/Development-&-Contributing.md) — TypeScript compilation, debugging in Figma, and pull request workflow.
- [Troubleshooting & FAQ](./wiki/Troubleshooting-&-FAQ.md) — Authentication errors, image limits, and font fallbacks.

## Data & Privacy Disclosure

GitLayer only connects to GitHub and uploads data when you explicitly click the "Commit" or "Push" button — there is no automatic or background syncing. When an export is initiated, the entire current Figma page hierarchy is serialized into a structured JSON snapshot (`figma-snapshot.json`), along with associated SVG/PNG/PDF preview data and embedded assets, and sent directly to the repository you select using your own GitHub Personal Access Token (PAT). GitLayer does not operate external intermediary servers, databases, or third-party telemetry, ensuring you retain full ownership and control over your design data.

## License
MIT
