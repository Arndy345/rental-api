/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})
Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  // Route.get('auth/google', 'AuthController.redirect').as('social.login')
  // Route.get('auth/google', 'AuthController.handleCallback').as('social.login.callback')
  Route.post('/forgot-password', 'PasswordResetsController.forgot')
  Route.put('/reset-password/', 'PasswordResetsController.store')
  Route.get('/:provider/redirect', 'SocialAuthController.redirect')
  Route.get('/:provider/callback', 'SocialAuthController.callback')
  // Route.get('/google/redirect', async ({ ally }) => {
  //   return ally.use('google').redirect()
  // })
  // Route.get('/google/callback', async ({ ally }) => {
  //   console.log('herr')
  //   const google = ally.use('google')

  //   /**
  //    * User has explicitly denied the login request
  //    */
  //   if (google.accessDenied()) {
  //     return 'Access was denied'
  //   }

  //   /**
  //    * Unable to verify the CSRF state
  //    */
  //   if (google.stateMisMatch()) {
  //     return 'Request expired. Retry again'
  //   }

  //   /**
  //    * There was an unknown error during the redirect
  //    */
  //   if (google.hasError()) {
  //     return google.getError()
  //   }

  //   /**
  //    * Finally, access the user
  //    */
  //   const user = await google.user()
  //   console.log(user)
  // })

  Route.group(() => {
    Route.get('users', 'UsersController.index')
    Route.put('users/update', 'UsersController.update')
    Route.post('users/profile-picture', 'UsersController.uploadPic')
  }).middleware('auth:api')
}).prefix('api')
