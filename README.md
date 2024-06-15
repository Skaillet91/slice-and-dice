# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

### Setting up the environment

This project uses `mise` to pin Node version in the `.mise.toml` file and `corepack` to pin `pnpm` version in the `package.json` file. `mise` and `corepack` seem to be the most modern tools for this purpose, as of 2024. You don't need to use them, but then you'll have to sync Node and pnpm versions by hand.

1. Install `mise` CLI: https://mise.jdx.dev/getting-started.html
2. In the `slice-and-dice` project directory, run the following:

   ```sh
   mise install
   corepack install
   corepack enable
   ```

### Generic instructions

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
