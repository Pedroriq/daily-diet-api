import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { knex } from './database'

export const app = fastify()

app.register(cookie)

app.get('/hello', async () => {
  const tables = await knex('sqlite_schema').select('*')

  return tables
})
