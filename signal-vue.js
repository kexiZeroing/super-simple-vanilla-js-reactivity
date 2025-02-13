import { shallowRef, triggerRef } from 'vue'

export function createSignal(value) {
  const r = shallowRef(value)
  const get = () => r.value
  const set = (v) => {
    r.value = typeof v === 'function' ? v(r.value) : v
    triggerRef(r)
  }
  return [get, set]
}


// Test
const [count, setCount] = createSignal(0)
console.log(count())

// Update the signal using a function
setCount((prev) => prev + 1)
console.log(count()) // 1

// Update the signal using a direct value
setCount(10)
console.log(count()) // 10


// What is Vue `shallowRef` and `triggerRef`
// Regular ref - nested properties are reactive
const normalRef = ref({ count: 0 })
normalRef.value.count++  // triggers reactivity

// Shallow ref - only .value changes trigger reactivity
const shallow = shallowRef({ count: 0 })
shallow.value = { count: 1 } // triggers reactivity
shallow.value.count++ // doesn't trigger reactivity
triggerRef(shallow)   // Forces update
