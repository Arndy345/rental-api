import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const validator = schema.create({
      email: schema.string({}, [rules.email()]),
      password: schema.string(),
    })
    const data = await request.validate({ schema: validator })
    const token = await auth.use('api').attempt(data.email, data.password, {
      expiresIn: '10 days',
    })
    return token.toJSON()
  }
  public async register({ request, auth }: HttpContextContract) {
    /**
     * Create a new user
     */
    const validator = schema.create({
      email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
      password: schema.string({}, [rules.confirmed(), rules.minLength(8)]),
      fullname: schema.string(),
    })
    const data = await request.validate({ schema: validator })

    const user = await User.create(data)

    const token = await auth.use('api').login(user, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }
}
