import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class SocialAuthController {
  public async redirect({ ally, params }: HttpContextContract) {
    return ally.use(params.provider).redirect()
  }

  public async callback({ ally, params }: HttpContextContract) {
    const provider = ally.use(params.provider)
    // console.log(provider)
    /**
     * User has explicitly denied the login request
     */
    if (provider.accessDenied()) {
      return 'Access was denied'
    }

    /**
     * Unable to verify the CSRF state
     */
    if (provider.stateMisMatch()) {
      return 'Request expired. Retry again'
    }

    /**
     * There was an unknown error during the redirect
     */
    if (provider.hasError()) {
      return provider.getError()
    }

    /**
     * Finally, access the user
     */
    const oauthUser = await provider.user()
    const user = await User.firstOrCreate(
      { email: oauthUser.email },
      {
        fullname: oauthUser.name,
        email: oauthUser.email,
        oauthProvider: params.provider,
        oauthProviderId: oauthUser.id,
      }
    )
    return user
  }
}
