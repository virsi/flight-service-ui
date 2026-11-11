import { resolve } from 'path'

import { generateApi } from 'swagger-typescript-api'

generateApi({
  fileName: 'Api.ts',
  output: resolve(process.cwd(), './src/shared/api'),
  url: 'http://localhost:8080/swagger/doc.json',
  httpClientType: 'axios',
  moduleNameIndex: 1, // /api/flight-resources -> api.flightResources.*
})
