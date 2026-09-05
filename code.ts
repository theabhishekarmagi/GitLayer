// GitLayer - Main Plugin Code
// Uses Figma REST API for full-fidelity serialization and custom deserializer for restoration

if (figma.editorType === 'figma') {
  figma.showUI(__html__, { width: 320, height: 420 });

  // ─────────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────────
  async function init() {
    const pat    = await figma.clientStorage.getAsync('github_pat');
    const repo   = figma.root.getPluginData('github_repo');
    const branch = figma.root.getPluginData('github_branch') || 'main';

    figma.ui.postMessage({
      type:    'init-state',
      pat,
      repo,
      branch,
      fileKey: figma.fileKey ?? null
    });

    try {
      await figma.loadAllPagesAsync();
      let previewTimeout: ReturnType<typeof setTimeout> | null = null;
      figma.on('documentchange', () => {
        if (previewTimeout !== null) clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
          figma.ui.postMessage({ type: 'document-changed', fileKey: figma.fileKey ?? null });
          previewTimeout = null;
        }, 800);
      });
    } catch (e) {
      console.error('Failed to init listener', e);
    }
  }
  init();

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  function applyCommonProps(node: SceneNode, data: any) {
    if (data.absoluteBoundingBox) {
      if ('x' in node) node.x = data.absoluteBoundingBox.x;
      if ('y' in node) node.y = data.absoluteBoundingBox.y;
      if ('resize' in node) (node as FrameNode).resize(
        data.absoluteBoundingBox.width  || 100,
        data.absoluteBoundingBox.height || 100
      );
    }
    if (data.name && 'name' in node)          node.name = data.name;
    if (data.opacity  !== undefined && 'opacity'  in node) (node as FrameNode).opacity  = data.opacity;
    if (data.visible  !== undefined && 'visible'  in node) (node as FrameNode).visible  = data.visible;
    if (data.rotation !== undefined && 'rotation' in node) (node as FrameNode).rotation = data.rotation;
    if (data.blendMode && 'blendMode' in node) (node as FrameNode).blendMode = data.blendMode as BlendMode;
    if (data.locked   !== undefined && 'locked'   in node) (node as FrameNode).locked   = data.locked;
    if (data.clipsContent !== undefined && 'clipsContent' in node) (node as FrameNode).clipsContent = data.clipsContent;

    // Fills
    if ('fills' in node && Array.isArray(data.fills) && data.fills.length > 0) {
      const paints: Paint[] = [];
      for (const fill of data.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          paints.push({ type: 'SOLID', color: { r: fill.color.r, g: fill.color.g, b: fill.color.b }, opacity: fill.opacity ?? 1, visible: fill.visible ?? true, blendMode: fill.blendMode ?? 'NORMAL' } as SolidPaint);
        } else if (['GRADIENT_LINEAR','GRADIENT_RADIAL','GRADIENT_ANGULAR','GRADIENT_DIAMOND'].includes(fill.type)) {
          paints.push({ type: fill.type, gradientTransform: fill.gradientTransform ?? [[1,0,0],[0,1,0]], gradientStops: (fill.gradientStops||[]).map((s:any)=>({ position:s.position, color:{r:s.color.r,g:s.color.g,b:s.color.b,a:s.color.a??1} })), visible: fill.visible ?? true, opacity: fill.opacity ?? 1, blendMode: fill.blendMode ?? 'NORMAL' } as GradientPaint);
        }
      }
      if (paints.length > 0) (node as FrameNode).fills = paints;
    }

    // Strokes
    if ('strokes' in node && Array.isArray(data.strokes) && data.strokes.length > 0) {
      const sp: Paint[] = data.strokes.filter((s:any)=>s.type==='SOLID'&&s.color).map((s:any)=>({ type:'SOLID', color:{r:s.color.r,g:s.color.g,b:s.color.b}, opacity:s.opacity??1, visible:s.visible??true, blendMode:s.blendMode??'NORMAL' } as SolidPaint));
      if (sp.length > 0) (node as RectangleNode).strokes = sp;
    }
    if ('strokeWeight' in node && data.strokeWeight !== undefined)  (node as RectangleNode).strokeWeight = data.strokeWeight;
    if ('strokeAlign'  in node && data.strokeAlign)                 (node as RectangleNode).strokeAlign  = data.strokeAlign;
    if ('dashPattern'  in node && Array.isArray(data.strokeDashes)) (node as RectangleNode).dashPattern  = data.strokeDashes;

    // Corners
    if ('cornerRadius' in node && data.cornerRadius !== undefined)    (node as RectangleNode).cornerRadius = data.cornerRadius;
    if ('topLeftRadius' in node && Array.isArray(data.rectangleCornerRadii)) {
      (node as RectangleNode).topLeftRadius     = data.rectangleCornerRadii[0] ?? 0;
      (node as RectangleNode).topRightRadius    = data.rectangleCornerRadii[1] ?? 0;
      (node as RectangleNode).bottomRightRadius = data.rectangleCornerRadii[2] ?? 0;
      (node as RectangleNode).bottomLeftRadius  = data.rectangleCornerRadii[3] ?? 0;
    }

    // Effects
    if ('effects' in node && Array.isArray(data.effects) && data.effects.length > 0) {
      const effects: Effect[] = [];
      for (const e of data.effects) {
        if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
          effects.push({ type:e.type, color:{r:e.color.r,g:e.color.g,b:e.color.b,a:e.color.a??1}, offset:{x:e.offset?.x??0,y:e.offset?.y??0}, radius:e.radius??0, spread:e.spread??0, visible:e.visible??true, blendMode:e.blendMode??'NORMAL', showShadowBehindNode:false } as DropShadowEffect);
        } else if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') {
          effects.push({ type:e.type, radius:e.radius??0, visible:e.visible??true } as BlurEffect);
        }
      }
      if (effects.length > 0) (node as FrameNode).effects = effects;
    }

    // Constraints
    if ('constraints' in node && data.constraints) {
      (node as RectangleNode).constraints = { horizontal: data.constraints.horizontal ?? 'LEFT', vertical: data.constraints.vertical ?? 'TOP' };
    }
  }

  function applyAutoLayout(frame: FrameNode, data: any) {
    if (!data.layoutMode || data.layoutMode === 'NONE') return;
    frame.layoutMode            = data.layoutMode;
    frame.primaryAxisSizingMode = data.primaryAxisSizingMode  ?? 'AUTO';
    frame.counterAxisSizingMode = data.counterAxisSizingMode  ?? 'AUTO';
    frame.primaryAxisAlignItems = data.primaryAxisAlignItems  ?? 'MIN';
    frame.counterAxisAlignItems = data.counterAxisAlignItems  ?? 'MIN';
    frame.paddingTop            = data.paddingTop    ?? 0;
    frame.paddingBottom         = data.paddingBottom ?? 0;
    frame.paddingLeft           = data.paddingLeft   ?? 0;
    frame.paddingRight          = data.paddingRight  ?? 0;
    frame.itemSpacing           = data.itemSpacing   ?? 0;
  }

  async function applyTextProps(textNode: TextNode, data: any) {
    const family = data.style?.fontFamily ?? 'Inter';
    const weight = data.style?.fontWeight ?? 400;
    const italic = data.style?.italic ?? false;
    let style = 'Regular';
    if (weight >= 700 && italic) style = 'Bold Italic';
    else if (weight >= 700)      style = 'Bold';
    else if (italic)             style = 'Italic';

    try { await figma.loadFontAsync({ family, style }); }
    catch { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); style = 'Regular'; }

    try { textNode.fontName = { family, style }; } catch { textNode.fontName = { family:'Inter', style:'Regular' }; }
    textNode.characters = data.characters ?? '';

    if (data.style) {
      const s = data.style;
      try { textNode.fontSize = s.fontSize ?? 14; } catch {}
      if (s.textAlignHorizontal) try { textNode.textAlignHorizontal = s.textAlignHorizontal; } catch {}
      if (s.textAlignVertical)   try { textNode.textAlignVertical   = s.textAlignVertical;   } catch {}
      if (s.letterSpacing !== undefined) try { textNode.letterSpacing = { value: s.letterSpacing, unit: 'PIXELS' }; } catch {}
      if (s.lineHeightPx  !== undefined) try { textNode.lineHeight = { value: s.lineHeightPx, unit: 'PIXELS' }; } catch {}
      else try { textNode.lineHeight = { unit: 'AUTO' }; } catch {}
    }
    if (Array.isArray(data.fills) && data.fills.length > 0) {
      const f = data.fills[0];
      if (f.type === 'SOLID' && f.color) textNode.fills = [{ type:'SOLID', color:{r:f.color.r,g:f.color.g,b:f.color.b}, opacity:f.opacity??1, visible:true, blendMode:'NORMAL' } as SolidPaint];
    }
  }

  async function buildNode(data: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode | null> {
    try {
      switch (data.type) {
        case 'FRAME':
        case 'COMPONENT':
        case 'COMPONENT_SET':
        case 'INSTANCE': {
          const frame = figma.createFrame();
          parent.appendChild(frame);
          applyCommonProps(frame, data);
          applyAutoLayout(frame, data);
          if (Array.isArray(data.layoutGrids)) try { frame.layoutGrids = data.layoutGrids; } catch {}
          if (data.children) for (const c of data.children) await buildNode(c, frame);
          return frame;
        }
        case 'GROUP': {
          const kids: SceneNode[] = [];
          if (data.children) for (const c of data.children) {
            const b = await buildNode(c, figma.currentPage); if (b) kids.push(b);
          }
          if (kids.length === 0) return null;
          const group = figma.group(kids, parent as any);
          if (data.name) group.name = data.name;
          if (data.opacity !== undefined) group.opacity = data.opacity;
          return group;
        }
        case 'TEXT': {
          const text = figma.createText();
          parent.appendChild(text);
          await figma.loadFontAsync({ family:'Inter', style:'Regular' });
          applyCommonProps(text, data);
          await applyTextProps(text, data);
          return text;
        }
        case 'RECTANGLE': {
          const r = figma.createRectangle(); parent.appendChild(r); applyCommonProps(r, data); return r;
        }
        case 'ELLIPSE': {
          const e = figma.createEllipse(); parent.appendChild(e); applyCommonProps(e, data);
          if (data.arcData) e.arcData = data.arcData; return e;
        }
        case 'POLYGON': {
          const p = figma.createPolygon(); parent.appendChild(p); applyCommonProps(p, data);
          if (data.pointCount) p.pointCount = data.pointCount; return p;
        }
        case 'STAR': {
          const s = figma.createStar(); parent.appendChild(s); applyCommonProps(s, data);
          if (data.pointCount) s.pointCount = data.pointCount;
          if (data.innerRadius) s.innerRadius = data.innerRadius; return s;
        }
        case 'LINE': {
          const l = figma.createLine(); parent.appendChild(l); applyCommonProps(l, data); return l;
        }
        case 'VECTOR': {
          const v = figma.createVector(); parent.appendChild(v); applyCommonProps(v, data);
          if (data.vectorNetwork) try { v.vectorNetwork = data.vectorNetwork; } catch {} return v;
        }
        case 'BOOLEAN_OPERATION': {
          const kids: SceneNode[] = [];
          if (data.children) for (const c of data.children) {
            const b = await buildNode(c, figma.currentPage); if (b) kids.push(b);
          }
          if (kids.length < 2) return null;
          const flat = figma.flatten(kids as VectorNode[], parent as any);
          applyCommonProps(flat, data); return flat;
        }
        default:
          console.log('[GitLayer] Skipping unsupported type:', data.type); return null;
      }
    } catch (err) {
      console.error('[GitLayer] Error building node', data.type, err); return null;
    }
  }

  async function deserializeDocument(doc: any) {
    if (doc.pageName && doc.nodes) {
      figma.ui.postMessage({ type: 'pull-error', message: 'Legacy snapshot format detected. Please commit this design again using the updated plugin first.' });
      return;
    }

    const pages = doc?.document?.children ?? [];
    if (pages.length === 0) {
      figma.ui.postMessage({ type: 'pull-error', message: 'No pages found in snapshot.' }); return;
    }
    const currentPage = figma.currentPage;
    currentPage.name = pages[0].name ?? currentPage.name;
    for (const child of [...currentPage.children]) child.remove();

    const topNodes = pages[0].children ?? [];
    let restored = 0;
    for (const nodeData of topNodes) {
      await buildNode(nodeData, currentPage);
      restored++;
      figma.ui.postMessage({ type: 'pull-progress', message: `Restored ${restored}/${topNodes.length} nodes...` });
    }
    if (currentPage.children.length > 0) figma.viewport.scrollAndZoomIntoView(currentPage.children as SceneNode[]);
    figma.ui.postMessage({ type: 'pull-success', count: restored });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MESSAGE HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  figma.ui.onmessage = async (msg: any) => {
    if (msg.type === 'save-pat') {
      await figma.clientStorage.setAsync('github_pat', msg.pat);
    } else if (msg.type === 'save-repo') {
      if (msg.repo)   figma.root.setPluginData('github_repo',   msg.repo);
      if (msg.branch) figma.root.setPluginData('github_branch', msg.branch);
    } else if (msg.type === 'logout') {
      await figma.clientStorage.deleteAsync('github_pat');
      figma.root.setPluginData('github_repo', '');
      figma.root.setPluginData('github_branch', '');
    } else if (msg.type === 'resize' && msg.width && msg.height) {
      figma.ui.resize(msg.width, msg.height);
    } else if (msg.type === 'request-file-key') {
      figma.ui.postMessage({ type: 'file-key', fileKey: figma.fileKey ?? null });
    } else if (msg.type === 'serialize-and-commit') {
      figma.ui.postMessage({ type: 'commit-payload', pat: msg.pat, repo: msg.repo, branch: msg.branch, fileKey: figma.fileKey ?? null, message: msg.summary || `GitLayer: Sync "${figma.currentPage.name}"`, source: msg.source });
    } else if (msg.type === 'pull-from-github') {
      try { await deserializeDocument(msg.doc); }
      catch (err: any) { figma.ui.postMessage({ type: 'pull-error', message: err?.message ?? 'Unknown error.' }); }
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    }
  };
}
