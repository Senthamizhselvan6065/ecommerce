const mongoose = require('mongoose');

const connectMongoDb = () => {
   let DB_URI = `mongodb://127.0.0.1:27017/ecommerce`;
   mongoose.connect(DB_URI, {
      useNewUrlParser:true,
      useUnifiedTopology:true
   })
   .then(con => console.log(`Mongodb is connect to the PORT:${con.connection.host}`))
};

module.exports = connectMongoDb;