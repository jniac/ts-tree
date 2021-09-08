let nodeUID = 0

const id = Symbol('Node.id')
class Node {

  [id]:number = -1
  #root:Node = this
  #parent:Node|null = null
  #previous:Node|null = null
  #next:Node|null = null
  #firstChild:Node|null = null
  #lastChild:Node|null = null
  props:Record<string,any>|null = null

  constructor(props:Record<string,any>|null = null) {

    Object.defineProperty(this, id, { enumerable: true, value: nodeUID++ })

    this.props = props
  }

  get name() { return this.props?.name ?? `${this.constructor.name}#${this[id]}` }

  append<T extends Node>(...children:T[]) {

    for (const child of children) {

      if (child[id] === this[id]) {
        throw new Error(`Could not append node to himself!`)
      }

      if (child.contains(this)) {
        throw new Error(`The new child contains the parent!`)
      }

      if (child.#parent) {
        child.#parent.remove(child)
      }

      child.#parent = this
      child.#root = this.#root
      for (const subchild of child.allChildren()) {
        subchild.#root = this.#root
      }

      if (this.#lastChild) {

        this.#lastChild.#next = child
        child.#previous = this.#lastChild
        this.#lastChild = child

      } else {

        this.#firstChild =
        this.#lastChild = child
      }
    }

    return this
  }

  remove<T extends Node>(...children:T[]) {

    for (const child of children) {

      if (this.#lastChild?.[id] === child[id]) {
        this.#lastChild = child.#previous
      }

      if (this.#firstChild?.[id] === child[id]) {
        this.#firstChild = child.#next
      }

      const previous = child.#previous
      const next = child.#next

      if (previous) {
        previous.#next = next
      }

      if (next) {
        next.#previous = previous
      }

      child.#parent = null
      child.#root = child
      child.#previous = null
      child.#next = null

      for (const subchild of child.allChildren()) {
        subchild.#root = child
      }
    }

    return this
  }

  removeAll() {

    let child = this.#firstChild

    while (child) {

      const next = child.#next

      child.#parent = null
      child.#root = child
      child.#previous = null
      child.#next = null

      for (const subchild of child.allChildren()) {
        subchild.#root = child
      }

      child = next
    }

    this.#firstChild = null
    this.#lastChild = null

    return this
  }

  appendTo(parent:Node) {

    parent.append(this)

    return this
  }

  detach() {
    this.#parent?.remove(this)
    return this
  }

  walk<T extends Node>(callback:(node:T) => void) {

    callback(this as unknown as T)

    let child = this.#firstChild

    while(child) {
      child.walk(callback)
      child = child.#next
    }

    return this
  }

  // hierarchy test:

  get depth() {
    let count = 0
    let node = this.#parent
    while(node) {
      count++
      node = node.#parent
    }
    return count
  }

  get isRoot() {
    return this.#root === this
  }

  get isDetached() {
    return this.#root === this && !this.#parent && !this.#next && !this.#previous
  }

  get isTip() {
    return this.#firstChild === null
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
  contains(node:Node|null) {

    while (node) {
      if (node.#parent === this) {
        return true
      }
      node = node.#parent
    }

    return false
  }

  isContainedBy(node:Node) {
    return node.contains(this)
  }



  // iterators:

  *children<T extends Node>():Generator<T> {

    let child = this.#firstChild

    while(child) {
      yield child as T
      child = child.#next
    }
  }

  // *allChildren<T extends Node>():Generator<T> {

  // 	let child = this.#firstChild

  // 	while(child) {
  // 		yield child as T
  // 		yield* child.allChildren()
  // 		child = child.#next
  // 	}
  // }

  *allChildren<T extends Node>({ 
  
    includeSelf = false, 
    filter = undefined,
    progression = 'vertical',
  
  }:Partial<{

    includeSelf:boolean
    filter:(node:T) => boolean
    progression:'horizontal'|'vertical'

  }> = {}):Generator<T> {

    if ((progression === 'horizontal' || progression === 'vertical') === false) {
      throw new Error(`oops "progression" value should be "horizontal" or "vertical" (received "${progression}")`)
    }

    const queue = (includeSelf ? [this] : [...this.children()]) as T[]

    while (queue.length > 0) {
      const node = queue.shift()!
      if (!filter || filter(node)) {
        if (progression === 'horizontal') {
          queue.push(...node.children<T>())
        } else {
          queue.unshift(...node.children<T>())
        }
        yield node
      }
    }
  }
  
  /**
   * Returns all the parents in ASCENDING order.
   */
  *allParents<T extends Node>():Generator<T> {

    let node = this.#parent

    while(node) {
      yield node as T
      node = node.#parent
    }
  }

  allParentsInOrder<T extends Node>(descending = true) {
    const parents = [...this.allParents<T>()]
    return descending ? parents.reverse() : parents
  }

  // getter
  get root() {
    return this.#root
  }
  get parent() {
    return this.#parent
  }
  get previous() {
    return this.#previous
  }
  get next() {
    return this.#next
  }



  // toGraphString:

  toGraphStringLine() {

    const intro = []

    for (const parent of this.allParents()) {
      intro.unshift(!!parent.#next ? '│ ' : '  ')
    }

    return (
      intro.join('') +
        (this.#parent === null ? 'x' : (this.#next ? '├' : '└')) +
        '─' + (this.#firstChild ? '┬' : '─') + '─ ' + this.name
    )
  }

  toGraphString() {
    return [this, ...this.allChildren()].map(node => node.toGraphStringLine()).join('\n')
  }
}

export { Node }
