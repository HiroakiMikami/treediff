/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as chai from 'chai'
import { Tree } from '../src/tree'
import { applyDelta, Delta, applyDiff, TreeWithHole } from '../src/diff'
chai.should()


const remove = new TreeWithHole<string>(null, null)

describe('#applyDelta', () => {
    it('remove specified node', () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] }
            ]
        }
        applyDelta(tree, new Delta<string>([1, 0], remove)).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "p2", children: [] }
                ]
            }
        )
        applyDelta(tree, new Delta<string>([0], remove)).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "p2", children: [{ value: "leaf", children: [] }] }
                ]
            }
        )
    })
    it("replace tree", () => {
        const tree: Tree<string> = {
            value: "parent",
            children: [
                { value: "leaf", children: [] },
                { value: "p2", children: [{ value: "leaf", children: [] }] }
            ]
        }
        applyDelta(tree, new Delta<string>([1, 0],
            new TreeWithHole({ value: "test", children: [] })
        )).should.deep.equal(
            {
                value: "parent",
                children: [
                    { value: "leaf", children: [] },
                    { value: "p2", children: [{ value: "test", children: [] }] }
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
            new TreeWithHole({ value: "test", children: [null] }, [0])
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
            new Delta<string>([0], remove),
            new Delta<string>([1, 0], remove),
            new Delta<string>([2], new TreeWithHole({ value: "test", children: [null] }, [0]))
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
})
