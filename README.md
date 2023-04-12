# @wharfkit/transact-plugin-finality-callback

A template to create a `transactPlugin` for use during a `transact` call within the `@wharfkit/session` library.

## Usage

Install the plugin:

```bash
yarn add @wharfkit/transact-plugin-finality-callback
```

Then, when instantiating the SessionKit, add the `TransactPluginFinalityCallback` plugin to the `transactPlugins` array . The plugin will call the `onFinalityCallback` function when the transaction has reached finality.

```
new SessionKit(sessionArgs, {
    ...
    transactPlugins: [
        new TransactPluginFinalityCallback({
            onFinalityCallback: () => {
                // This will be called when the transaction has reached finality
            },
        }),
    ],
})

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
