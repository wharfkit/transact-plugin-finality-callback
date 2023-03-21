import {
    AbstractTransactPlugin,
    TransactContext,
    TransactHookResponseType,
    TransactHookTypes,
} from '@wharfkit/session'

/** Import JSON localization strings */
import defaultTranslations from './translations.json'

export class TransactPluginTemplate extends AbstractTransactPlugin {
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

        // Register any desired beforeSign hooks
        context.addHook(
            TransactHookTypes.beforeSign,
            async (request, context): Promise<TransactHookResponseType> => {
                // If this plugin is interacting with the UI, throw an error since this is an undefined function
                if (context.ui) {
                    throw new Error(
                        // Translate the error message against the given key or use the default value as English
                        t('beforesign', {
                            default: 'undefined beforeSign hook called from plugin template',
                        })
                    )
                } else {
                    // eslint-disable-next-line no-console
                    console.log('undefined beforeSign hook called with', request, context)
                }
                return
            }
        )

        // Register any desired afterSign hooks
        context.addHook(
            TransactHookTypes.afterSign,
            async (request, context): Promise<TransactHookResponseType> => {
                // If this plugin is interacting with the UI, throw an error since this is an undefined function
                if (context.ui) {
                    throw new Error(
                        // Translate the error message against the given key or use the default value as English
                        t('aftersign', {
                            default: 'undefined afterSign hook called from plugin template',
                        })
                    )
                } else {
                    // eslint-disable-next-line no-console
                    console.log('undefined afterSign hook called with', request, context)
                }
                return
            }
        )

        // Register any desired afterBroadcast hooks
        context.addHook(
            TransactHookTypes.afterBroadcast,
            async (request, context): Promise<TransactHookResponseType> => {
                // If this plugin is interacting with the UI, throw an error since this is an undefined function
                if (context.ui) {
                    throw new Error(
                        // Translate the error message against the given key or use the default value as English
                        t('afterbroadcast', {
                            default: 'undefined afterBroadcast hook called from plugin template',
                        })
                    )
                } else {
                    // eslint-disable-next-line no-console
                    console.log('undefined afterBroadcast hook called with', request, context)
                }
                return
            }
        )
    }
}
