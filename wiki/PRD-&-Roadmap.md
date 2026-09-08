# GitLayer PRD & Roadmap

This page outlines the Product Requirements Document (PRD), core problem space, target personas, non-goals, and multi-phase engineering roadmap for **GitLayer**.

---

## Executive Summary

GitLayer is designed to bridge the fundamental divide between design workflows and engineering source control. Instead of relying on Figma's proprietary linear version history or Figma's Enterprise-gated Branching & Merging feature, GitLayer brings real Git workflows — **branch, commit, diff, compare, and merge** — directly into the Figma canvas, backed by the team's own code repository.

---

## Problem Statement

1. **Figma's native version history is linear and flat**: Designers can name saves, but cannot branch, experiment in isolation, and merge back.
2. **Native Branching is plan-gated and siloed**: Figma's native branching is restricted to Organization and Enterprise plans. Furthermore, branches live inside Figma's closed storage and cannot be queried or versioned by external developer tools.
3. **Design and code history live in disconnected universes**: When a bug or design regression occurs, engineers cannot inspect what changed in Figma at the commit level or cross-reference design changes with GitHub Pull Requests.
4. **Workarounds are brittle and painful**: Designers duplicate pages or entire files (`File_v2_final_FINAL`), leading to desynchronized libraries and accidental overrides.

---

## Target Personas

| Persona | Context | What They Need From GitLayer |
| :--- | :--- | :--- |
| **Design System Designers** | Ships components alongside frontend engineers | Design changes versioned in the exact same repo as React/Vue components and PRs. |
| **Product Designers (Starter/Pro)** | Needs branching, but blocked by Figma's Enterprise gate | Plan-agnostic branching, commits, and rollback from a canvas plugin. |
| **DesignOps & Platform Leads** | Maintains design tooling and governance | Auditable commit logs, change verification, and automated backup outside Figma. |
| **Freelancers & Studios** | Delivers client projects with complete ownership | Exportable, portable design snapshots stored in client or personal repositories. |

---

## Goals and Non-Goals

### Goals
- Direct integration with real Git providers (GitHub in V1; GitLab/Bitbucket in V1.1).
- Canvas-native execution: zero desktop companion apps or external web dashboards needed.
- Full fidelity serialization of auto-layout, vectors, styles, typography, and embedded images.
- Plan-agnostic operation across Starter, Professional, Organization, and Enterprise Figma plans.
- Non-destructive historical exploration via side-by-side canvas rendering.

### Non-Goals
- Replacing Figma's live multiplayer real-time editing.
- Byte-for-byte binary reproduction of Figma's internal proprietary `.fig` format.
- Fully automatic silent 3-way visual conflict resolution in V1. (V1 focuses on detecting and clearly flagging visual conflicts for human review).
- Offline design editing outside the Figma app.

---

## Phased Product Roadmap

```mermaid
gantt
    title GitLayer Phased Development Roadmap
    dateFormat  YYYY-MM
    section Core Development
    V0: Proof of Concept          :done,    des1, 2026-07, 2026-08
    V1: Current MVP (GitHub)       :active,  des2, 2026-08, 2026-09
    section Upcoming Releases
    V1.1: Multi-Provider & Merge   :         des3, 2026-10, 2026-11
    V2: Enterprise & Multiplayer   :         des4, 2026-11, 2027-01
```

### V0 — Proof of Concept (Completed)
- Recursive canvas node tree serialization to JSON.
- Direct GitHub API authentication via Personal Access Token.
- Initial commit push and repository initialization.
- Basic canvas node restoration from JSON snapshot.

### V1 — Current MVP (Current Release)
- Dual UI modes: Minimized Floating Toolbar Pill and Maximized GitHub Desktop view.
- Repository picker and instant new repository creation.
- Branch creation and switching.
- Ahead / Behind commit counters and branch comparison.
- Side-by-side canvas preview of historical commits with Dismiss / Restore banner.
- Image hash caching with 2MB payload ceiling.
- Full Auto-Layout (Flexbox), vector paths, effects, and typography styling support.

### V1.1 — Multi-Provider and Conflict Review (Next Phase)
- **GitLab and Bitbucket Providers**: Support personal access tokens and OAuth for GitLab and Bitbucket repositories.
- **Visual Merge Conflict Reviewer**: Visual side-by-side node diffing with interactive "Keep Ours" vs. "Keep Theirs" resolution UI.
- **Selective Page/Frame Staging**: Ability to commit individual frames or selected pages rather than the entire page.

### V2 — Team Collaboration and Enterprise
- **Multiplayer Awareness**: Warning notifications if active collaborators are editing a page when a branch checkout or merge occurs.
- **Design Tokens Integration**: Direct export of design tokens alongside `figma-snapshot.json` for developer handoff.
- **Hosted OAuth Relay**: Zero-PAT sign-in via browser-based OAuth with PKCE flow.
- **Pull Request Integration**: Direct generation of GitHub Pull Requests from the Figma plugin panel.

---

## Glossary: Git to GitLayer Mapping

| Git Command / Concept | GitLayer Equivalent | Behavior in GitLayer |
| :--- | :--- | :--- |
| `git init` | **Initialize Version Control** | Connects file to a GitHub repo and pushes initial `figma-snapshot.json`. |
| `git commit` | **Commit Changes** | Serializes canvas layers, builds Git tree, and pushes new commit object. |
| `git branch <name>` | **New Branch** | Creates a new Git ref on GitHub pointing to the current commit SHA. |
| `git checkout <branch>`| **Switch Branch** | Fetches target branch snapshot and reconstructs canvas nodes. |
| `git status` | **Changes Tab** | Lists modified, added, or deleted canvas nodes. |
| `git log` | **History Tab** | Displays chronologically sorted commit history with authors and timestamps. |
| `git diff` | **Compare / Preview** | Renders branch diffs and side-by-side previews on the active canvas. |
| `git pull` | **Pull Button** | Downloads the latest remote snapshot and updates the active canvas. |
