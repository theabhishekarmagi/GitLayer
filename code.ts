// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.

if (figma.editorType === 'figma') {
  // Show the UI with an initial compact size for onboarding
  figma.showUI(__html__, { width: 320, height: 420 });

  // Very basic recursive serializer for V0
  function serializeNode(node: SceneNode): any {
    const obj: any = {
      id: node.id,
      type: node.type,
      name: node.name,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
    };
    
    // Attempt to capture fills if they exist on this type of node
    if ('fills' in node && Array.isArray(node.fills)) {
      obj.fills = node.fills.map((fill: any) => {
         if (fill.type === 'SOLID' && fill.color) {
           return { type: 'SOLID', color: fill.color };
         }
         return { type: fill.type };
      });
    }

    // Recursively serialize children
    if ('children' in node) {
      obj.children = (node.children as SceneNode[]).map(child => serializeNode(child));
    }
    return obj;
  }
  
  // Load initial state and setup listeners
  async function init() {
    // 1. Load and send initial state
    const pat = await figma.clientStorage.getAsync('github_pat');
    const repo = figma.root.getPluginData('github_repo');
    figma.ui.postMessage({ type: 'init-state', pat, repo });

    // 2. Setup live sync listener
    try {
      await figma.loadAllPagesAsync();
      
      let previewTimeout: number | null = null;
      figma.on('documentchange', () => {
        if (previewTimeout !== null) {
          clearTimeout(previewTimeout);
        }
        
        previewTimeout = setTimeout(() => {
          const page = figma.currentPage;
          const payload = {
            pageName: page.name,
            pageId: page.id,
            timestamp: new Date().toISOString(),
            nodes: page.children.map(child => serializeNode(child))
          };
          
          figma.ui.postMessage({
            type: 'preview-payload',
            payload: payload
          });
          
          previewTimeout = null;
        }, 500);
      });
    } catch (e) {
      console.error("Failed to init documentchange listener", e);
    }
  }
  init();

  figma.ui.onmessage = async (msg: { type: string, pat?: string, repo?: string, summary?: string, width?: number, height?: number }) => {
    
    if (msg.type === 'save-pat') {
      await figma.clientStorage.setAsync('github_pat', msg.pat);
    }
    
    else if (msg.type === 'save-repo') {
      if (msg.repo) figma.root.setPluginData('github_repo', msg.repo);
    }
    
    else if (msg.type === 'logout') {
      await figma.clientStorage.deleteAsync('github_pat');
      figma.root.setPluginData('github_repo', '');
    }

    else if (msg.type === 'resize' && msg.width && msg.height) {
      figma.ui.resize(msg.width, msg.height);
    }
    
    else if (msg.type === 'request-preview') {
      const page = figma.currentPage;
      const payload = {
        pageName: page.name,
        pageId: page.id,
        timestamp: new Date().toISOString(),
        nodes: page.children.map(child => serializeNode(child))
      };
      
      figma.ui.postMessage({
        type: 'preview-payload',
        payload: payload
      });
    }

    else if (msg.type === 'serialize-and-commit') {
      const page = figma.currentPage;
      
      const payload = {
        pageName: page.name,
        pageId: page.id,
        timestamp: new Date().toISOString(),
        nodes: page.children.map(child => serializeNode(child))
      };
      
      figma.ui.postMessage({
        type: 'commit-payload',
        pat: msg.pat,
        repo: msg.repo,
        payload: payload,
        message: msg.summary || `GitLayer: Sync page "${page.name}"`,
        source: (msg as any).source
      });
      
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    }
  };
}
