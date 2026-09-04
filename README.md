# GitLayer

GitLayer is a powerful Figma plugin that brings Git-style version control directly into the design workflow. It bridges the gap between design and development by allowing designers to commit serialized JSON snapshots of their Figma canvas directly to a connected GitHub repository.

## Features

- **GitHub Authentication**: Securely connect to your GitHub account using a Personal Access Token (PAT). Tokens are persisted locally for a seamless experience.
- **Repository Management**: Create new, private repositories directly from Figma (automatically tagged with `figma-repo`) or select an existing repository from your account.
- **Dual UI Modes**: 
  - **Minimized Floating Toolbar**: A sleek, non-intrusive pill interface that hovers over your canvas for quick commits.
  - **GitHub Desktop Interface**: A maximized view that mirrors the GitHub Desktop experience, complete with a diff viewer.
- **Live Sync**: Instantly watch your Figma nodes serialize into JSON in real-time as you drag, drop, and edit shapes on the canvas.
- **One-Click Commits**: Write a summary, add a description, and push your design snapshot directly to the `main` branch without ever leaving Figma.

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

## License
MIT
