import * as Client from '@web3-storage/w3up-client'
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Proof from '@web3-storage/w3up-client/proof'
import { Signer } from '@web3-storage/w3up-client/principal/ed25519'

const KEY = process.env.NEXT_PUBLIC_W3_KEY
const PROOF = process.env.NEXT_PUBLIC_W3_PROOF

let clientPromise

export function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      if (!KEY || !PROOF) {
        throw new Error('Missing W3_KEY or W3_PROOF in environment variables')
      }
      const principal = Signer.parse(KEY)
      const store = new StoreMemory()
      const client = await Client.create({ principal, store })

      const proof = await Proof.parse(PROOF)
      const space = await client.addSpace(proof)
      await client.setCurrentSpace(space.did())

      return client
    })()
  }

  return clientPromise
}
