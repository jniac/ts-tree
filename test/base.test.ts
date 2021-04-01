import tap from 'tap'

import { Node } from '../src/tree'

const test = () => {
  
  const A = new Node()
  const B = new Node()
  const C = new Node()

  tap.equal(A.name, 'Node#0')

  A.append(B, C)
  tap.equal([...A.children()].length, 2)
  tap.equal([...A.allChildren()].length, 2)

  B.append(C)
  tap.equal([...A.children()].length, 1)
  tap.equal([...A.allChildren()].length, 2)
  tap.equal(B.isRoot, false)
  tap.equal(C.isRoot, false)
  tap.equal(C.root, A)
  tap.equivalent([A,B,C].map(n => n.isTip), [false, false, true])

  B.detach()
  tap.equal(B.isRoot, true)
  tap.equal(C.isRoot, false)
  tap.equal(C.root, B)

  A.append(B.append(C))
  tap.equal(A.toGraphString(), 
`x─┬─ Node#0
  └─┬─ Node#1
    └─── Node#2`)

  tap.test('should not add a child to himself', t => {
    t.throws(() => A.append(A), new Error(`Could not append node to himself!`), 'well')
    t.throws(() => C.append(A), new Error(`The new child contains the parent!`), 'well')
    t.end()
  })

  C.detach().append(A)
  // C->A->B
  tap.equal(A.root, C)
  tap.equal(B.root, C)
  tap.equal(A.parent, C)
  tap.equal(B.parent, A)
  tap.equivalent([...C.children()], [A])
  tap.equivalent([...C.allChildren()], [A,B])

  C.append(B)
  // C->A,B
  tap.equal(B.parent, C)
  tap.equivalent([...C.children()], [A,B])
  tap.equivalent([...C.allChildren()], [A,B])
  tap.equal(A.next, B)
  tap.equal(B.previous, A)

  C.removeAll()
  tap.equal([A,B,C].every(n => n.isRoot), true)
  tap.equal([A,B,C].every(n => n.isDetached), true)
  
  C.appendTo(B.appendTo(A)) 
  // A->B->C
  tap.equal(A.contains(B), true)
  tap.equal(A.contains(C), true)
  tap.equal(B.isContainedBy(A), true)
  tap.equal(C.isContainedBy(A), true)
  tap.test('test walk', t => {
    const nodes:Node[] = []
    A.walk(node => nodes.push(node))
    tap.equivalent(nodes, [A,B,C])
    t.end()
  })

  const D = new Node()
  const E = new Node()
  const F = new Node()
  A.append(B,C,D,E,F)
  E.detach()
  tap.equivalent([...A.children()], [B,C,D,F])

  const D1 = new Node()
  const D2 = new Node()
  const D3 = new Node()
  D.append(D1, D2, D3)

  tap.equal(A.toGraphString(),
`x─┬─ Node#0
  ├─── Node#1
  ├─── Node#2
  ├─┬─ Node#3
  │ ├─── Node#6
  │ ├─── Node#7
  │ └─── Node#8
  └─── Node#5`)

  tap.equivalent([...D2.allParents()], [D,A])
  tap.equivalent(D2.allParentsInOrder(), [A,D])
  tap.equivalent(D2.allParentsInOrder(false), [D,A])

  A.removeAll()
  tap.equal(D.isDetached, true)

  A.append(B,C,D.append(D1,D2,D3),E,F)
  tap.equivalent([...A.allChildren({ includeSelf:true })], [A,B,C,D,D1,D2,D3,E,F])
  tap.equivalent([...A.allChildren({ progression:'horizontal' })], [B,C,D,E,F,D1,D2,D3])
  tap.equivalent([...A.allChildren({ includeSelf:true, filter:n => n.depth < 1 })], [A])
  tap.test('allChildren() throws error with invalid "progression" option', t => {
    t.throws(() => [...A.allChildren({ progression:'foo' } as any)], new Error(`oops "progression" value should be "horizontal" or "vertical" (received "foo")`), 'well')
    t.end()
  })
}

test()

