const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const dbhost = process.env.DB_HOST || 'localhost';
const dbuser = process.env.DB_USER || 'root';
const dbpassword = process.env.DB_PASSWORD || '';
const dbname = process.env.DB_NAME || 'thread';

const USER_TYPE = 1;
const ADMIN_TYPE = 2;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());


const connection = mysql.createConnection({
  host: dbhost,
  user: dbuser,
  password: dbpassword,
  database: dbname
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.use(session({
  secret: 'SekretKoLangyun',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// app.post('/login', (req, res) => {
//   const { email, pass } = req.body;

//   const query = `SELECT * FROM user WHERE email = ? AND password = ?`;
//   connection.query(query, [email, pass], (err, results) => {



//     if (err) {
//       console.error(err);
//       return res.status(500).send('Internal Server Error');
//     }

//     if (results.length > 0) {
//       req.session.user = { email: results[0].email };
//       return res.status(200).json({ message: 'Login successful' }); // Optional
//     } else {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }



//     if (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     } else if (results.length > 0) {
//       req.session.user = { email: results[0].email };
//     } else {
//       // res.results;
//       res.status(401)
//     }
//   });
// });

app.post('/login', (req, res) => {
  const { email, pass } = req.body;

  const query = `SELECT * FROM user WHERE email = ? AND password = ?`;
  connection.query(query, [email, pass], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }

    if (results.length > 0) {
      req.session.user = { email: results[0].email };
      return res.status(200).json({ message: 'Success' });
    } else {
      return res.status(401).send("Invalid Credentials. Please try again!");
    }
  });
});

app.get('/getUserName', (req, res) => {
  if (req.session.user) {
    res.send(req.session.user.email);
  } else {
    res.send('Guest');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/index.html');
});

app.post('/register', (req, res) => {
  const { fname, lname, num, email, pass, cpass } = req.body;
  const query = `INSERT INTO user (firstname, lastname, num, email, password, confirmpassword, type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  connection.query(query, [fname, lname, num, email, pass, cpass, USER_TYPE], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect('/brands.html');
    }
  });
});

// insert after purchase
app.post('/api/purchase', (req, res) => {
  // const orders = req.body.purchased_order;
  const { shipping_info, orders } = req.body;

  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'Orders must be an array' });
  }

  // Merge shipping_info into each order item
  const fullOrders = orders.map(item => ({
    ...item,
    ...shipping_info
  }));

    // Prepare values for MySQL bulk insert
  const values = fullOrders.map(item => [
    item.buyer_uname,
    item.product_name,
    item.size,
    item.quantity,
    item.product_price,
    item.subtotal,
    item.shipping_name,
    item.shipping_email,
    item.shipping_address,
    item.shipping_contact
  ]);

  const insert = `INSERT INTO purchased_order (user_email, product_name, size, quantity, product_price, subtotal, shipping_name, shipping_email, shipping_address, shipping_contact) VALUES ?`;

  connection.query(insert, [values], (err, results) => {
    if (err) {
        console.error('Error executing database query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } else {
        res.json(results);
    }
  });
});

app.post("/loginadmin",(req,res) =>{
    const {email,pass} = req.body;
    const query = `SELECT * FROM user where email= ? AND password= ? AND type= ?`;
    connection.query(query, [email, pass, ADMIN_TYPE], (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect('/admin.html');
      }
    });
});

app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM user', (err, results) => {
      if (err) {
          console.error('Error fetching user data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});
app.get('/api/purchases', (req, res) => {
  connection.query('SELECT id, user_email, product_name, size, quantity, product_price, subtotal, shipping_name, shipping_email, shipping_address, shipping_contact, created_at FROM purchased_order', (err, results) => {
      if (err) {
          console.error('Error fetching purchase data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

app.get('/api/products/inkworth', (req, res) => {
    const query = `SELECT * FROM products where brand= ? AND availability= 1`;
    connection.query(query, ["inkworth"], (err, results) => {
      if (err) {
          console.error('Error fetching purchase data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

app.get('/api/products/gaboogie', (req, res) => {
    const query = `SELECT * FROM products where brand= ? AND availability= 1`;
    connection.query(query, ["gaboogie"], (err, results) => {
      if (err) {
          console.error('Error fetching purchase data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

app.get('/api/products/neversober', (req, res) => {
    const query = `SELECT * FROM products where brand= ? AND availability= 1`;
    connection.query(query, ["neversober"], (err, results) => {
      if (err) {
          console.error('Error fetching purchase data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

app.get('/api/products/sainttrad', (req, res) => {
    const query = `SELECT * FROM products where brand= ? AND availability= 1`;
    connection.query(query, ["sainttrad"], (err, results) => {
      if (err) {
          console.error('Error fetching purchase data:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});


process.on('SIGINT', () => {
  connection.end();
  process.exit();
  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
