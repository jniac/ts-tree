# ts-tree

Minimal script to implement a tree (graph).

```js
import { Node } from '../src/tree'

const A = new Node()
const B = new Node()
const C = new Node()

A.append(B)
C.appendTo(B)
C.append(new Node(), new Node())
A.append(new Node())

console.log(A.toGraphString())
```

```
x─┬─ Node#0
  ├─┬─ Node#1
  │ └─┬─ Node#2
  │   ├─── Node#3
  │   └─── Node#4
  └─── Node#5
```
# 💯
Tested with node-tap.  
100% code coverage

```
npx tap
```