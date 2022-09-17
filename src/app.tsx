import { useState, useEffect } from 'preact/hooks'
import { createStore, createSessionPersister } from 'tinybase';
import './app.css'

const store = createStore();
const persister = createSessionPersister(store, 'votes');

await persister.startAutoLoad({ votes: { dog: { count: 0 }, cat: { count: 0 } } });
await persister.startAutoSave();


export function App() {
  const [count, setCount] = useState({
    dog: 0,
    cat: 0
  })

  useEffect(() => {
    // Load data
    const data = store.getTable('votes')
    setCount(() => ({
      cat: data.cat.count.valueOf() as number,
      dog: data.dog.count.valueOf() as number,
    }))

    // Start Listen
    const listenerId = store.addRowListener(
      'votes',
      null,
      (store, tableId, rowId) => {
        if (tableId === "votes") {

          setCount((val) => {
            const currCount = store.getCell('votes', rowId, 'count')
            let o = {}
            o[rowId] = currCount != undefined ? currCount.valueOf() : 0

            return {
              ...val,
              ...o
            }
          })
        }
      }
    );

    return () => {
      store.delListener(listenerId);
    };
  }, []);

  function incVoteCount(name: string) {
    const currCount = store.getCell('votes', name, 'count')

    store.setCell('votes', name, 'count', currCount !== undefined ? parseInt(currCount.toString()) + 1 : 1)
  }

  return (
    <>
      <h1>TinyBase example</h1>
      <div class="card">
        <button onClick={() => incVoteCount("dog")}>
          🐶
          <span>
            {count.dog}
          </span>
        </button>
        <button onClick={() => incVoteCount("cat")}>
          🐱
          <span>
            {count.cat}
          </span>
        </button>
      </div>
    </>
  )
}
