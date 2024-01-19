# @wharfkit/transact-plugin-finality-callback

A WharfKit [transact plugin](https://wharfkit.com/docs/session-kit/plugin-transact) plugin that calls a callback function when a transaction has reached finality.

## Usage

Install the plugin:

```bash
npm install @wharfkit/transact-plugin-finality-callback --save
# or
yarn add @wharfkit/transact-plugin-finality-callback
```

Then, when instantiating the SessionKit, add the `TransactPluginFinalityCallback` plugin to the `transactPlugins` array. The plugin will call the `onFinalityCallback` function when transactions reach finality.

```
new SessionKit(sessionArgs, {
    ...
    transactPlugins: [
        new TransactPluginFinalityCallback({
            onFinalityCallback: (getTransactionStatusResponse) => {
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
