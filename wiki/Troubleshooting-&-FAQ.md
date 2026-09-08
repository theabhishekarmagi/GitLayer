# Troubleshooting & Frequently Asked Questions (FAQ)

Find answers to common questions and solutions for issues you might encounter while using **GitLayer**.

---

## Common Troubleshooting Scenarios

### 1. GitHub Token & Authentication Errors

#### Error: `401 Unauthorized` or `Bad credentials`
- **Cause**: The Personal Access Token (PAT) entered is invalid, mistyped, or has expired.
- **Resolution**:
  1. In GitLayer, click **Sign out** (or restart the plugin).
  2. Visit [github.com/settings/tokens](https://github.com/settings/tokens) and verify that your token has not expired.
  3. Generate a new token with the `repo` scope selected.
  4. Paste the fresh token into GitLayer and submit.

#### Error: `404 Not Found` when trying to access a private repository
- **Cause**: The PAT lacks the necessary `repo` permissions to access private repositories, or your GitHub organization enforces SAML SSO.
- **Resolution**:
  1. When generating the token on GitHub, ensure the entire **`repo`** scope checkbox is checked.
  2. If the repository belongs to an organization with SAML Single Sign-On (SSO), click **Configure SSO** next to your token in GitHub's Personal Access Tokens settings and click **Authorize**.

---

### 2. Figma Plugin Loading & Build Errors

#### "Changes in `code.ts` are not reflected in Figma"
- **Cause**: Figma executes the compiled `code.js` file, not the raw TypeScript file.
- **Resolution**: Run `npm run build` in your terminal to recompile `code.ts`. For continuous compilation during development, run:
  ```bash
  npm run watch
  ```
  Then in Figma, press `Cmd + Option + P` (macOS) or `Ctrl + Alt + P` (Windows) to reload the plugin.

#### "Import plugin from manifest is disabled or missing"
- **Cause**: You are running Figma in a web browser. Local plugin development manifests can only be loaded in the **Figma Desktop App**.
- **Resolution**: Download and open the Figma Desktop client from [figma.com/downloads](https://www.figma.com/downloads).

---

### 3. Serialization & Canvas Performance

#### Why are some large images missing or blank after checkout?
- **Cause**: To protect against repository bloat, GitHub Git blob size limits, and browser freezes, GitLayer enforces an automatic **2MB maximum size ceiling** on embedded raster images.
- **Resolution**: Compress oversized bitmap images before inserting them into Figma frames, or use vector assets (SVG) whenever possible.

#### Missing Font Warnings on Checkout
- **Cause**: The branch snapshot references a custom or proprietary font that is installed on another designer's computer but not present on your local operating system.
- **Resolution**: GitLayer automatically falls back to `Inter` (Regular/Bold) to prevent crashes when a font cannot be loaded via `figma.loadFontAsync()`. Installing the missing font family on your machine and re-opening the file will restore native typography rendering.

---

## Frequently Asked Questions (FAQ)

### Does GitLayer require an Organization or Enterprise Figma plan?
**No.** One of GitLayer's primary design goals is plan-agnostic version control. Unlike Figma's native Branching feature (which requires an Enterprise or Organization tier), GitLayer works on **Starter, Professional, Education, Organization, and Enterprise** plans.

### Where is my design version history stored?
Your design history is stored directly inside the **GitHub repository** you select or create, under the file `figma-snapshot.json`. GitLayer does not operate any third-party proprietary database or shadow servers; you and your team own 100% of your data.

### Can engineers read or consume `figma-snapshot.json`?
**Yes.** `figma-snapshot.json` is a clean, structured JSON file that details node hierarchies, colors, typography, dimensions, padding, and layout constraints. Engineering teams can build scripts, design token extractors, or CI pipelines directly on top of these snapshots.

### Is my GitHub Personal Access Token shared with other collaborators in the Figma file?
**No.** Your Personal Access Token is saved in `figma.clientStorage`, which is sandboxed locally on your computer and never synced across the Figma multiplayer session. Collaborators opening the same file will be prompted to authenticate with their own GitHub credentials.

### What are the GitHub API rate limits?
Personal Access Tokens have an allowance of **5,000 requests per hour** on GitHub. Normal GitLayer design workflows (committing, branch switching, comparing) consume only a handful of requests per action, making it virtually impossible to exceed rate limits under normal usage.

### How do I completely disconnect a repository from a Figma file?
Click **Sign out** in the top navigation bar of GitLayer. This wipes the locally cached credentials and unbinds the repository and branch keys from the active Figma document.
