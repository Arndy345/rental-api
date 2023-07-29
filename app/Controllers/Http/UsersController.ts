import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
const Cloudinary = require('cloudinary')
// const Drive = require('Drive')
// const Helpers = require('Helpers')

export default class UsersController {
  public async index({ auth }: HttpContextContract) {
    const user = await User.find(auth.user?.id)
    return user
  }
  public async update({ request, response, auth }: HttpContextContract) {
    const body = request.body()
    response.status(201)
    const user = await User.updateOrCreate({ id: auth.user?.id }, body)
    return user
  }

  public async uploadPic({ request, response, auth }: HttpContextContract) {
    try {
      const image = request.file('image')
      const id = auth.user?.id
      const user = await User.find(id)

      const cloudinaryUpload = await Cloudinary.uploader.upload(image?.tmpPath, {
        public_id: `rentals/images/profile-pictures/${id}`,
      })
      if (user) {
        user.profile_picture = cloudinaryUpload.secure_url
        user?.save()

        return user
      }
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        message: 'Image upload failed.',
      })
    }
  }
}
