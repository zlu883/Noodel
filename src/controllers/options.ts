/* Module for parsing and applying noodel and node options. */

import { nextTick } from 'vue';
import NodeOptions from '../types/NodeOptions';
import NodeState from '../types/NodeState';
import NoodelOptions from '../types/NoodelOptions';
import NoodelState from '../types/NoodelState';
import { adjustTrunkMoveOffset, adjustBranchMoveOffset, resetAlignment } from './alignment';
import { isPanningTrunk, isPanningBranch, getOrientation, getBranchDirection } from './getters';
import { finalizePan } from './pan';
import { setupRouting, unsetRouting } from './routing';
import { disableBranchTransition, enableBranchTransition } from './transition';
import { traverseDescendants } from './traverse';
import { forceReflow } from './util';

export function parseAndApplyOptions(options: NoodelOptions, noodel: NoodelState) {

    let oldOrientation = getOrientation(noodel);
    let oldBranchDirection = getBranchDirection(noodel);

    noodel.options = {
        ...noodel.options,
        ...options
    }

    if (!options.useSwipeNavigation) {
        finalizePan(noodel);
    }

    if (options.anchorOffsetTrunk && isPanningTrunk(noodel)) {
        adjustTrunkMoveOffset(noodel);
    }

    if (options.anchorOffsetBranch && isPanningBranch(noodel)) {
        adjustBranchMoveOffset(noodel);
    }

    if (noodel.options.useRouting) {
        setupRouting(noodel);
    }
    else {
        unsetRouting(noodel);
    }

    if (noodel.isMounted) {
        let newOrientation = getOrientation(noodel);
        let newBranchDirection = getBranchDirection(noodel);

        if (newOrientation !== oldOrientation) {
            resetAlignment(noodel);
        }
        else if (newBranchDirection !== oldBranchDirection) {
            // prevent transition
            traverseDescendants(noodel.root, node => disableBranchTransition(noodel, node), true);
            nextTick(() => {
                forceReflow();
                traverseDescendants(noodel.root, node => enableBranchTransition(node), true)
            });
        }
    }
}

export function parseAndApplyNodeOptions(noodel: NoodelState, options: NodeOptions, node: NodeState) {

    node.options = {
        ...node.options,
        ...options
    };
}