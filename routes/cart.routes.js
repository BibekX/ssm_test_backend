const express = require('express');
const authorize = require('../middlewares/auth');
const router = express.Router();

let carts = [{ user: 1, cart: [] }];

// get cart by user id
router.get(
    '/getCartByUserId/:id',
    (req, res, next) => {
        console.log(carts);
        let id = Number(req.params.id);
        let index = carts.findIndex(eachCart => eachCart.user == id);
        if (index == -1) {
            carts.push({ user: id, cart: [] });
        }
        res.json(carts[index]);
    }
);

//post cart by user id
router.post(
    '/updateCartByUserId/:id',
    (req, res, next) => {
        console.log('update');
        console.log(req.body.cart);
        let index = carts.findIndex(cart => cart.user == req.params.id);
        if (index > -1) {
            carts[index].cart = req.body.cart;
        }
    }
);



module.exports = router;
