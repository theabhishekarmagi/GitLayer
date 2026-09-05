"use strict";
// GitLayer - Main Plugin Code
// Complete in-engine serializer and deserializer for high-fidelity Git sync
if (figma.editorType === 'figma') {
    figma.showUI(__html__, { width: 320, height: 420 });
    // ─────────────────────────────────────────────────────────────────────────────
    // SERIALIZER — Captures full node hierarchy & styling directly from Figma canvas
    // ─────────────────────────────────────────────────────────────────────────────
    function serializeNode(node) {
        const data = {
            id: node.id,
            name: node.name,
            type: node.type,
            visible: node.visible,
            locked: node.locked,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            opacity: 'opacity' in node ? node.opacity : 1,
            blendMode: 'blendMode' in node ? node.blendMode : 'NORMAL'
        };
        if ('rotation' in node && typeof node.rotation === 'number') {
            data.rotation = node.rotation;
        }
        // Fills
        if ('fills' in node && Array.isArray(node.fills)) {
            data.fills = node.fills.map((fill) => {
                if (fill.type === 'SOLID' && fill.color) {
                    return {
                        type: 'SOLID',
                        color: { r: fill.color.r, g: fill.color.g, b: fill.color.b },
                        opacity: fill.opacity ?? 1,
                        visible: fill.visible ?? true,
                        blendMode: fill.blendMode ?? 'NORMAL'
                    };
                }
                else if (fill.type === 'IMAGE' && fill.imageHash) {
                    return {
                        type: 'IMAGE',
                        imageHash: fill.imageHash,
                        scaleMode: fill.scaleMode,
                        opacity: fill.opacity ?? 1,
                        visible: fill.visible ?? true
                    };
                }
                else if (fill.type.startsWith('GRADIENT')) {
                    const gf = fill;
                    return {
                        type: gf.type,
                        gradientTransform: gf.gradientTransform,
                        gradientStops: (gf.gradientStops || []).map(s => ({
                            position: s.position,
                            color: s.color ? { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a ?? 1 } : { r: 0, g: 0, b: 0, a: 1 }
                        })),
                        opacity: gf.opacity ?? 1,
                        visible: gf.visible ?? true
                    };
                }
                return { type: fill.type };
            });
        }
        // Strokes
        if ('strokes' in node && Array.isArray(node.strokes)) {
            data.strokes = node.strokes.map((stroke) => {
                if (stroke.type === 'SOLID') {
                    return {
                        type: 'SOLID',
                        color: { r: stroke.color.r, g: stroke.color.g, b: stroke.color.b },
                        opacity: stroke.opacity ?? 1,
                        visible: stroke.visible ?? true
                    };
                }
                return { type: stroke.type };
            });
        }
        if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
            data.strokeWeight = node.strokeWeight;
        }
        if ('strokeAlign' in node)
            data.strokeAlign = node.strokeAlign;
        if ('dashPattern' in node && Array.isArray(node.dashPattern)) {
            data.strokeDashes = Array.from(node.dashPattern);
        }
        // Corner radius
        if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
            data.cornerRadius = node.cornerRadius;
        }
        if ('topLeftRadius' in node) {
            data.rectangleCornerRadii = [
                node.topLeftRadius,
                node.topRightRadius,
                node.bottomRightRadius,
                node.bottomLeftRadius
            ];
        }
        // Effects (shadows, blur)
        if ('effects' in node && Array.isArray(node.effects)) {
            data.effects = node.effects.map((eff) => {
                if ((eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') && eff.color) {
                    return {
                        type: eff.type,
                        color: { r: eff.color.r, g: eff.color.g, b: eff.color.b, a: eff.color.a ?? 1 },
                        offset: { x: eff.offset?.x ?? 0, y: eff.offset?.y ?? 0 },
                        radius: eff.radius ?? 0,
                        spread: eff.spread ?? 0,
                        visible: eff.visible ?? true
                    };
                }
                else if (eff.type === 'LAYER_BLUR' || eff.type === 'BACKGROUND_BLUR') {
                    return {
                        type: eff.type,
                        radius: eff.radius ?? 0,
                        visible: eff.visible ?? true
                    };
                }
                return { type: eff.type };
            });
        }
        // Constraints
        if ('constraints' in node) {
            data.constraints = {
                horizontal: node.constraints.horizontal,
                vertical: node.constraints.vertical
            };
        }
        // Auto layout
        if ('layoutMode' in node) {
            const fn = node;
            data.layoutMode = fn.layoutMode;
            data.primaryAxisSizingMode = fn.primaryAxisSizingMode;
            data.counterAxisSizingMode = fn.counterAxisSizingMode;
            data.primaryAxisAlignItems = fn.primaryAxisAlignItems;
            data.counterAxisAlignItems = fn.counterAxisAlignItems;
            data.paddingTop = fn.paddingTop;
            data.paddingBottom = fn.paddingBottom;
            data.paddingLeft = fn.paddingLeft;
            data.paddingRight = fn.paddingRight;
            data.itemSpacing = fn.itemSpacing;
            data.clipsContent = fn.clipsContent;
        }
        // Text properties
        if (node.type === 'TEXT') {
            const tn = node;
            data.characters = tn.characters || '';
            let isBold = false;
            let isItalic = false;
            let family = 'Inter';
            try {
                if (tn.fontName !== figma.mixed && tn.fontName && typeof tn.fontName === 'object') {
                    family = tn.fontName.family || 'Inter';
                    const style = (tn.fontName.style || '').toLowerCase();
                    isBold = style.includes('bold');
                    isItalic = style.includes('italic');
                }
            }
            catch { }
            const fontSize = tn.fontSize !== figma.mixed && typeof tn.fontSize === 'number' ? tn.fontSize : 14;
            data.style = {
                fontFamily: family,
                fontWeight: isBold ? 700 : 400,
                italic: isItalic,
                fontSize: fontSize,
                textAlignHorizontal: tn.textAlignHorizontal,
                textAlignVertical: tn.textAlignVertical,
                letterSpacing: tn.letterSpacing !== figma.mixed && tn.letterSpacing ? tn.letterSpacing.value : 0,
                lineHeightPx: tn.lineHeight !== figma.mixed && tn.lineHeight ? (tn.lineHeight.unit === 'PIXELS' ? tn.lineHeight.value :
                    tn.lineHeight.unit === 'PERCENT' ? fontSize * (tn.lineHeight.value / 100) : undefined) : undefined
            };
        }
        // Geometry extras
        if (node.type === 'ELLIPSE') {
            data.arcData = node.arcData;
        }
        if (node.type === 'POLYGON') {
            data.pointCount = node.pointCount;
        }
        if (node.type === 'STAR') {
            data.pointCount = node.pointCount;
            data.innerRadius = node.innerRadius;
        }
        if (node.type === 'VECTOR') {
            try {
                data.vectorNetwork = node.vectorNetwork;
            }
            catch { }
            try {
                if ('vectorPaths' in node) {
                    data.vectorPaths = node.vectorPaths;
                }
            }
            catch { }
        }
        if (node.type === 'BOOLEAN_OPERATION') {
            try {
                if ('vectorPaths' in node) {
                    data.vectorPaths = node.vectorPaths;
                }
            }
            catch { }
        }
        // Children recursion
        if ('children' in node) {
            data.children = node.children.map(child => serializeNode(child));
        }
        return data;
    }
    function serializeCurrentPage() {
        const page = figma.currentPage;
        const realChildren = page.children.filter(c => c.visible !== false &&
            c.type !== 'SLICE' &&
            c.getPluginData('gitlayer_preview') !== 'true' &&
            !c.name.startsWith('[GitLayer Preview]') &&
            !c.name.startsWith('[Imported]') &&
            !c.name.startsWith('__gitlayer_'));
        return {
            document: {
                children: [
                    {
                        id: page.id,
                        name: page.name,
                        type: 'CANVAS',
                        children: realChildren.map(child => serializeNode(child))
                    }
                ]
            },
            version: '2.0.0',
            timestamp: new Date().toISOString()
        };
    }
    let isExportingCanvasPreview = false;
    async function exportActiveCanvasArtifacts() {
        const page = figma.currentPage;
        if (!page || !page.children || page.children.length === 0) {
            return { pdfBase64: null, dataUrl: null };
        }
        // Clean up any stale temp export frames first
        try {
            for (const child of page.children) {
                if (child.name === '__gitlayer_temp_canvas_export__' ||
                    child.name.startsWith('__gitlayer_temp_') ||
                    child.getPluginData('gitlayer_temp_frame') === 'true') {
                    child.remove();
                }
            }
        }
        catch { }
        const exportTargets = page.children.filter(c => c.visible !== false &&
            c.type !== 'SLICE' &&
            c.getPluginData('gitlayer_preview') !== 'true' &&
            !c.name.startsWith('[GitLayer Preview]') &&
            !c.name.startsWith('[Imported]') &&
            !c.name.startsWith('__gitlayer_'));
        if (exportTargets.length === 0) {
            return { pdfBase64: null, dataUrl: null };
        }
        isExportingCanvasPreview = true;
        let tempFrame = null;
        try {
            tempFrame = figma.createFrame();
            tempFrame.name = '__gitlayer_temp_canvas_export__';
            tempFrame.setPluginData('gitlayer_temp_frame', 'true');
            tempFrame.setPluginData('gitlayer_preview', 'true');
            tempFrame.visible = false;
            tempFrame.x = -999999;
            tempFrame.y = -999999;
            tempFrame.fills = [];
            tempFrame.clipsContent = false;
            page.appendChild(tempFrame);
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const t of exportTargets) {
                if ('x' in t && 'y' in t && 'width' in t && 'height' in t) {
                    minX = Math.min(minX, t.x);
                    minY = Math.min(minY, t.y);
                    maxX = Math.max(maxX, t.x + t.width);
                    maxY = Math.max(maxY, t.y + t.height);
                }
            }
            if (!isFinite(minX) || !isFinite(minY)) {
                return { pdfBase64: null, dataUrl: null };
            }
            const pad = 40;
            for (const t of exportTargets) {
                try {
                    const clone = t.clone();
                    clone.x = t.x - minX + pad;
                    clone.y = t.y - minY + pad;
                    tempFrame.appendChild(clone);
                }
                catch (cloneErr) {
                    console.warn('[GitLayer] Failed to clone target for preview', t.name, cloneErr);
                }
            }
            if (tempFrame.children.length === 0) {
                return { pdfBase64: null, dataUrl: null };
            }
            const frameW = Math.max(100, Math.ceil(maxX - minX + pad * 2));
            const frameH = Math.max(100, Math.ceil(maxY - minY + pad * 2));
            tempFrame.resize(frameW, frameH);
            let pdfBase64 = null;
            try {
                const pdfBytes = await tempFrame.exportAsync({ format: 'PDF' });
                if (pdfBytes && pdfBytes.length > 0) {
                    pdfBase64 = figma.base64Encode(pdfBytes);
                }
            }
            catch (pdfErr) {
                console.warn('[GitLayer] Canvas PDF export failed', pdfErr);
            }
            let dataUrl = null;
            // Only invoke Figma WebGPU PNG rasterizer if PDF export failed
            if (!pdfBase64) {
                try {
                    const pngBytes = await tempFrame.exportAsync({
                        format: 'PNG',
                        constraint: { type: 'SCALE', value: 2 }
                    });
                    if (pngBytes && pngBytes.length > 0) {
                        dataUrl = `data:image/png;base64,${figma.base64Encode(pngBytes)}`;
                    }
                }
                catch (pngErr) {
                    console.warn('[GitLayer] Canvas PNG export failed', pngErr);
                }
            }
            return { pdfBase64, dataUrl };
        }
        catch (err) {
            console.error('[GitLayer] Failed to export active canvas artifacts', err);
            return { pdfBase64: null, dataUrl: null };
        }
        finally {
            if (tempFrame) {
                try {
                    tempFrame.remove();
                }
                catch { }
            }
            isExportingCanvasPreview = false;
        }
    }
    async function generateVisualPreview() {
        const page = figma.currentPage;
        const children = page.children;
        if (!children || children.length === 0)
            return null;
        // Filter to visible top-level nodes (up to 50 nodes, excluding SLICE export tools and preview frames)
        const exportTargets = children.filter(c => c.visible !== false && c.type !== 'SLICE' && c.getPluginData('gitlayer_preview') !== 'true').slice(0, 50);
        if (exportTargets.length === 0)
            return null;
        try {
            const items = await Promise.all(exportTargets.map(async (child) => {
                if (!('x' in child && 'y' in child && 'width' in child && 'height' in child)) {
                    return null;
                }
                if (child.width <= 0 || child.height <= 0)
                    return null;
                // Attempt native vector SVG export directly from Figma C++ engine
                try {
                    const svgString = await child.exportAsync({ format: 'SVG_STRING', svgOutlineText: true });
                    if (svgString && svgString.length > 0) {
                        return {
                            id: child.id,
                            name: child.name,
                            x: child.x,
                            y: child.y,
                            width: child.width,
                            height: child.height,
                            svg: svgString
                        };
                    }
                }
                catch (svgErr) {
                    // If SVG export fails for this specific node, fall back to high-res PNG
                }
                // Raster fallback: 2x high-resolution PNG
                try {
                    const bytes = await child.exportAsync({
                        format: 'PNG',
                        constraint: { type: 'SCALE', value: 2 }
                    });
                    const base64 = figma.base64Encode(bytes);
                    return {
                        id: child.id,
                        name: child.name,
                        x: child.x,
                        y: child.y,
                        width: child.width,
                        height: child.height,
                        dataUrl: `data:image/png;base64,${base64}`
                    };
                }
                catch {
                    return null;
                }
            }));
            const valid = items.filter(Boolean);
            return valid.length > 0 ? valid : null;
        }
        catch (e) {
            console.error('[GitLayer] Failed to export visual preview', e);
            return null;
        }
    }
    let isSendingPreview = false;
    async function sendPreview() {
        if (isSendingPreview)
            return;
        isSendingPreview = true;
        try {
            const payload = serializeCurrentPage();
            const { pdfBase64, dataUrl } = await exportActiveCanvasArtifacts();
            const thumbnails = pdfBase64 ? null : await generateVisualPreview();
            figma.ui.postMessage({
                type: 'preview-payload',
                payload: payload,
                pdfBase64: pdfBase64,
                dataUrl: dataUrl,
                thumbnails: thumbnails
            });
        }
        catch (e) {
            console.error('[GitLayer] Failed to send preview payload', e);
        }
        finally {
            isSendingPreview = false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // DESERIALIZER — Reconstructs nodes on canvas
    // ─────────────────────────────────────────────────────────────────────────────
    function applyCommonProps(node, data) {
        const w = data.width ?? data.absoluteBoundingBox?.width ?? 100;
        const h = data.height ?? data.absoluteBoundingBox?.height ?? 100;
        const x = data.x ?? data.absoluteBoundingBox?.x ?? 0;
        const y = data.y ?? data.absoluteBoundingBox?.y ?? 0;
        if ('resize' in node && typeof w === 'number' && typeof h === 'number') {
            try {
                node.resize(Math.max(1, w), Math.max(1, h));
            }
            catch (e) { }
        }
        if ('x' in node && typeof x === 'number')
            node.x = x;
        if ('y' in node && typeof y === 'number')
            node.y = y;
        if (data.name && 'name' in node)
            node.name = data.name;
        if (data.opacity !== undefined && 'opacity' in node)
            node.opacity = data.opacity;
        if (data.visible !== undefined && 'visible' in node)
            node.visible = data.visible;
        if (data.rotation !== undefined && 'rotation' in node)
            node.rotation = data.rotation;
        if (data.blendMode && 'blendMode' in node)
            node.blendMode = data.blendMode;
        if (data.locked !== undefined && 'locked' in node)
            node.locked = data.locked;
        if (data.clipsContent !== undefined && 'clipsContent' in node)
            node.clipsContent = data.clipsContent;
        // Fills
        if ('fills' in node) {
            if (Array.isArray(data.fills) && data.fills.length > 0) {
                const paints = [];
                for (const fill of data.fills) {
                    if (fill.type === 'SOLID' && fill.color) {
                        paints.push({
                            type: 'SOLID',
                            color: { r: fill.color.r, g: fill.color.g, b: fill.color.b },
                            opacity: fill.opacity ?? 1,
                            visible: fill.visible ?? true,
                            blendMode: fill.blendMode ?? 'NORMAL'
                        });
                    }
                    else if (['GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'GRADIENT_ANGULAR', 'GRADIENT_DIAMOND'].includes(fill.type)) {
                        paints.push({
                            type: fill.type,
                            gradientTransform: fill.gradientTransform ?? [[1, 0, 0], [0, 1, 0]],
                            gradientStops: (fill.gradientStops || []).map((s) => ({
                                position: s.position,
                                color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a ?? 1 }
                            })),
                            visible: fill.visible ?? true,
                            opacity: fill.opacity ?? 1,
                            blendMode: fill.blendMode ?? 'NORMAL'
                        });
                    }
                    else if (fill.type === 'IMAGE' && fill.imageHash) {
                        try {
                            const img = figma.getImageByHash(fill.imageHash);
                            if (img) {
                                paints.push({
                                    type: 'IMAGE',
                                    imageHash: fill.imageHash,
                                    scaleMode: fill.scaleMode ?? 'FILL',
                                    visible: fill.visible ?? true,
                                    opacity: fill.opacity ?? 1
                                });
                            }
                        }
                        catch (e) { }
                    }
                }
                node.fills = paints;
            }
            else {
                // Clear default white/grey Figma fills on transparent frames and shapes
                node.fills = [];
            }
        }
        // Strokes
        if ('strokes' in node) {
            if (Array.isArray(data.strokes) && data.strokes.length > 0) {
                const sp = data.strokes
                    .filter((s) => s.type === 'SOLID' && s.color)
                    .map((s) => ({
                    type: 'SOLID',
                    color: { r: s.color.r, g: s.color.g, b: s.color.b },
                    opacity: s.opacity ?? 1,
                    visible: s.visible ?? true,
                    blendMode: s.blendMode ?? 'NORMAL'
                }));
                node.strokes = sp;
            }
            else {
                node.strokes = [];
            }
        }
        if ('strokeWeight' in node && data.strokeWeight !== undefined)
            node.strokeWeight = data.strokeWeight;
        if ('strokeAlign' in node && data.strokeAlign)
            node.strokeAlign = data.strokeAlign;
        if ('dashPattern' in node && Array.isArray(data.strokeDashes))
            node.dashPattern = data.strokeDashes;
        // Corners
        if ('cornerRadius' in node && data.cornerRadius !== undefined)
            node.cornerRadius = data.cornerRadius;
        if ('topLeftRadius' in node && Array.isArray(data.rectangleCornerRadii)) {
            node.topLeftRadius = data.rectangleCornerRadii[0] ?? 0;
            node.topRightRadius = data.rectangleCornerRadii[1] ?? 0;
            node.bottomRightRadius = data.rectangleCornerRadii[2] ?? 0;
            node.bottomLeftRadius = data.rectangleCornerRadii[3] ?? 0;
        }
        // Effects
        if ('effects' in node && Array.isArray(data.effects) && data.effects.length > 0) {
            const effects = [];
            for (const e of data.effects) {
                if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
                    effects.push({
                        type: e.type,
                        color: { r: e.color.r, g: e.color.g, b: e.color.b, a: e.color.a ?? 1 },
                        offset: { x: e.offset?.x ?? 0, y: e.offset?.y ?? 0 },
                        radius: e.radius ?? 0,
                        spread: e.spread ?? 0,
                        visible: e.visible ?? true,
                        blendMode: e.blendMode ?? 'NORMAL',
                        showShadowBehindNode: false
                    });
                }
                else if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') {
                    effects.push({ type: e.type, radius: e.radius ?? 0, visible: e.visible ?? true });
                }
            }
            if (effects.length > 0)
                node.effects = effects;
        }
        // Constraints
        if ('constraints' in node && data.constraints) {
            node.constraints = {
                horizontal: data.constraints.horizontal ?? 'LEFT',
                vertical: data.constraints.vertical ?? 'TOP'
            };
        }
    }
    function applyAutoLayout(frame, data) {
        if (!data.layoutMode || data.layoutMode === 'NONE')
            return;
        frame.layoutMode = data.layoutMode;
        frame.primaryAxisSizingMode = data.primaryAxisSizingMode ?? 'AUTO';
        frame.counterAxisSizingMode = data.counterAxisSizingMode ?? 'AUTO';
        frame.primaryAxisAlignItems = data.primaryAxisAlignItems ?? 'MIN';
        frame.counterAxisAlignItems = data.counterAxisAlignItems ?? 'MIN';
        frame.paddingTop = data.paddingTop ?? 0;
        frame.paddingBottom = data.paddingBottom ?? 0;
        frame.paddingLeft = data.paddingLeft ?? 0;
        frame.paddingRight = data.paddingRight ?? 0;
        frame.itemSpacing = data.itemSpacing ?? 0;
    }
    async function applyTextProps(textNode, data) {
        const family = data.style?.fontFamily ?? 'Inter';
        const weight = data.style?.fontWeight ?? 400;
        const italic = data.style?.italic ?? false;
        let style = 'Regular';
        if (weight >= 700 && italic)
            style = 'Bold Italic';
        else if (weight >= 700)
            style = 'Bold';
        else if (italic)
            style = 'Italic';
        try {
            await figma.loadFontAsync({ family, style });
        }
        catch {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            style = 'Regular';
        }
        try {
            textNode.fontName = { family, style };
        }
        catch {
            textNode.fontName = { family: 'Inter', style: 'Regular' };
        }
        textNode.characters = data.characters ?? '';
        if (data.style) {
            const s = data.style;
            try {
                textNode.fontSize = s.fontSize ?? 14;
            }
            catch { }
            if (s.textAlignHorizontal)
                try {
                    textNode.textAlignHorizontal = s.textAlignHorizontal;
                }
                catch { }
            if (s.textAlignVertical)
                try {
                    textNode.textAlignVertical = s.textAlignVertical;
                }
                catch { }
            if (s.letterSpacing !== undefined)
                try {
                    textNode.letterSpacing = { value: s.letterSpacing, unit: 'PIXELS' };
                }
                catch { }
            if (s.lineHeightPx !== undefined)
                try {
                    textNode.lineHeight = { value: s.lineHeightPx, unit: 'PIXELS' };
                }
                catch { }
            else
                try {
                    textNode.lineHeight = { unit: 'AUTO' };
                }
                catch { }
        }
        if (Array.isArray(data.fills) && data.fills.length > 0) {
            const f = data.fills[0];
            if (f.type === 'SOLID' && f.color) {
                textNode.fills = [{
                        type: 'SOLID',
                        color: { r: f.color.r, g: f.color.g, b: f.color.b },
                        opacity: f.opacity ?? 1,
                        visible: true,
                        blendMode: 'NORMAL'
                    }];
            }
        }
    }
    async function buildNode(data, parent) {
        try {
            switch (data.type) {
                case 'FRAME':
                case 'COMPONENT':
                case 'COMPONENT_SET':
                case 'INSTANCE': {
                    const frame = figma.createFrame();
                    parent.appendChild(frame);
                    applyCommonProps(frame, data);
                    if (Array.isArray(data.layoutGrids))
                        try {
                            frame.layoutGrids = data.layoutGrids;
                        }
                        catch { }
                    if (data.children) {
                        for (const c of data.children)
                            await buildNode(c, frame);
                    }
                    applyAutoLayout(frame, data);
                    return frame;
                }
                case 'GROUP': {
                    const kids = [];
                    if (data.children) {
                        for (const c of data.children) {
                            const b = await buildNode(c, parent);
                            if (b)
                                kids.push(b);
                        }
                    }
                    if (kids.length === 0)
                        return null;
                    const group = figma.group(kids, parent);
                    if (data.name)
                        group.name = data.name;
                    if (data.opacity !== undefined)
                        group.opacity = data.opacity;
                    return group;
                }
                case 'TEXT': {
                    const text = figma.createText();
                    parent.appendChild(text);
                    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
                    applyCommonProps(text, data);
                    await applyTextProps(text, data);
                    return text;
                }
                case 'RECTANGLE': {
                    const r = figma.createRectangle();
                    parent.appendChild(r);
                    applyCommonProps(r, data);
                    return r;
                }
                case 'ELLIPSE': {
                    const e = figma.createEllipse();
                    parent.appendChild(e);
                    applyCommonProps(e, data);
                    if (data.arcData)
                        e.arcData = data.arcData;
                    return e;
                }
                case 'POLYGON': {
                    const p = figma.createPolygon();
                    parent.appendChild(p);
                    applyCommonProps(p, data);
                    if (data.pointCount)
                        p.pointCount = data.pointCount;
                    return p;
                }
                case 'STAR': {
                    const s = figma.createStar();
                    parent.appendChild(s);
                    applyCommonProps(s, data);
                    if (data.pointCount)
                        s.pointCount = data.pointCount;
                    if (data.innerRadius)
                        s.innerRadius = data.innerRadius;
                    return s;
                }
                case 'LINE': {
                    const l = figma.createLine();
                    parent.appendChild(l);
                    applyCommonProps(l, data);
                    return l;
                }
                case 'VECTOR': {
                    const v = figma.createVector();
                    parent.appendChild(v);
                    let vectorSet = false;
                    if (data.vectorPaths && Array.isArray(data.vectorPaths) && data.vectorPaths.length > 0) {
                        try {
                            v.vectorPaths = data.vectorPaths;
                            vectorSet = true;
                        }
                        catch (vpErr) {
                            console.warn('[GitLayer] vectorPaths failed', vpErr);
                        }
                    }
                    if (!vectorSet && data.vectorNetwork) {
                        try {
                            if (typeof v.setVectorNetworkAsync === 'function') {
                                await v.setVectorNetworkAsync(data.vectorNetwork);
                            }
                            else {
                                v.vectorNetwork = data.vectorNetwork;
                            }
                        }
                        catch (vnErr) {
                            console.warn('[GitLayer] vectorNetwork failed', vnErr);
                        }
                    }
                    applyCommonProps(v, data);
                    return v;
                }
                case 'BOOLEAN_OPERATION': {
                    if (data.vectorPaths && Array.isArray(data.vectorPaths) && data.vectorPaths.length > 0) {
                        const v = figma.createVector();
                        parent.appendChild(v);
                        try {
                            v.vectorPaths = data.vectorPaths;
                        }
                        catch (e) { }
                        applyCommonProps(v, data);
                        return v;
                    }
                    const kids = [];
                    if (data.children) {
                        for (const c of data.children) {
                            const b = await buildNode(c, parent);
                            if (b)
                                kids.push(b);
                        }
                    }
                    if (kids.length === 0)
                        return null;
                    if (kids.length === 1) {
                        applyCommonProps(kids[0], data);
                        return kids[0];
                    }
                    try {
                        const flat = figma.flatten(kids, parent);
                        applyCommonProps(flat, data);
                        return flat;
                    }
                    catch {
                        return null;
                    }
                }
                default:
                    console.log('[GitLayer] Skipping unsupported type:', data.type);
                    return null;
            }
        }
        catch (err) {
            console.error('[GitLayer] Error building node', data.type, err);
            return null;
        }
    }
    async function deserializeDocument(doc) {
        if (doc.pageName && doc.nodes) {
            figma.ui.postMessage({
                type: 'pull-error',
                message: 'Legacy snapshot format detected. Please commit this design again using the updated plugin first.'
            });
            return;
        }
        const pages = doc?.document?.children ?? [];
        if (pages.length === 0) {
            figma.ui.postMessage({ type: 'pull-error', message: 'No pages found in snapshot.' });
            return;
        }
        const currentPage = figma.currentPage;
        currentPage.name = pages[0].name ?? currentPage.name;
        // Remove existing nodes on canvas
        for (const child of [...currentPage.children])
            child.remove();
        const topNodes = pages[0].children ?? [];
        let restored = 0;
        for (const nodeData of topNodes) {
            await buildNode(nodeData, currentPage);
            restored++;
            figma.ui.postMessage({
                type: 'pull-progress',
                message: `Restored ${restored}/${topNodes.length} nodes...`
            });
        }
        if (currentPage.children.length > 0) {
            figma.viewport.scrollAndZoomIntoView(currentPage.children);
        }
        figma.ui.postMessage({ type: 'pull-success', count: restored });
    }
    async function importCommitBesideCurrent(doc, commitInfo) {
        if (doc.pageName && doc.nodes) {
            figma.ui.postMessage({
                type: 'import-error',
                message: 'Legacy snapshot format detected in this commit.'
            });
            return;
        }
        const pages = doc?.document?.children ?? [];
        if (pages.length === 0) {
            figma.ui.postMessage({ type: 'import-error', message: 'No pages found in snapshot.' });
            return;
        }
        const currentPage = figma.currentPage;
        // Clean up any existing preview frame from canvas first
        const existingPreviews = currentPage.children.filter(c => c.getPluginData('gitlayer_preview') === 'true');
        for (const p of existingPreviews) {
            try {
                p.remove();
            }
            catch { }
        }
        // Calculate bounding box of existing canvas children so we don't overlap!
        let maxX = 0;
        let minY = 0;
        let hasExisting = false;
        for (const child of currentPage.children) {
            if ('x' in child && 'width' in child && 'y' in child) {
                hasExisting = true;
                maxX = Math.max(maxX, child.x + child.width);
                minY = Math.min(minY, child.y);
            }
        }
        const offsetX = hasExisting ? maxX + 160 : 0;
        const offsetY = hasExisting ? minY : 0;
        const shortSha = commitInfo.sha.substring(0, 7);
        const title = commitInfo.message.split('\n')[0] || 'Historical Commit';
        // Create a container Frame for this historical version
        const container = figma.createFrame();
        container.name = `[GitLayer Preview] ${title} (${shortSha})`;
        container.setPluginData('gitlayer_preview', 'true');
        container.x = offsetX;
        container.y = offsetY;
        container.fills = []; // Transparent background
        container.clipsContent = false;
        container.strokes = [{
                type: 'SOLID',
                color: { r: 0.18, g: 0.5, b: 0.97 }, // #2f81f7 GitHub blue
                opacity: 0.9
            }];
        container.strokeWeight = 2;
        container.dashPattern = [8, 4];
        container.cornerRadius = 8;
        currentPage.appendChild(container);
        const topNodes = pages[0].children ?? [];
        let restored = 0;
        for (const nodeData of topNodes) {
            await buildNode(nodeData, container);
            restored++;
            figma.ui.postMessage({
                type: 'import-progress',
                message: `Importing ${restored}/${topNodes.length} nodes...`
            });
            figma.ui.postMessage({
                type: 'preview-canvas-progress',
                message: `Building on canvas ${restored}/${topNodes.length}...`
            });
        }
        // Auto-fit container around its imported children
        let innerMaxX = 100;
        let innerMaxY = 100;
        for (const c of container.children) {
            if ('x' in c && 'width' in c && 'y' in c && 'height' in c) {
                innerMaxX = Math.max(innerMaxX, c.x + c.width);
                innerMaxY = Math.max(innerMaxY, c.y + c.height);
            }
        }
        container.resize(Math.max(200, innerMaxX + 40), Math.max(200, innerMaxY + 40));
        // Focus & select the imported version
        currentPage.selection = [container];
        figma.viewport.scrollAndZoomIntoView([container]);
        figma.ui.postMessage({
            type: 'import-success',
            sha: shortSha,
            title: title,
            count: restored
        });
        figma.ui.postMessage({
            type: 'preview-canvas-success',
            sha: shortSha,
            title: title,
            count: restored
        });
    }
    function dismissCanvasPreview() {
        const currentPage = figma.currentPage;
        const existingPreviews = currentPage.children.filter(c => c.getPluginData('gitlayer_preview') === 'true' ||
            c.name.startsWith('[GitLayer Preview]') ||
            c.name.startsWith('[Imported]'));
        let count = 0;
        for (const p of existingPreviews) {
            try {
                p.remove();
                count++;
            }
            catch { }
        }
        figma.ui.postMessage({
            type: 'preview-canvas-dismissed',
            count: count
        });
    }
    let isRenderingCommitImage = false;
    async function renderCommitToArtifacts(doc) {
        if (doc?.previewPdf && typeof doc.previewPdf === 'string') {
            return { dataUrl: doc.previewImage || null, pdfBase64: doc.previewPdf };
        }
        const pages = doc?.document?.children ?? [];
        if (pages.length === 0)
            return { dataUrl: null, pdfBase64: null };
        const topNodes = (pages[0].children ?? []).filter((n) => n.visible !== false && n.type !== 'SLICE');
        if (topNodes.length === 0)
            return { dataUrl: null, pdfBase64: null };
        isRenderingCommitImage = true;
        let tempFrame = null;
        try {
            // Clean up any stale temp render frames first
            try {
                for (const child of figma.currentPage.children) {
                    if (child.name === '__gitlayer_temp_render__' || child.name.startsWith('__gitlayer_temp_') || child.getPluginData('gitlayer_temp_frame') === 'true') {
                        child.remove();
                    }
                }
            }
            catch { }
            tempFrame = figma.createFrame();
            tempFrame.name = '__gitlayer_temp_render__';
            tempFrame.setPluginData('gitlayer_temp_frame', 'true');
            tempFrame.setPluginData('gitlayer_preview', 'true');
            tempFrame.visible = false;
            tempFrame.x = -999999;
            tempFrame.y = -999999;
            tempFrame.fills = [];
            tempFrame.clipsContent = false;
            figma.currentPage.appendChild(tempFrame);
            for (const nodeData of topNodes) {
                await buildNode(nodeData, tempFrame);
            }
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const c of tempFrame.children) {
                if ('x' in c && 'y' in c && 'width' in c && 'height' in c) {
                    minX = Math.min(minX, c.x);
                    minY = Math.min(minY, c.y);
                    maxX = Math.max(maxX, c.x + c.width);
                    maxY = Math.max(maxY, c.y + c.height);
                }
            }
            if (!isFinite(minX) || !isFinite(minY)) {
                return { dataUrl: null, pdfBase64: null };
            }
            const pad = 40;
            for (const c of tempFrame.children) {
                c.x = c.x - minX + pad;
                c.y = c.y - minY + pad;
            }
            const frameW = Math.max(100, Math.ceil(maxX - minX + pad * 2));
            const frameH = Math.max(100, Math.ceil(maxY - minY + pad * 2));
            tempFrame.resize(frameW, frameH);
            // 1. Native Vector PDF export from Figma engine
            let pdfBase64 = null;
            try {
                const pdfBytes = await tempFrame.exportAsync({ format: 'PDF' });
                if (pdfBytes && pdfBytes.length > 0) {
                    pdfBase64 = figma.base64Encode(pdfBytes);
                }
            }
            catch (pdfErr) {
                console.warn('[GitLayer] PDF export failed', pdfErr);
            }
            // 2. 2x PNG export fallback (only if PDF export failed)
            let dataUrl = null;
            if (!pdfBase64) {
                try {
                    const pngBytes = await tempFrame.exportAsync({
                        format: 'PNG',
                        constraint: { type: 'SCALE', value: 2 }
                    });
                    if (pngBytes && pngBytes.length > 0) {
                        dataUrl = `data:image/png;base64,${figma.base64Encode(pngBytes)}`;
                    }
                }
                catch (pngErr) {
                    console.warn('[GitLayer] PNG export failed', pngErr);
                }
            }
            return { dataUrl, pdfBase64 };
        }
        catch (err) {
            console.error('[GitLayer] Failed to render commit artifacts', err);
            return { dataUrl: null, pdfBase64: null };
        }
        finally {
            if (tempFrame) {
                try {
                    tempFrame.remove();
                }
                catch { }
            }
            isRenderingCommitImage = false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // INIT & DOCUMENT CHANGE LISTENER
    // ─────────────────────────────────────────────────────────────────────────────
    async function init() {
        // Clean up any stale temp export or render frames from previous plugin runs
        try {
            for (const child of figma.currentPage.children) {
                if (child.name === '__gitlayer_temp_canvas_export__' ||
                    child.name === '__gitlayer_temp_render__' ||
                    child.name.startsWith('__gitlayer_temp_') ||
                    child.getPluginData('gitlayer_temp_frame') === 'true') {
                    child.remove();
                }
            }
        }
        catch { }
        const pat = await figma.clientStorage.getAsync('github_pat');
        const repo = figma.root.getPluginData('github_repo');
        const branch = figma.root.getPluginData('github_branch') || 'main';
        figma.ui.postMessage({
            type: 'init-state',
            pat,
            repo,
            branch
        });
        // Send initial diff preview
        sendPreview();
        try {
            await figma.loadAllPagesAsync();
            let previewTimeout = null;
            figma.on('documentchange', () => {
                if (isRenderingCommitImage || isExportingCanvasPreview)
                    return;
                if (previewTimeout !== null)
                    clearTimeout(previewTimeout);
                previewTimeout = setTimeout(() => {
                    sendPreview();
                    previewTimeout = null;
                }, 500);
            });
        }
        catch (e) {
            console.error('Failed to init change listener', e);
        }
    }
    init();
    // ─────────────────────────────────────────────────────────────────────────────
    // MESSAGE HANDLER
    // ─────────────────────────────────────────────────────────────────────────────
    figma.ui.onmessage = async (msg) => {
        if (msg.type === 'save-pat') {
            await figma.clientStorage.setAsync('github_pat', msg.pat);
        }
        else if (msg.type === 'save-repo') {
            if (msg.repo)
                figma.root.setPluginData('github_repo', msg.repo);
            if (msg.branch)
                figma.root.setPluginData('github_branch', msg.branch);
        }
        else if (msg.type === 'logout') {
            await figma.clientStorage.deleteAsync('github_pat');
            figma.root.setPluginData('github_repo', '');
            figma.root.setPluginData('github_branch', '');
        }
        else if (msg.type === 'resize' && msg.width && msg.height) {
            figma.ui.resize(msg.width, msg.height);
        }
        else if (msg.type === 'request-preview') {
            sendPreview();
        }
        else if (msg.type === 'serialize-and-commit') {
            const payload = serializeCurrentPage();
            const { pdfBase64, dataUrl } = await exportActiveCanvasArtifacts();
            if (pdfBase64) {
                payload.previewPdf = pdfBase64;
            }
            if (dataUrl) {
                payload.previewImage = dataUrl;
            }
            if (!pdfBase64) {
                const thumbnails = await generateVisualPreview();
                if (thumbnails) {
                    payload.thumbnails = thumbnails;
                }
            }
            figma.ui.postMessage({
                type: 'commit-payload',
                pat: msg.pat,
                repo: msg.repo,
                branch: msg.branch,
                payload: payload,
                message: msg.summary || `GitLayer: Sync "${figma.currentPage.name}"`,
                source: msg.source
            });
        }
        else if (msg.type === 'pull-from-github') {
            try {
                await deserializeDocument(msg.doc);
            }
            catch (err) {
                figma.ui.postMessage({ type: 'pull-error', message: err?.message ?? 'Unknown error.' });
            }
        }
        else if (msg.type === 'import-commit-to-canvas' || msg.type === 'preview-commit-on-canvas') {
            try {
                await importCommitBesideCurrent(msg.doc, msg.commit);
            }
            catch (err) {
                figma.ui.postMessage({ type: 'preview-canvas-error', message: err?.message ?? 'Canvas preview failed.' });
            }
        }
        else if (msg.type === 'dismiss-canvas-preview') {
            dismissCanvasPreview();
            try {
                for (const child of figma.currentPage.children) {
                    if (child.name.startsWith('__gitlayer_') || child.getPluginData('gitlayer_temp_frame') === 'true') {
                        child.remove();
                    }
                }
            }
            catch { }
        }
        else if (msg.type === 'render-commit-image' || msg.type === 'render-commit-pdf') {
            try {
                const { dataUrl, pdfBase64 } = await renderCommitToArtifacts(msg.doc);
                figma.ui.postMessage({
                    type: 'history-rendered-image',
                    sha: msg.sha,
                    dataUrl: dataUrl,
                    pdfBase64: pdfBase64
                });
            }
            catch (err) {
                figma.ui.postMessage({
                    type: 'history-rendered-image',
                    sha: msg.sha,
                    dataUrl: null,
                    pdfBase64: null
                });
            }
        }
        else if (msg.type === 'cancel') {
            figma.closePlugin();
        }
    };
}
