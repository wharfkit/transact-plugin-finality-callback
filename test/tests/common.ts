import {Session, SessionArgs, SessionOptions} from '@wharfkit/session'
import sinon from 'sinon'
import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'

import {mockFetch} from '$test/utils/mock-fetch'
import {TransactPluginFinalityChecker} from '$lib'

const wallet = new WalletPluginPrivateKey('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s')

const mockSessionArgs: SessionArgs = {
    chain: {
        id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        url: 'https://jungle4.greymass.com',
    },
    permissionLevel: 'wharfkit1131@test',
    walletPlugin: wallet,
}

const mockSessionOptions: SessionOptions = {
    fetch: mockFetch, // Replace `mockFetch` with `null` if it's not defined
    transactPlugins: [],
}

suite('TransactPluginFinalityChecker', () => {
    let onFinalityCallback: sinon.SinonSpy
    let finalityCheckPlugin: TransactPluginFinalityChecker
    let clock: sinon.SinonFakeTimers

    setup(() => {
        onFinalityCallback = sinon.spy()
        finalityCheckPlugin = clock = sinon.useFakeTimers()
    })

    teardown(() => {
        clock.restore()
    })

    test('should call onFinalityCallback when finality is reached', (done) => {
        const session = new Session(mockSessionArgs, {
            ...mockSessionOptions,
            transactPlugins: [
                new TransactPluginFinalityChecker({
                    onFinalityCallback: () => {
                        done()
                    },
                }),
            ],
        })
        const action = {
            authorization: [
                {
                    actor: 'wharfkit1131',
                    permission: 'test',
                },
            ],
            account: 'eosio.token',
            name: 'transfer',
            data: {
                from: 'wharfkit1131',
                to: 'wharfkittest',
                quantity: '0.0001 EOS',
                memo: 'wharfkit plugin - resource provider test (maxFee: 0.0001)',
            },
        }
        session
            .transact(
                {
                    action,
                },
                {broadcast: true}
            )
            .then(() => {
                // Simulate the passage of time to trigger the setTimeout behavior
                clock.tick(200000)
            })
    })
})
