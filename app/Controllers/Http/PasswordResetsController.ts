import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import Token from 'App/Models/Token'
export default class PasswordResetsController {
  public async sendEmail(email, token) {
    // const resetLink = Route.makeUrl('PasswordResetsController.store', [token])
    Mail.sendLater((message) => {
      message.from('noreply@rental-api').to(email).subject('Reset your password').html(
        `Use this Token: <h3>${token}</h3>`
        // or Reset your password by <a href="${Env.get(
        // 'DOMAIN'
        // )}${resetLink}">clicking here</a>`
      )
    })
  }
  public async forgot({ request }: HttpContextContract) {
    const validator = schema.create({
      email: schema.string({}, [rules.email()]),
    })
    const data = await request.validate({ schema: validator })

    const userEmail = await User.findBy('email', data.email)
    if (userEmail) {
      const token = await Token.generatePasswordResetToken(userEmail)

      await this.sendEmail(data.email, token)
      return 'Email Sent, check email'
    }
    return 'Wrong Email'
  }

  public async store({ request, response, auth, params }: HttpContextContract) {
    const token = params.token || request.body().token

    const isValidToken = await Token.verify(token, 'PASSWORD_RESET')
    if (!isValidToken) return 'Invalid Token'
    const passwordSchema = schema.create({
      password: schema.string([rules.minLength(8)]),
    })

    response.status(201)
    const password = await request.validate({ schema: passwordSchema })
    const user = await Token.getTokenUser(token, 'PASSWORD_RESET')

    if (!user) {
      return 'Error, Token expired or associated user could not be found'
    }

    await user.merge({ password: password.password }).save()
    await auth.login(user)
    await Token.expireTokens(user)

    return 'Password changed successfully'
  }
}
