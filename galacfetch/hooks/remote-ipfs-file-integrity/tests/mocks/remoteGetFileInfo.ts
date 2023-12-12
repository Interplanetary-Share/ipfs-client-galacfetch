import { IRemoteFileInfo } from '@intershare/hooks.remote-ipfs-file-manager'
import { faker } from '@faker-js/faker'

export const generateGetFileInfo = (): IRemoteFileInfo => {
  return {
    cid: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 4 }),
    description: faker.lorem.sentences({ min: 3, max: 10 }),
    type: faker.system.mimeType(),
    size: faker.number.int({ min: 100, max: 1000000 }),
    token: faker.string.uuid(),
    serverAlias: faker.lorem.word(),
    isPublic: faker.datatype.boolean(),
    updatedAt: faker.date.recent().toISOString(),
    createdAt: faker.date.recent().toISOString(),
  }
}
