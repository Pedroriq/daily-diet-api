import { expect, it, beforeAll, beforeEach, afterAll, describe } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const cookies = createUser.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: '2024-06-25 8:00:00',
        diet: true,
      })
      .expect(201)
  })

  it('should be able verify all users meals', async () => {
    const createUser = await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const cookies = createUser.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: '2024-06-25 8:00:00',
        diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Bolo de chocolate com cobertura de cenoura',
        description: 'Um bolo que contém beterraba',
        date: '2025-06-17 8:00:00',
        diet: false,
      })
      .expect(201)

    const listAllMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies || [])

    expect(listAllMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: new Date('2024-06-25 8:00:00').getTime(),
        diet: 1,
      }),
      expect.objectContaining({
        name: 'Bolo de chocolate com cobertura de cenoura',
        description: 'Um bolo que contém beterraba',
        date: new Date('2025-06-17 8:00:00').getTime(),
        diet: 0,
      }),
    ])
  })

  it('should be able to verify a specific transation', async () => {
    const createUser = await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const cookies = createUser.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: '2024-06-25 8:00:00',
        diet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies || [])

    const mealId = listMealResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies || [])

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: new Date('2024-06-25 8:00:00').getTime(),
        diet: 1,
      }),
    )
  })

  it('should be able to update a meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const cookies = createUser.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: '2024-06-25 8:00:00',
        diet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies || [])

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies || [])
      .send({ name: 'Pamonha alterada com tempero especial' })
      .expect(201)

    const updatedMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies || [])

    expect(updatedMeal.body.meal).toEqual(
      expect.objectContaining({
        name: 'Pamonha alterada com tempero especial',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUser = await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const cookies = createUser.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies || [])
      .send({
        name: 'Pamonha',
        description: 'Pamonha da vó',
        date: '2024-06-25 8:00:00',
        diet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies || [])

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies || [])
      .expect(204)
  })
})
