import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        diet: z.boolean(),
      })

      const { name, description, date, diet } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        user_id: request.user?.id,
        name,
        description,
        date: date.getTime(),
        diet,
      })

      return reply.status(201).send()
    },
  )

  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const meals = await knex('meals').where({ user_id: request.user?.id })
    console.log(request.user?.id)
    return reply.send({ meals })
  })

  app.get('/:mealId', { preHandler: checkSessionIdExists }, async (request) => {
    const getParamsSchema = z.object({
      mealsId: z.string().uuid(),
    })

    console.log(request.params)

    const { mealsId } = getParamsSchema.parse(request.params)

    console.log('chegou aqui')

    const meal = await knex('users').where({ id: mealsId }).first()

    return { meal }
  })
}
