import {
    AbstractTransactPlugin,
    Checksum256,
    TransactContext,
    TransactHookResponseType,
    TransactHookTypes,
    TransactResult,
    Transaction,
} from '@wharfkit/session'

/** Import JSON localization strings */
import defaultTranslations from './translations.json'

const START_CHECKING_FINALITY_AFTER = 150000 // 2.5 minutes

interface TransactPluginFinalityCallbackOptions {
    onFinalityCallback: () => void
}

export class TransactPluginFinalityCallback extends AbstractTransactPlugin {
    onFinalityCallback: () => void

    constructor({onFinalityCallback}: TransactPluginFinalityCallbackOptions) {
        super()

        // Optional - Set the default translations for the plugin
        this.onFinalityCallback = onFinalityCallback
    }

    /** A unique ID for this plugin */
    id = 'transact-plugin-finality-callback'

    /** Optional - The translation strings to use for the plugin */
    translations = defaultTranslations

    /**
     * Register the hooks required for this plugin to function
     *
     * @param context The TransactContext of the transaction being performed
     */
    register(context: TransactContext): void {
        // Register any desired afterBroadcast hooks
        context.addHook(
            TransactHookTypes.afterBroadcast,
            (result: TransactResult, context: TransactContext): Promise<TransactHookResponseType> => {
                console.log({result})
                const { resolved } = result

                if (!resolved) {
                    throw Error("Resolved Request not returned on afterBroadcast hook. This value is needed for the Finality Callback plugin to work.")
                }
                setTimeout(async () => {
                    this.log('Checking transaction finality')
                    waitForFinality(resolved.transaction.id, context)
                        .then(() => {
                            this.log('Transaction finality reached')

                            this.onFinalityCallback()
                        })
                        .catch((error) => {
                            this.log('Error while checking transaction finality', error)
                        })
                }, START_CHECKING_FINALITY_AFTER)

                return Promise.resolve()
            }
        )
    }

    log(...args: any[]) {
        // eslint-disable-next-line no-console
        console.log('TransactPluginFinalityChecker, LOG:', ...args)
    }
}

let retries = 0

async function waitForFinality(transactionId: Checksum256, context: TransactContext): Promise<void> {
    console.log({transactionId})
    return new Promise((resolve, reject) => {
        context.client.v1.chain
            .get_transaction_status(transactionId)
            .then((response) => {
                if (response.state === 'IRREVERSIBLE') {
                    return resolve()
                }

                setTimeout(() => {
                    waitForFinality(transactionId, context).then(resolve).catch(reject)
                }, 5000)
            })
            .catch((error) => {
                if (error.response && error.response.status === 404 && retries < 3) {
                    retries++

                    setTimeout(() => {
                        waitForFinality(transactionId, context).then(resolve).catch(reject)
                    }, 5000)
                } else if (error.response.status === 500) {
                    reject(`This API node cannot be used with the finality callback plugin. Full Error: ${error}`)
                } else {
                    reject(error)
                }
            })
    })
}
