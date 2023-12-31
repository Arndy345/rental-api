import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).nullable()
      table.string('oauth_provider').nullable()
      table.string('oauth_provider_id').nullable()
      table.string('fullname').notNullable()
      table.string('phone').nullable()
      table.string('location').nullable()
      table.string('profile_picture').nullable()
      table.string('remember_me_token').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
