import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import { string } from '@ioc:Adonis/Core/Helpers'
import User from 'App/Models/User'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime()
  public expires_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  // public static async generateVerifyEmailToken(user: User) {
  //   const token = string.generateRandom(64)

  //   await Token.expireTokens(user, 'verifyEmailTokens')
  //   const record = await user.related('tokens').create({
  //     type: 'VERIFY_EMAIL',
  //     expiresAt: DateTime.now().plus({ hours: 24 }),
  //     token,
  //   })

  //   return record.token
  // }

  public static async generatePasswordResetToken(user: User | null) {
    const token = string.generateRandom(5)

    if (!user) return token
    await Token.expireTokens(user)
    const expires_at = DateTime.now().plus({ hour: 1 })
    const record = await user.related('token').create({
      type: 'PASSWORD_RESET',
      // @ts-ignore
      expires_at: expires_at.toSQL(),
      token,
    })

    return record.token
  }

  public static async expireTokens(user: User) {
    await user.related('token').query().update({
      expires_at: DateTime.now(),
    })
  }

  public static async getTokenUser(token: string, type: TokenType) {
    const record = await Token.query()
      .preload('user')
      .where('token', token)
      .where('type', type)
      // @ts-ignore
      .where('expires_at', '>', DateTime.now().toSQL())
      .first()
    return record?.user
  }

  public static async verify(token: string, type: TokenType) {
    const record = await Token.query()
      // @ts-ignore
      .where('expires_at', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first()
    return !!record
  }
}
