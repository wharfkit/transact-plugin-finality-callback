import {
    AbstractTransactPlugin,
    TransactContext,
    TransactHookResponseType,
    TransactHookTypes,
    Transaction,
} from '@wharfkit/session'

/** Import JSON localization strings */
import defaultTranslations from './translations.json'

const START_CHECKING_FINALITY_AFTER = 150000 // 2.5 minutes

interface TransactPluginFinalityCheckerOptions {
    onFinalityCallback: () => void
}

export class TransactPluginFinalityChecker extends AbstractTransactPlugin {
    onFinalityCallback: () => void

    constructor({onFinalityCallback}: TransactPluginFinalityCheckerOptions) {
        super()

        // Optional - Set the default translations for the plugin
        this.onFinalityCallback = onFinalityCallback
    }

    /** A unique ID for this plugin */
    id = 'transact-plugin-template'

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
            (request, context): Promise<TransactHookResponseType> => {
                setTimeout(async () => {
                    this.log('Checking transaction finality')
                    waitForFinality(request.getRawTransaction(), context)
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

async function waitForFinality(transaction: Transaction, context: TransactContext): Promise<void> {
    return new Promise((resolve, reject) => {
        context.client.v1.history
            .get_transaction(transaction.id)
            .then((response) => {
                const isIrreversible = response.block_num >= response.last_irreversible_block
                const irreversibleEta =
                    Math.max(
                        (Number(response.block_num) - Number(response.last_irreversible_block)) / 2,
                        0
                    ) * 1000

                if (isIrreversible) {
                    return resolve()
                }

                setTimeout(() => {
                    waitForFinality(transaction, context).then(resolve).catch(reject)
                }, irreversibleEta)
            })
            .catch((error) => {
                if (error.response && error.response.status === 404 && retries < 3) {
                    retries++

                    setTimeout(() => {
                        waitForFinality(transaction, context).then(resolve).catch(reject)
                    }, 5000)
                } else {
                    reject(error)
                }
            })
    })
}
