# CodeMirror6 Indentation

Creating indented list blocks in [CodeMirror6](https://codemirror.net/6/).

[Demo](https://marcoklein.github.io/codemirror6-block-indentation/)

## Prerequisite

1. Clone this repository
1. [Installation of NodeJS](https://nodejs.org/en/)
1. Install `yarn`: `npm -g yarn`

## Getting started

Install dependencies

```bash
yarn install
```

Run the project

```bash
yarn start
```

## Testing

Run tests with

```bash
yarn test
```

For running tests on change use

```bash
yarn test:watch
```

> Currently, the testing approach is very basic. Parcel builds `*.test.ts` files and karma picks up build files to run tests. Therefore, there is no direct mapping to the TypeScript source. This is due to the complicated setup with ESM modules.

## Approach

Handle only text changes to stay compatible with the VIM plugin and Codemirror text history. This means, if you want to indent a block you insert two spaces to the start of the line. That is how the VIM plugin would do it with the `>` key in visual mode.

Raw text is parsed and decorations replace the `- ` string with a visual dot. Therefore, if you copy text text underlying text get copied which is very easy to handle.

Custom implementation builds on the auto indentation of blocks and the deletion of blocks when the user deletes a character from the block indentation.

## Learnings

There are several stages I went through while implementing the block indentation. They are all listed in the `src/playground` folder.

### 1

- getting started with CodeMirror 6
- implement a basic line decoration

### 2

- add some keymap to work with indentation

### 3

- implement more intelligent indentation logic
- huge problem: cursor did not refresh when the line indentation (with `padding-left`) changed

### 4

- implement block levels in the editor
- logic to override individual file changes
- several very complicated re-writes
- did not get me closer to what the project should do

### 5

- block levels base on the `padding-left` approach
- fixed the cursor refresh issue form `3`rd approach
- however, when copying or deleting the line the indentation got lost
- it might be possible to modify to text when copying it into the clipboard
- therefore, it might be the simplest solution to work with `spaces` or `tabs` as indentation and overwrite them with decorations