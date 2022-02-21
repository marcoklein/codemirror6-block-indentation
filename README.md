# CodeMirror6 Indentation

Creating indented list blocks in [CodeMirror6](https://codemirror.net/6/).

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