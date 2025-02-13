# Super Simple Vanilla JS Reactivity

1. **Signals**: Hold values and track effects (subscribers) that depend on them.
2. **Effects**: Functions that automatically re-run when their dependent signals change.
3. **Context**: A stack tracking the currently running effect for dependency collection.

### Why need cleanup in `createEffect`
The `cleanup` function is used to remove the effect from the signal’s dependency list before running the effect’s function. By doing this, it ensures that once an effect is executed, it is no longer subscribed to the signal that it is about to modify. This step is crucial for preventing the effect from being triggered by its own modifications.

```js
// Create signal for count
const [count, setCount] = createSignal(0);

// Create effect that watches count
createEffect(() => {
  console.log("Count has changed to", count());
});

// Create effect that resets the count to 0 when a certain condition is met
createEffect(() => {
  if (count() >= 5) {
    console.log("Count is 5 or more, resetting...");
    setCount(0);  // This modifies the signal, triggering a re-run of the first effect
  }
});

// Simulate changing the count
setCount(1);  // Logs: "Count has changed to 1"
setCount(3);  // Logs: "Count has changed to 3"
setCount(5);  // Logs: "Count has changed to 5" and "Count is 5 or more, resetting..." then "Count has changed to 0"
```

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
