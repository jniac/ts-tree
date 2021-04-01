import tap from 'tap'

import { Node } from '../src/tree'

class Foo extends Node {

}

const test = () => {
  
  const A = new Foo()
  const B = new Foo()
  const C = new Foo()

  tap.equal(A.name, 'Foo#0')

  A.append(B, C)
  tap.equal([...A.children()].length, 2)
  tap.equal([...A.allChildren()].length, 2)

  B.append(C)
  tap.equal([...A.children()].length, 1)
  tap.equal([...A.allChildren()].length, 2)
  tap.equal(B.isRoot, false)
  tap.equal(C.isRoot, false)
  tap.equal(C.root, A)

  B.detach()
  tap.equal(B.isRoot, true)
  tap.equal(C.isRoot, false)
  tap.equal(C.root, B)

  A.append(B.append(C))
  tap.equal(A.toGraphString(), 
`x─┬─ Foo#0
  └─┬─ Foo#1
    └─── Foo#2`)

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
    const nodes:Foo[] = []
    A.walk<Foo>(node => nodes.push(node))
    tap.equivalent(nodes, [A,B,C])
    t.end()
  })

  const D = new Foo()
  const E = new Foo()
  const F = new Foo()
  A.append(B,C,D,E,F)
  E.detach()
  tap.equivalent([...A.children<Foo>()], [B,C,D,F])

  const D1 = new Foo()
  const D2 = new Foo()
  const D3 = new Foo()
  D.append(D1, D2, D3)

  tap.equal(A.toGraphString(),
`x─┬─ Foo#0
  ├─── Foo#1
  ├─── Foo#2
  ├─┬─ Foo#3
  │ ├─── Foo#6
  │ ├─── Foo#7
  │ └─── Foo#8
  └─── Foo#5`)

  tap.equivalent([...D2.allParents()], [D,A])
  tap.equivalent(D2.allParentsInOrder(), [A,D])
  tap.equivalent(D2.allParentsInOrder(false), [D,A])

  A.removeAll()
  tap.equal(D.isDetached, true)
}

test()

