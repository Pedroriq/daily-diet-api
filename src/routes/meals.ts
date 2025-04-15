import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { string, z } from 'zod'
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
    return reply.send({ meals })
  })

  app.get(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealsParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return { meal }
    },
  )

  app.patch(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealsParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: string().optional(),
        description: string().optional(),
        date: z.coerce.date().optional(),
        diet: z.boolean().optional(),
      })

      const { name, description, date, diet } = updateMealBodySchema.parse(
        request.body,
      )

      const meal = await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .update({ name, description, date, diet })

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealsParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found!' })
      }

      await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()
        .delete()

      return reply.status(204).send()
    },
  )
  app.get(
    '/metrics',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const totalMeals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('date', 'desc')

      const dietMeals = await knex('meals')
        .where({
          user_id: request.user?.id,
          diet: true,
        })
        .count('id', { as: 'total diet' })
        .first()

      const notDietMeals = await knex('meals')
        .where({
          user_id: request.user?.id,
          diet: false,
        })
        .count('id', { as: 'total not diet' })
        .first()

      let sequence = 0
      let biggestSequence = 0

      for (const meal in totalMeals) {
        if (totalMeals[meal].diet) {
          sequence += 1
          if (sequence > biggestSequence) {
            biggestSequence = sequence
          }
        } else {
          sequence = 0
        }
      }

      return reply.send({
        totalMeals: totalMeals.length,
        totalDiets: dietMeals?.['total diet'],
        totalNotDiets: notDietMeals?.['total not diet'],
        sequenceMeals: biggestSequence,
      })
    },
  )
}
