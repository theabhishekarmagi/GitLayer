# Welcome to the GitLayer Wiki

<div align="center">
  <img src="https://raw.githubusercontent.com/theabhishekarmagi/GitLayer/main/assets/icon-128.png" width="96" height="96" alt="GitLayer Logo" />
  <h2>GitLayer: Git-Style Version Control Directly Inside Figma</h2>
  <p><em>Bridge the gap between design and code with canvas-native Git workflows backed by your own GitHub account.</em></p>
</div>

---

## Overview

**GitLayer** is a powerful Figma plugin that brings real Git-style version control — **branching, committing, branch comparison, visual diagram inspection, and history restoration** — directly into the Figma canvas. 

Unlike Figma's proprietary linear version history or its Enterprise-gated Branching feature, GitLayer:
- **Works on any Figma plan** (Free, Professional, Organization, Enterprise).
- **Stores history as real Git commits** inside repositories you and your team already own on GitHub.
- **Enables cross-functional alignment** by placing design snapshots side-by-side with codebase pull requests and issue tracking.
- **Requires zero external applications** — everything from connecting your account to branch switching happens directly within the Figma plugin window.

---

## Key Features

- **Direct GitHub Authentication**: Connect securely via your Personal Access Token (PAT) with local client-side persistence.
- **Repository & Branch Management**: Select existing repositories or create new ones on the fly; switch branches or spin up feature branches without leaving the canvas.
- **Ahead / Behind Branch Comparison**: Real-time counter and diff indicators mirroring the GitHub Desktop experience.
- **Side-by-Side Canvas Previews**: Import and preview any past commit alongside your current working canvas before restoring.
- **Visual Diagram & Inspection**: View interactive node hierarchies, commit logs, and metadata for every revision.
- **Dual UI Modes**:
  - **Minimized Floating Toolbar**: Compact pill interface designed to hover unobtrusively over your canvas for quick commits while designing.
  - **Maximized GitHub Desktop View**: Comprehensive workspace featuring Changes and History tabs, diff trees, commit authors, and branch management.
- **Real-Time Node Serialization**: Recursively serializes Frames, Shapes, Auto-Layout configurations, Text layers, Gradient/Solid fills, and vector networks into structured JSON snapshots (`figma-snapshot.json`).

---

## Wiki Directory & Navigation

Explore the complete GitLayer documentation through the following guides:

| Section | Description |
| :--- | :--- |
| **[[Getting Started|Getting-Started]]** | Prerequisites, installing via Figma manifest, setting up your GitHub Personal Access Token, and making your first commit. |
| **[[Architecture & Technical Design|Architecture-&-Technical-Design]]** | Deep dive into the plugin architecture: Figma sandbox (`code.ts`), UI iframe (`ui.html`), message passing, node serialization, and GitHub REST API integration. |
| **[[User Guide & Workflows|User-Guide]]** | How to use the Dual UI modes, branch creation, branch switching, commit inspections, and side-by-side canvas previews. |
| **[[Development & Contributing|Development-&-Contributing]]** | Setting up a local development environment, compiling TypeScript, running ESLint, and contributing to the GitLayer codebase. |
| **[[Troubleshooting & FAQ|Troubleshooting-&-FAQ]]** | Resolving PAT authentication issues, image size limitations, missing font warnings, and Figma plugin reload shortcuts. |

---

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/theabhishekarmagi">
        <img src="https://avatars.githubusercontent.com/u/310078880?v=4" width="80" height="80" alt="MAGI ABHISHEKAR" /><br />
        <sub><b>MAGI ABHISHEKAR</b></sub>
      </a><br />
      <sub>@theabhishekarmagi</sub>
    </td>
  </tr>
</table>

---

## Quick Links

- **Repository**: [github.com/theabhishekarmagi/GitLayer](https://github.com/theabhishekarmagi/GitLayer)
- **Issues & Feedback**: [GitLayer Issue Tracker](https://github.com/theabhishekarmagi/GitLayer/issues)
- **License**: [MIT](https://github.com/theabhishekarmagi/GitLayer/blob/main/README.md#license)
