# Super Simple Vanilla JS Reactivity

1. **Signals**: Hold values and track effects (subscribers) that depend on them.
2. **Effects**: Functions that automatically re-run when their dependent signals change.
3. **Context**: A stack tracking the currently running effect for dependency collection.

### Why need cleanup in `createEffect`
The `cleanup` function is used to remove the effect from the signal’s dependency list before running the effect’s function. Without cleanup, effects accumulate dependencies from previous runs, leading to memory leaks (old subscriptions never removed) or stale dependencies (effects reacting to signals they no longer use).

```js
const [cond, setCond] = createSignal(true);
const [A, setA] = createSignal('A');
const [B, setB] = createSignal('B');

createEffect(() => {
  if (cond()) {
    console.log('Effect depends on A:', A());
  } else {
    console.log('Effect depends on B:', B());
  }
});

setCond(false);
// Effect re-runs, outputs: "Effect depends on B: B"

// Now update signal A (which should NOT trigger the effect)
setA('Updated A');
// With cleanup:    No effect runs
// Without cleanup: Effect runs again with "Effect depends on B: B" (incorrect)
```

1. **Initial run:** The effect subscribes to `cond` and `A`
2. **After `setCond(false)`:** 
   - With cleanup: Removes subscriptions to `cond` and `A`, then subscribes to `cond` and `B`
   - Without cleanup: Keeps old subscription to `A` while adding `B`
3. **When updating A:**
   - With cleanup: No effect runs (correct)
   - Without cleanup: Effect runs because it still had subscription to `A` (incorrect)

### Purpose of the `observer.dependencies`
```
cleanup(effect) -> effect.dependencies -> signal.subscriptions -> remove each effect
```

- The `cleanup(effect)` function works by iterating over all the signals in `effect.dependencies`.
- For each signal in the `effect.dependencies` set, we go through the signal’s `subscriptions` set and remove the effect from it.
- This ensures that once the effect is no longer needed, it is properly unsubscribed from the signals it was dependent on. **(Prevent unnecessary updates and re-executions.)**

### How memoization works
- **Initial Computation**: When `createMemo` is first called, it computes `fn()`, stores it in `signal`, and triggers the effect.
- **Memoization**: On subsequent calls, `createMemo` simply returns the cached result and doesn’t recompute `fn()` unless the reactive system triggers a re-run of the effect (e.g., if the dependencies of `fn()` change).

```js
const [count, setCount] = createSignal(0);

const memoizedValue = createMemo(() => {
  console.log('Computing value...');
  return count() * 2;
});

console.log(memoizedValue());  // Logs: "Computing value..." followed by 0

// Update the `count` value and recheck the memoized value
setCount(2);

console.log(memoizedValue());  // Logs: "Computing value..." followed by 4
console.log(memoizedValue());  // Just logs 4, no recomputation
```
