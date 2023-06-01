const express = require('express');
const cors = require('cors');


// Express APIs
const api = require('./routes/auth.routes');
const cart = require('./routes/cart.routes');

// Express settings
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true,
  }),
);

// Serve static resources
app.use('/public', express.static('public'));
app.use('/', api);
app.use('/cart', cart);


app.listen(4000, () => {
  console.log('Connected to port ' + 4000);
});
