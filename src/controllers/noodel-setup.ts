import NoodeDefinition from '../model/NoodeDefinition';
import NoodelOptions from '../model/NoodelOptions';
import NoodeView from '../model/NoodeView';
import NoodelView from '@/model/NoodelView';
import { ResizeSensor } from 'css-element-queries';
import { showActiveSubtree } from './noodel-mutate';
import IdRegister from '@/main/IdRegister';
import { setupRouting, unsetRouting } from './noodel-routing';
import { jumpToNoode } from './noodel-navigate';

export function setupNoodel(idRegister: IdRegister, root: NoodeDefinition, options: NoodelOptions): NoodelView {

    let rootNoode = buildNoodeView(idRegister, root, 1, 0, null);

    rootNoode.isActive = true;
    rootNoode.isFocalParent = true;

    let noodel: NoodelView = {
        root: rootNoode,
        focalParent: rootNoode,
        focalLevel: 1,
        
        trunkOffset: 0,
        trunkOffsetAligned: 0,
        trunkOffsetForced: null,
    
        showLimits: {
            top: false,
            bottom: false,
            left: false,
            right: false
        },
        panOffsetOriginTrunk: null,
        panOffsetOriginFocalBranch: null,
        panAxis: null,
        hasPress: false,
        isFirstRenderDone: false,

        containerSize: {
            x: 0,
            y: 0
        },
        
        options: {
            visibleSubtreeDepth: 1,
            swipeFrictionBranch: 0.7,
            swipeFrictionTrunk: 0.2,
            swipeWeightBranch: 100,
            swipeWeightTrunk: 100,
            useRouting: true
        }
    }

    parseAndApplyOptions(options, noodel, idRegister);
    
    showActiveSubtree(rootNoode, noodel.options.visibleSubtreeDepth);

    if (noodel.options.useRouting) {
        let hash = window.location.hash;

        if (hash) {
            let target = idRegister.findNoode(hash.substr(1));

            if (target && target.parent) {
                jumpToNoode(noodel, target);
            }
        } 
    }

    return noodel;
}

/**
 * Recursively parses the given HTML element into a noode tree. 
 */
export function parseHTMLToNoode(el: Element): NoodeDefinition {

    let id = el.getAttribute('data-id');
    let activeChildIndex = 0;
    let content = '';
    let noodeCount = 0;
    let children: NoodeDefinition[] = [];

    for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];

        if (node.nodeType === Node.TEXT_NODE) {
            content += node.textContent; // Depends on css white-space property for ignoring white spaces
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName === "DIV" && (node as Element).className.split(' ').some(c => c === 'noode')) {
                noodeCount++;

                if ((node as Element).hasAttribute('data-active')) {
                    activeChildIndex = noodeCount - 1;
                }

                children.push(parseHTMLToNoode(node as Element));
            }
            else {
                content += (node as Element).outerHTML; // Depends on css white-space property for ignoring white spaces
            }
        }
    }

    return {
        id: id,
        content: content,
        activeChildIndex: children.length > 0 ? activeChildIndex : null,
        children: children
    };
}

export function setupContainer(el: Element, noodel: NoodelView) {

    let rect = el.getBoundingClientRect();

    noodel.containerSize.x = rect.width;
    noodel.containerSize.y = rect.height;

    new ResizeSensor(el, (size) => {
        noodel.containerSize.x = size.width,
        noodel.containerSize.y = size.height
    });
}

export function parseAndApplyOptions(options: NoodelOptions, noodel: NoodelView, idReg: IdRegister) {

    if (typeof options.visibleSubtreeDepth === "number") {
        noodel.options.visibleSubtreeDepth = options.visibleSubtreeDepth;
    }

    if (typeof options.swipeWeightBranch === "number") {
        noodel.options.swipeWeightBranch = options.swipeWeightBranch;
    }

    if (typeof options.swipeWeightTrunk === "number") {
        noodel.options.swipeWeightTrunk = options.swipeWeightTrunk;
    }

    if (typeof options.swipeFrictionBranch === "number") {
        noodel.options.swipeFrictionBranch = options.swipeFrictionBranch;
    }

    if (typeof options.swipeFrictionTrunk === "number") {
        noodel.options.swipeFrictionTrunk = options.swipeFrictionTrunk;
    }

    if (typeof options.useRouting === "boolean") {
        noodel.options.useRouting = options.useRouting;
    }

    if (typeof options.mounted === "function") {
        noodel.options.mounted = options.mounted;
    }

    if (noodel.options.useRouting) {
        setupRouting(noodel, idReg);
    }
    else {
        unsetRouting(noodel);
    }
}

export function buildNoodeView(idRegister: IdRegister, def: NoodeDefinition, level: number, index: number, parent: NoodeView): NoodeView {
    
    let noodeView: NoodeView = {
        index: index,
        level: level,
        isChildrenVisible: false,
        isFocalParent: false,
        isActive: false,
        size: 0,
        trunkRelativeOffset: 0,
        childBranchOffset: 0,
        childBranchOffsetAligned: 0,
        childBranchOffsetForced: null,
        branchRelativeOffset: 0,
        branchSize: 0,
        parent: parent,
        id: typeof def.id === 'string' ? def.id : idRegister.generateNoodeId(),
        children: [],
        content: def.content || null,
        activeChildIndex: null,
        flipInvert: 0,
    }

    idRegister.registerNoode(noodeView.id, noodeView);

    if (!def.children) def.children = [];

    if (typeof def.activeChildIndex !== 'number') {
        noodeView.activeChildIndex = def.children.length > 0 ? 0 : null;
    }
    else {
        if (def.activeChildIndex < 0 || def.activeChildIndex >= def.children.length) {
            console.warn("Invalid initial active child index for noode ID " + noodeView.id);
            noodeView.activeChildIndex = def.children.length > 0 ? 0 : null;
        }
        else {
            noodeView.activeChildIndex = def.activeChildIndex;
        }
    }

    if (parent && index === parent.activeChildIndex) {
        noodeView.isActive = true;
    }

    if (Array.isArray(def.children)) {
        noodeView.children = def.children.map((n, i) => buildNoodeView(idRegister, n, level + 1, i, noodeView));
    }

    return noodeView;
}

export function extractNoodeDefinition(noode: NoodeView): NoodeDefinition {

    return {
        id: noode.id,
        content: noode.content,
        activeChildIndex: noode.activeChildIndex,
        children: noode.children.map(c => extractNoodeDefinition(c))
    };
}