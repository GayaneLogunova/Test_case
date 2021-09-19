module.exports = {
  development: {
    client: 'postgres',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'postgres',
      password : 'example',
      database : process.env.DB_NAME//'lessons_reports'
    },
  },
};