import Noodel from "../src/main/Noodel";
import NodeCss from "../src/types/NodeCss";

const assert = chai.assert;

// Tests noodel initialization and getters

describe('Init', function () {

    describe('with no content tree', function () {
        it('should create empty noodel with 0 nodes', function () {
            assert.strictEqual(new Noodel().getNodeCount(), 0);
        });
        it('should create empty noodel with root', function () {
            assert.isObject(new Noodel().getRoot());
        });
    });

    describe('with invalid selector', function () {
        it('should fail with error', function () {
            assert.throw(() => new Noodel("invalid selector"));
        });
    });

    describe('from valid selector', function () {
        let noodel: Noodel;

        beforeEach(function () {
            noodel = new Noodel("#template");
        });

        it('should parse all nodes', function () {
            assert.strictEqual(noodel.getNodeCount(), 15);
        });
        it('should parse all nodes on a level', function () {
            assert.strictEqual(noodel.getRoot().getChildCount(), 9);
        });
        it('should parse children nodes', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getChildCount(), 3);
        });
        it('should parse deep children nodes', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getChild(2).getChildCount(), 3);
        });
        it('should parse node content from inner HTML', function () {
            assert.strictEqual((noodel.getRoot().getChild(0).getContent() as string).trim(), '<h2>Heading</h2>Some text node');
        });
        it('should parse custom class names', function () {
            let classNames = noodel.getRoot().getChild(2).getClassNames();
            let expected: NodeCss = {
                node: "custom node", 
                contentBox: "custom content box",
                branch: "custom branch",
                branchContentBox: "custom branch content box",
                branchSlider: "custom branch slider",
                childIndicator: "custom child indicator",
            }
            assert.deepStrictEqual(classNames, expected);
        });
        it('should parse custom styles', function () {
            let styles = noodel.getRoot().getChild(3).getStyles();
            let expected: NodeCss = {
                node: "color: red; border: solid blue 0px", 
                contentBox: "color: red; border: solid blue 1px",
                branch: "color: red; border: solid blue 2px",
                branchContentBox: "color: red; border: solid blue 8px",
                branchSlider: "color: red; border: solid blue 9px",
                childIndicator: "color: red; border: solid blue 4px",
            }
            assert.deepStrictEqual(styles, expected);
        });
        it('should parse custom ID', function () {
            assert.strictEqual(noodel.getRoot().getChild(6).getId(), 'customId');
        });
        it('should parse custom active child on first come basis', function () {
            assert.strictEqual(noodel.getRoot().getActiveChildIndex(), 4);
            assert.strictEqual(noodel.getRoot().getActiveChild().getIndex(), 4);
            assert.isTrue(noodel.getRoot().getChild(4).isActive());
            assert.isFalse(noodel.getRoot().getChild(5).isActive());
        });
        it('should default active child to 0 for node with children', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getActiveChildIndex(), 0);
            assert.strictEqual(noodel.getRoot().getChild(1).getActiveChild().getIndex(), 0);
            assert.isTrue(noodel.getRoot().getChild(1).getChild(0).isActive());
        });
        it('should default active child to null for node without children', function () {
            assert.strictEqual(noodel.getRoot().getChild(0).getActiveChildIndex(), null);
            assert.strictEqual(noodel.getRoot().getChild(0).getActiveChild(), null);
        });
        it('should return null for non-existent child', function () {
            assert.strictEqual(noodel.getRoot().getChild(12), null);
        });
        it('should focus on active node of first level', function () {
            assert.strictEqual(noodel.getFocalNode(), noodel.getRoot().getActiveChild());
            assert.strictEqual(noodel.getFocalParent(), noodel.getRoot());
        });
    });

    describe('from valid element', function () {
        it('should parse all nodes', function () {
            let noodel = new Noodel(document.getElementById("template"));
            assert.strictEqual(noodel.getNodeCount(), 15);
        });
    });

    describe('from object', function () {
        let noodel: Noodel;

        beforeEach(function () {
            noodel = new Noodel([
                {
                    content: "<h2>Heading</h2>Some text node",
                }, 
                {
                    children: [
                        {},
                        {},
                        {
                            children: [{}, {}, {}]
                        }
                    ]
                }, 
                {
                    classNames: {
                        node: "custom node", 
                        contentBox: "custom content box",
                        branch: "custom branch", 
                        branchContentBox: "custom branch content box",
                        branchSlider: "custom branch slider",
                        childIndicator: "custom child indicator",
                    }
                },
                {
                    styles: {
                        node: "color: red; border: solid blue 0px", 
                        contentBox: "color: red; border: solid blue 1px",
                        branch: "color: red; border: solid blue 2px", 
                        branchContentBox: "color: red; border: solid blue 8px",
                        branchSlider: "color: red; border: solid blue 9px",
                        childIndicator: "color: red; border: solid blue 4px",
                    }
                },
                {
                    isActive: true
                },
                {
                    isActive: true
                },
                {
                    id: 'customId'
                },
                {
                    options: {
                        showChildIndicator: true,
                        anchorOffsetTrunk: () => 10,
                        anchorOffsetBranch: () => 10,
                    }
                }
            ]);
        });

        it('should parse all nodes', function () {
            assert.strictEqual(noodel.getNodeCount(), 14);
        });
        it('should parse all nodes on a level', function () {
            assert.strictEqual(noodel.getRoot().getChildCount(), 8);
        });
        it('should parse children nodes', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getChildCount(), 3);
        });
        it('should parse deep children nodes', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getChild(2).getChildCount(), 3);
        });
        it('should parse node content from inner HTML', function () {
            assert.strictEqual((noodel.getRoot().getChild(0).getContent() as string).trim(), '<h2>Heading</h2>Some text node');
        });
        it('should parse custom class names', function () {
            let classNames = noodel.getRoot().getChild(2).getClassNames();
            let expected: NodeCss = {
                node: "custom node", 
                contentBox: "custom content box",
                branch: "custom branch", 
                branchContentBox: "custom branch content box",
                branchSlider: "custom branch slider",
                childIndicator: "custom child indicator",
            }
            assert.deepStrictEqual(classNames, expected);
        });
        it('should parse custom styles', function () {
            let styles = noodel.getRoot().getChild(3).getStyles();
            let expected: NodeCss = {
                node: "color: red; border: solid blue 0px", 
                contentBox: "color: red; border: solid blue 1px",
                branch: "color: red; border: solid blue 2px", 
                branchContentBox: "color: red; border: solid blue 8px",
                branchSlider: "color: red; border: solid blue 9px",
                childIndicator: "color: red; border: solid blue 4px",
            }
            assert.deepStrictEqual(styles, expected);
        });
        it('should parse custom ID', function () {
            assert.strictEqual(noodel.getRoot().getChild(6).getId(), 'customId');
        });
        it('should parse custom active child on first come basis', function () {
            assert.strictEqual(noodel.getRoot().getActiveChildIndex(), 4);
            assert.isTrue(noodel.getRoot().getChild(4).isActive());
            assert.isFalse(noodel.getRoot().getChild(5).isActive());
        });
        it('should default active child to 0 for node with children', function () {
            assert.strictEqual(noodel.getRoot().getChild(1).getActiveChildIndex(), 0);
            assert.strictEqual(noodel.getRoot().getChild(1).getActiveChild().getIndex(), 0);
            assert.isTrue(noodel.getRoot().getChild(1).getChild(0).isActive());
        });
        it('should default active child to null for node without children', function () {
            assert.strictEqual(noodel.getRoot().getChild(0).getActiveChildIndex(), null);
            assert.strictEqual(noodel.getRoot().getChild(0).getActiveChild(), null);
        });
        it('should return null for non-existent child', function () {
            assert.strictEqual(noodel.getRoot().getChild(12), null);
        });
        it('should focus on active node of first level', function () {
            assert.strictEqual(noodel.getFocalNode(), noodel.getRoot().getActiveChild());
            assert.strictEqual(noodel.getFocalParent(), noodel.getRoot());
        });
        it('should parse node options', function () {
            let options = noodel.getRoot().getChild(7).getOptions();
            assert.strictEqual(options.showChildIndicator, true);
            assert.isFunction(options.anchorOffsetBranch);
            assert.isFunction(options.anchorOffsetTrunk);
        });
    });

    describe('without options', function () {
        it('should have default options', function () {
            let noodel = new Noodel([]);
            let options = noodel.getOptions();
            assert.isFunction(options.anchorOffsetBranch);
            assert.isFunction(options.anchorOffsetTrunk);
            assert.isFunction(options.focalOffsetBranch);
            assert.isFunction(options.focalOffsetTrunk);
            assert.deepStrictEqual(options, {
                visibleSubtreeDepth: 1,
                retainDepthOnTapNavigation: false,
                swipeMultiplierBranch: 1,
                swipeMultiplierTrunk: 1,
                snapMultiplierBranch: 1,
                snapMultiplierTrunk: 1,
                useRouting: true,
                useKeyNavigation: true,
                useWheelNavigation: true,
                useSwipeNavigation: true,
                useTapNavigation: true,
                useInspectModeKey: true,
                useInspectModeDoubleTap: true,
                showLimitIndicators: true,
                showChildIndicators: true,
                orientation: "ltr",
                branchDirection: "normal",
                anchorOffsetBranch: options.anchorOffsetBranch,
                anchorOffsetTrunk: options.anchorOffsetTrunk,
                focalOffsetBranch: options.focalOffsetBranch,
                focalOffsetTrunk: options.focalOffsetTrunk,
                useFlipAnimation: true
            });
        });
    });

    describe('with options', function () {
        it('should override default options', function () {
            let anchorOffsetBranch = () => 100;

            let noodel = new Noodel([], {
                visibleSubtreeDepth: 2,
                anchorOffsetBranch: anchorOffsetBranch,
            });

            let options = noodel.getOptions();

            assert.strictEqual(options.visibleSubtreeDepth, 2);
            assert.strictEqual(options.anchorOffsetBranch, anchorOffsetBranch);
        });
    });
});