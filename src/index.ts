import {
    AbstractTransactPlugin,
    TransactContext,
    TransactHookResponseType,
    TransactHookTypes,
    Transaction,
} from '@wharfkit/session'

/** Import JSON localization strings */
import defaultTranslations from './translations.json'

const START_CHECKING_FINALITY_AFTER = 300000 // 5 minutes

export class FinalityCheckerTransactPlugin extends AbstractTransactPlugin {
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
        // Optional - Retrieve the translation function from the UI if it exists
        let t
        if (context.ui) {
            t = context.ui.getTranslate()
        }

        // Register any desired afterBroadcast hooks
        context.addHook(
            TransactHookTypes.afterBroadcast,
            (request, context): Promise<TransactHookResponseType> => {
                setTimeout(async () => {
                    waitForFinality(request.getRawTransaction(), context).then(() => {
                        if (context.ui) {
                            context.ui.status(
                                t('finalityChecker.success', {default: 'Transaction is final.'})
                            )
                        }
                    })
                }, START_CHECKING_FINALITY_AFTER)
            }
        )
    }
}

async function waitForFinality(transaction: Transaction, context: TransactContext): Promise<void> {
    return new Promise((resolve, reject) => {
        context.client.v1.history
            .get_transaction(transaction.id)
            .then((response) => {
                const isIrreversible = response.block_num <= response.last_irreversible_block
                const irreversibleEta =
                    Math.max(
                        Number(response.block_num) - Number(response.last_irreversible_block) / 2,
                        0
                    ) * 1000

                if (isIrreversible) {
                    return resolve()
                }

                setTimeout(() => {
                    waitForFinality(transaction, context).then(resolve).catch(reject)
                }, irreversibleEta)
            })
            .catch(reject)
    })
}
