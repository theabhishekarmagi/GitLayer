# Getting Started with GitLayer

This guide walks you through setting up GitLayer on your machine, loading it into the Figma Desktop app, connecting your GitHub account, and pushing your first design commit.

---

## Prerequisites

Before using GitLayer, ensure you have:

1. **Figma Desktop App** (Figma plugins under local development must run inside the desktop client; web browser development has manifest restrictions).
2. **Node.js & npm** (Node 18+ recommended) installed on your machine.
3. A **GitHub Account** (free or paid) with repository creation permissions.

---

## Step 1: Install and Build GitLayer

Clone the GitLayer repository to your local computer if you haven't already:

```bash
# Clone the repository
git clone https://github.com/theabhishekarmagi/GitLayer.git
cd GitLayer

# Install dependencies
npm install

# Compile TypeScript to JavaScript (generates code.js)
npm run build
```

> [!TIP]
> If you plan on modifying `code.ts`, keep TypeScript in watch mode so changes compile automatically:
> ```bash
> npm run watch
> ```

---

## Step 2: Load GitLayer into Figma

1. Open the **Figma Desktop App**.
2. Open any existing design file or create a new draft file.
3. Click the Figma menu icon (top left) or right-click anywhere on the canvas.
4. Navigate to **Plugins** > **Development** > **Import plugin from manifest...**.
5. Browse to your local `GitLayer` folder and select the `manifest.json` file.
6. GitLayer will now appear in your list of development plugins. Run it by pressing `Cmd + Option + P` (Mac) or `Ctrl + Alt + P` (Windows) to open the Quick Actions menu and typing **GitLayer**.

---

## Step 3: Generate a GitHub Personal Access Token (PAT)

GitLayer interacts with GitHub via the GitHub REST API to query repositories, fetch branches, and commit design snapshots.

1. In your web browser, navigate to your GitHub settings:
   - [github.com/settings/tokens](https://github.com/settings/tokens) (Classic Tokens) or [Fine-grained Personal Access Tokens](https://github.com/settings/personal-access-tokens).
2. Click **Generate new token (classic)**.
3. Give your token a descriptive note (e.g., `GitLayer Figma Plugin`).
4. Select the **`repo`** scope:
   - `repo` (Full control of private repositories: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`).
5. Set an expiration date according to your team's security policy (e.g., 30 or 90 days).
6. Click **Generate token** and copy the token string (`ghp_...`).

> [!CAUTION]
> GitHub only displays this token once. Store it in a secure password manager. GitLayer stores the token securely within Figma's local `figma.clientStorage` sandbox on your machine.

---

## Step 4: Authenticate and Select Repository

When you open GitLayer for the first time:

1. **Connect Account**: Click **Connect your account** on the welcome screen.
2. **Submit Token**: Paste your generated Personal Access Token into the password field and click **Submit**.
3. **Choose Repository**:
   - **Connect Existing Repository**: Select any repository from your GitHub account using the dropdown menu and click **Connect**.
   - **Create New Repository**: Enter a repository name (e.g. `design-system` or `figma-assets`) into the input box and click **Create & Connect**. GitLayer will automatically create the remote repository on your GitHub account with an initial `README.md` and link your Figma file to it.

---

## Step 5: Make Your First Commit

Once your repository is linked, GitLayer activates:

1. Add some shapes, frames, or text layers to your active Figma canvas page.
2. In the GitLayer window:
   - **Summary (Required)**: Enter a clear commit title (e.g., `feat: initial landing page layout`).
   - **Description (Optional)**: Add detailed notes explaining the design changes.
3. Click **Commit to main** (or click **Push to main** if in Minimized Toolbar mode).
4. GitLayer will serialize all nodes on your current page into `figma-snapshot.json` and push a commit to your branch.
5. Open your repository on GitHub (`https://github.com/<your-username>/<your-repo>`) to view your new commit and inspect `figma-snapshot.json`!

---

## Next Steps

- Explore the **[[User Guide & Workflows|User-Guide]]** to learn how to branch, compare versions, and preview commits on the canvas.
- Learn about the underlying serialization engine in **[[Architecture & Technical Design|Architecture-&-Technical-Design]]**.
