import fetch, {Response} from 'node-fetch'
import {join as joinPath} from 'path'
import {promisify} from 'util'
import {readFile as _readFile, writeFile as _writeFile} from 'fs'

const readFile = promisify(_readFile)
const writeFile = promisify(_writeFile)

function getFilename(path: string, params?: unknown) {
    const pathParts = path.split('/')

    return joinPath(__dirname, '../data', pathParts[pathParts.length - 1] + '.json')
}

async function getExisting(filename: string) {
    try {
        const data = await readFile(filename)

        return JSON.parse(data.toString('utf8'))
    } catch (error) {
        if ((<any>error).code !== 'ENOENT') {
            throw error
        }
    }
}

export async function mockFetch(path, params) {
    const filename = getFilename(path, params)
    if (process.env['MOCK'] !== 'overwrite') {
        const existing = await getExisting(filename)
        if (existing) {
            return new Response(JSON.stringify(existing.json), {
                status: existing.status,
                headers: existing.headers,
            })
        }
    }
    if (process.env['MOCK']) {
        const response = await fetch(path, params)
        const cloned = response.clone()
        const json = await cloned.json()
        await writeFile(
            filename,
            JSON.stringify(
                {
                    request: {
                        path,
                        params,
                    },
                    headers: Object.fromEntries(response.headers.entries()),
                    status: response.status,
                    json,
                    text: JSON.stringify(json),
                },
                undefined,
                4
            )
        )
        return response
    } else {
        throw new Error(`No data for ${path}`)
    }
}
