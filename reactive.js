let context = [];

function cleanup(observer) {
  for (const dep of observer.dependencies) {
    dep.delete(observer);
  }
  observer.dependencies.clear();
}

function subscribe(observer, subscriptions) {
  subscriptions.add(observer);
  observer.dependencies.add(subscriptions);
}

function createSignal(value) {
  // Store all the effects that depend on this value
  const subscriptions = new Set();

  const read = () => {
    const observer = context[context.length - 1];
    if (observer) {
      subscribe(observer, subscriptions);
    }
    return value;
  };
  const write = (newValue) => {
    value = newValue;
    for (const observer of [...subscriptions]) {
      observer.execute();
    }
  };

  return [read, write];
}

function createEffect(fn) {
  const effect = {
    execute() {
      cleanup(effect);
      context.push(effect);
      fn();
      context.pop();
    },
    // Keep track of what signals this effect depends on
    dependencies: new Set(),
  };

  effect.execute();
}

function createMemo(fn) {
  const [signal, setSignal] = createSignal();
  createEffect(() => setSignal(fn()));
  return signal;
}
