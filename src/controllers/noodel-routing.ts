import NoodelState from '../types/NoodelState';
import { doJumpNavigation } from './noodel-navigate';
import { findNode } from './id-register';
import { getActiveChild } from './getters';

export function setupRouting(noodel: NoodelState) {

    if (noodel.r.onHashChanged) return;

    noodel.r.onHashChanged = () => {
        let hash = window.location.hash;

        if (hash) {
            let target = findNode(noodel, hash.substr(1));

            if (target && target.parent) {
                doJumpNavigation(noodel, target);
            }
        } 
    };

    window.addEventListener("hashchange", noodel.r.onHashChanged);
}

export function syncHashToFocalNode(noodel: NoodelState) {
    if (!noodel.options.useRouting) return;

    let focalNode = getActiveChild(noodel.focalParent);

    if (focalNode) {
        replaceHash('#' + focalNode.id);
    }
    else {
        replaceHash('');
    }
}

export function unsetRouting(noodel: NoodelState) {

    if(!noodel.r.onHashChanged) return;

    window.removeEventListener("hashchange", noodel.r.onHashChanged);
    noodel.r.onHashChanged = null;
}

/**
 * Replaces the hash fragment without triggering hashchange event.
 */
function replaceHash(newHash: string) {

    window.history.replaceState(null, '', window.location.href.split("#")[0] + newHash);
}