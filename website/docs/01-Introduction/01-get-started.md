# Get started

Amos is an all-in-one, modern state management solution. It incorporates all the best features found
in state management libraries to date, including decentralization (atomic), immutability,
predictability, strong typing, and simplicity. Additionally, its unique data-structure-based state
node design allows for comprehensive state management without the need for external tools. Amos also
includes commonly used solutions within the state management ecosystem, such as persistence,
batching, caching, and concurrency control.

With these features, Amos offers a complete capability and concept set that enables effortless state
management in large and expanding applications, with a near-zero marginal cost.

## Installation

Amos has only one npm package, making installation extremely simple.

```bash npm2yarn
npm install amos
```

For an enhanced development experience, you may need to set up devtools extensions and modify
compiler configurations. You can find complete information on how to do this [here](./02-setup.md).

## Basic Example

```tsx live noInline showLineNumbers
import { createStore, numberBox } from 'amos';
import { Provider, useDispatch, useSelector } from 'amos/react';

const countBox = numberBox('count');

const App = React.memo(() => {
  const dispatch = useDispatch();
  const count = useSelector(countBox);
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => dispatch(countBox.add(1))}>Click me!</button>
    </div>
  );
});

const store = createStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

You can click the button above ☝️ to try it out or edit the code.

As you can see, the concepts Amos uses are largely similar to those in other state management
libraries you're familiar with, such as `store`, `selector`, `dispatch`, and `provider`. However,
there are some new elements as well: **`box`**, which is somewhat like an `atom` in `Recoil` or
`Jotai`, but with additional features. For instance, in the example above, `numberBox` and
`countBox.add(1)` demonstrate one of Amos's unique aspects. By binding the state’s data structure
with its data node, Amos allows us to avoid implementing a separate data operation interface for
each state node (or relying on third-party libraries).

In the example above, `count` is a state of type number, and `countBox` is its corresponding state
node. Since `count` is of numeric type, we use `numberBox` to construct it, enabling `countBox` to
naturally provide the operations and query methods required for `count`, such as `add`, `mod`,
`toFixed`, and more. These methods allow us to directly query or modify the value of the `count`
state.

You can find more detailed information on Amos's concepts [here](./03-concepts.md).

## What's Next

Next, you can go to the [Concepts](./03-concepts.md) page to learn about the core ideas in Amos, or
explore topics of interest in the menu on the left 👈 of this document.

We recommend starting with our article,
[How to design state in large-scale applications](./04-how-to.md), to understand the reasoning
behind Amos's design and to help you make the most of it.
