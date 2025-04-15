import { expect, it, beforeAll, beforeEach, afterAll, describe } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        firstName: 'Douglas',
        lastName: 'da Silva',
        email: 'douglasdasilva@orkut.com.br',
      })
      .expect(201)
  })

  it('should be able to see users created', async () => {
    await request(app.server).post('/users').send({
      firstName: 'Douglas',
      lastName: 'da Silva',
      email: 'douglasdasilva@orkut.com.br',
    })

    const listUsers = await request(app.server).get('/users').expect(200)

    expect(listUsers.body.users).toEqual([
      expect.objectContaining({
        first_name: 'Douglas',
        last_name: 'da Silva',
        email: 'douglasdasilva@orkut.com.br',
      }),
    ])
  })
})
