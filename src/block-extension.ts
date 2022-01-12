import { EditorState, EditorView } from "@codemirror/basic-setup";
import {
  ChangeSpec,
  Extension,
  StateEffect,
  StateField,
} from "@codemirror/state";
import { keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";

export type SetBlockLevelEffectSpec = {
  lineNumber: number;
  fromLevel: number;
  toLevel: number;
};
export const setBlockLevelEffect =
  StateEffect.define<SetBlockLevelEffectSpec>();

export const inputIncreaseBlockLevelEffect = StateEffect.define<number>();
export const inputDecreaseBlockLevelEffect = StateEffect.define<number>();

const blockLevelViewPlugin = ViewPlugin.define((view) => {
  console.log("created block level view plugin");
  return {
    update(update: ViewUpdate) {
      console.log("updating view");
      // unindentBlockCommand(view);
    },
  };
});

function dispatchBlockCommand(view: EditorView, mode: "increase" | "decrease") {
  const effects: StateEffect<unknown>[] = [];
  const lines = view.state.selection.ranges.map((range) =>
    view.state.doc.lineAt(range.from)
  );
  for (const line of lines) {
    if (mode === "increase") {
      effects.push(inputIncreaseBlockLevelEffect.of(line.number));
    } else if (mode === "decrease") {
      effects.push(inputDecreaseBlockLevelEffect.of(line.number));
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!effects.length) return false;
  view.dispatch({ effects });
  return true;
}

const indendationKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: (view) => dispatchBlockCommand(view, "increase"),
    shift: (view) => dispatchBlockCommand(view, "decrease"),
  },
]);

export const blocksMapField = StateField.define<{
  [lineNumber: number]: number;
}>({
  create(state) {
    return {};
  },
  update(blocksMapField, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect)) {
        const { lineNumber, fromLevel, toLevel } = effect.value;
        blocksMapField = Object.assign({}, blocksMapField);
        blocksMapField[lineNumber] = toLevel;
      }
    }
    return blocksMapField;
  },
});

export const findLevelOfLine = (state: EditorState, lineNumber: number) => {
  const mappings = state.field(blocksMapField, false) || {};
  return mappings[lineNumber] ?? 0;
};

const reduceInputBlockEffects = EditorState.transactionFilter.of(
  (transaction) => {
    const { state } = transaction;
    const effects: StateEffect<unknown>[] = [];
    for (const effect of transaction.effects) {
      const isIncreaseEffect = effect.is(inputIncreaseBlockLevelEffect);
      if (isIncreaseEffect || effect.is(inputDecreaseBlockLevelEffect)) {
        const lineNumber = effect.value;
        const fromLevel = findLevelOfLine(state, lineNumber);
        const toLevel = Math.max(
          0,
          isIncreaseEffect ? fromLevel + 1 : fromLevel - 1
        );
        if (fromLevel === toLevel) {
          console.log("no change for equal from and to level");
          continue;
        }
        if (lineNumber === 1) {
          console.log("cannot change level of root line");
          continue;
        }
        if (isIncreaseEffect) {
          const previousLevel = findLevelOfLine(state, lineNumber - 1);
          if (toLevel > previousLevel + 1) {
            // only 1 level jumps
            console.log("only level jumps of 1 are allowed");
            continue;
          }
        } else {
          // decrease
        }
        effects.push(
          setBlockLevelEffect.of({ fromLevel, toLevel, lineNumber })
        );
      }
    }
    if (!effects.length) return transaction;
    return [
      transaction,
      transaction.state.update({ effects, sequential: true }),
    ];
  }
);

const indentBlockLevels = EditorState.transactionFilter.of((transaction) => {
  const { state, newDoc } = transaction;
  let changes: ChangeSpec[] = [];
  for (const effect of transaction.effects) {
    if (effect.is(setBlockLevelEffect)) {
      const { lineNumber, fromLevel, toLevel } = effect.value;
      const levelDiff = toLevel - fromLevel;
      const line = newDoc.line(lineNumber);
      console.log("block effect", effect.value);

      if (toLevel < fromLevel) {
        changes.push({
          from: line.from + toLevel,
          to: line.from + fromLevel,
        });
      } else {
        changes.push({
          from: line.from,
          to: line.from,
          insert: "-".repeat(levelDiff),
        });
      }
      console.log(transaction);
    }
  }

  return changes.length
    ? [transaction, { changes, sequential: true }]
    : transaction;
});

export function blockExtension(_options: {} = {}): Extension {
  return [
    blocksMapField,
    indendationKeymap,
    reduceInputBlockEffects,
    indentBlockLevels,
    // EditorState.transactionFilter.of((transaction) => {
    //   const { effects, changes } = transaction;
    //   return [transaction];
    // }),
  ];
}
