module.exports = {
  development: {
    client: 'postgres',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'postgres',
      password : 'example',
      database : 'lessons_reports'
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};