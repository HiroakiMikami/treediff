/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as chai from 'chai'
import { Tree } from '../src/tree'
import { applyDelta, Delta, applyDiff, InsertTree, DeleteTree, ReplaceValue } from '../src/diff'
chai.should()

const del = new DeleteTree<string>()

describe('#applyDelta', () => {
    it('remove specified node', () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] }
            ]
        }
        applyDelta(tree, new Delta<string>([1, 0], del)).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "p2", children: [] }
                ]
            }
        )
        applyDelta(tree, new Delta<string>([0], del)).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "p2", children: [{ value: "leaf", children: [] }] }
                ]
            }
        )
    })
    it("insert tree", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] }
            ]
        }
        applyDelta(tree, new Delta<string>([1, 0],
            new InsertTree([0], { value: "test", children: [null] })
        )).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "p2", children: [{ value: "test", children: [{ value: "leaf", children: [] }] }] }
                ]
            }
        )
    })
    it("replace a value in tree", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] }
            ]
        }
        applyDelta(tree, new Delta<string>([1, 0], new ReplaceValue("replaced"))).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "p2", children: [{ value: "replaced", children: [] }] }
                ]
            }
        )
    })
})
describe('#applyDiff', () => {
    it("apply multiple deltas", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] },
                { value: "last", children: [] },
            ]
        }
        applyDiff(tree, [
            new Delta<string>([0], del),
            new Delta<string>([1, 0], del),
            new Delta<string>([2], new InsertTree([0], { value: "test", children: [null] }))
        ]).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "p2", children: [] },
                    { value: "test", children: [{ value: "last", children: [] }] }
                ]
            }
        )
    })
    it("insert multiple trees", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
            ]
        }
        applyDiff(tree, [
            new Delta<string>([1], new InsertTree([], { value: "test1", children: [] })),
            new Delta<string>([2], new InsertTree([], { value: "test2", children: [] }))
        ]).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "test1", children: [] },
                    { value: "test2", children: [] },
                ]
            }
        )
    })
    it("insert and delete same path", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
            ]
        }
        applyDiff(tree, [
            new Delta<string>([0], new InsertTree([], { value: "test", children: [] })),
            new Delta<string>([0], del)
        ]).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "test", children: [] },
                ]
            }
        )
    })
})
