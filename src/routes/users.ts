import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { firstName, lastName, email } = createUserBodySchema.parse(
      request.body,
    )

    const existEmail = await knex('users').where({ email }).first()

    if (existEmail) {
      return reply.status(401).send({ message: 'User already exists' })
    }

    await knex('users').insert({
      id: randomUUID(),
      session_id: sessionId,
      first_name: firstName,
      last_name: lastName,
      email,
      created_at: new Date(),
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select()

    return users
  })
}
