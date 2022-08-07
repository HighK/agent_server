import mysql from 'mysql2';

const config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
};

let connection = mysql.createPool(config);

connection.on('error', function() {});

export default connection;
