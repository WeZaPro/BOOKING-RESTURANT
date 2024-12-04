const express = require('express');
const cors = require('cors');
const dbConfig = require('./app/config/db.config');
require('dotenv').config();
const app = express();

let corsOptions = {
  // origin: "http://localhost:8081",
  //origin: "http://localhost:5173",
  //origin: 'https://front-booking.onrender.com/',
  credentials: true,
  origin: true, // เปิดหมด
};

app.use(cors(corsOptions));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require('./app/models');
const Role = db.role;
db.mongoose.set('strictQuery', false);
db.mongoose
  .connect(process.env.MONGODBONLINE + process.env.DBNAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connect to MongoDB.');
    initial();
  })
  .catch((err) => {
    console.error('Connection error', err);
    process.exit();
  });

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to bezkoder application.' });
});

// routes

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/crud.routes')(app);
require('./app/routes/products.routes')(app);
require('./app/routes/googlesheetCRUD.routes')(app);

require('./app/routes/booking.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: 'user',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: 'moderator',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: 'admin',
      }).save((err) => {
        if (err) {
          console.log('error', err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
