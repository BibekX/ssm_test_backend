const express = require("express");
const multer = require("multer");
const router = express.Router();

const dbService = require("../services/databaseService");
const _serviceHelper = require("../utils/serviceHelper");
const _itemsService = require("../services/itemsService");

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/product');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage })

// Returns formated local time date string
function getDateString() {
    let date = new Date(Date.now());

    return (
        `${date.getFullYear()}-` +
        `${String(date.getMonth()).padStart(2, "0")}-` +
        `${String(date.getDate()).padStart(2, "0")} ` +
        `${String(date.getHours()).padStart(2, "0")}:` +
        `${String(date.getMinutes()).padStart(2, "0")}:` +
        `${String(date.getSeconds()).padStart(2, "0")}.` +
        `${String(date.getMilliseconds()).padStart(3, "0")} ` +
        `${date
            .toLocaleDateString(undefined, { day: "2-digit", timeZoneName: "short" })
            .substring(4)}`
    );
}

// Gets called for every route to /product[s]
// Logs info to console
router.use((req, res, next) => {
    var incoming_ip =
        req.headers["x-forwarded-for"] != undefined
            ? req.headers["x-forwarded-for"]
            : req.ip;
    console.log(
        `[${getDateString()}]${incoming_ip}-> ${String(req.method).padEnd(
            5,
            " "
        )} ${req.url}`
    );
    next();
});

/*
 * Items Related
 * - Get all items
 * - Get specific item by id
 * - Get all items by category id
 * - Get all items by sub-category id
 * - Get all items by brand id
 * - Get all items by tag id
 * - Get all items by date range
 * - Add new items
 * - Update items by ids
 */

router.get("/getItems", async (req, res) => {
    /*
        #swagger.tags = ['items']
        #swagger.summary = 'Get item(s) in map form'
        #swagger.parameters['ids'] = {
          in: 'body',
          required: true,
          type: 'array',
          description: 'List of itemIds. Returns all items if empty list is given.',
          schema: [{ $ref: "#/definitions/ObjectId" }]
        }
        #swagger.responses[200] = {
        }
      */
    try {
        //   _serviceHelper.checkUser(req, req.body.username);

        //   let itemIds = req.body.ids;

        let msg = await _itemsService.getItems(req);
        _serviceHelper.sendMsg(res, msg);
    } catch (errMsg) {
        _serviceHelper.sendMsg(res, errMsg);
    }
});

router.get("/products", async (req, res) => {
    /*
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          } 
      */
    try {
        let data = await dbService.getAllProducts();
        console.log(data);

        if (data.length > 100) {
            // For large json objects, this is needed for swagger to stop trying to show it inline and and freeze
            res.setHeader(
                "Content-Disposition",
                'inline; swaggerDownload="attachment"; filename="response.json"'
            );
        }

        res.setHeader("Content-Type", "application/json");
        return res.status(201).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/:id", upload.single('product_image'), async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let id = req.params.id;
        let product = JSON.parse(req.body.product);
        console.log(product)
        console.log('image', req.file)
        let data = await _itemsService.updateItemById(req, id, product);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get("/products/get", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let data = await _itemsService.getItems(req);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get("/products/:id", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let id = req.params.id;
        let data = await _itemsService.getItemById(req, id);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/products/getByType", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let selector = req.body;
        console.log(selector)
        let data = await _itemsService.getItemByType(req, selector);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});


router.post("/products/updateBySelector", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let selector = req.body;
        let item = req.body;
        let data = await _itemsService.getItemByType(req, selector, item);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

/*
 * Category Related
 * - Get all categories
 * - Get all categories by date range
 * - Get specific catgory by id
 * - Add new category
 * - Update cateogries by ids
 */
router.get("/products/category/get", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let data = await _itemsService.getCategories(req);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/products/category/getByDate", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        // TODO extract product object according to model
        let product = req.body.product;

        await dbService.getItemsByDate(product);
        return res.status(201).send();
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/category/getByRoutingName", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        let routeName = req.body;
        console.log(routeName)
        let result = await _itemsService.getByRoute(req, routeName);
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get("/products/category/:id", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let id = req.params.id;
        let data = await _itemsService.getItemsByCtgyId(req, id);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get("/image/:id", async (req, res) => {
    /*  
          #swagger.tags = ['Store']
          #swagger.summary = 'Get all products in a product category'
          #swagger.responses[200] = { 
              schema: { $ref: '#/definitions/Products' }
          }
      */
    try {
        let id = req.params.id;
        let data = await _itemsService.getImage(req, id);

        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/category/add", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        let newCategory = req.body;
        console.log("check req", req.body);
        let result = await _itemsService.addCtgy(req, newCategory);
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/category/update/:id", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        let ctgy = req.body;
        let id = req.params.id;
        console.log("check req", req.body);
        let result = await _itemsService.updateCtgy(req, id, ctgy);
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/category/updateMany", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        let ctgy = req.body;
        console.log("check req", req.body);
        let result = await _itemsService.updateManyCtgy(req, ctgy);
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/addOldItems", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Add a product'
          #swagger.parameters['product'] = {
              in: 'body',
              schema: { $ref: '#/definitions/Product' }
          }
      */
    try {
        // TODO extract product object according to model
        console.log('add old items');
        let newProducts = req.body;
        console.log('This is new product', newProducts);
        let result = await _itemsService.addItems(req, newProducts);
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get("/getOldItems", async (req, res) => {
    try {
        let data = await _itemsService.getOldItems(req);
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
})

router.get("/categories", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Get all product categories'
          #swagger.responses[200] = {
              in: 'body',
              schema: { $ref: '#/definitions/Categories' }
          }
      */

    try {
        let data = await dbService.getProductCategories();
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get("/categories/filters/", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Get all product categories'
          #swagger.responses[200] = {
              in: 'body',
              schema: { $ref: '#/definitions/Categories' }
          }
      */

    try {
        let data = await _itemsService.getFilter(req);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.post("/categories/filters/add", async (req, res) => {
    /*  #swagger.tags = ['Store']
          #swagger.summary = 'Get all product categories'
          #swagger.responses[200] = {
              in: 'body',
              schema: { $ref: '#/definitions/Categories' }
          }
      */

    try {
        // let newFilter = [
        //   {
        //     name: { en: 'By Storage' },
        //     filters: [
        //       { displayName: { en: 'Chilled' } },
        //       { displayName: { en: 'Frozen' } }
        //     ],
        //     usedByCategory: '63db88b0c86ca84e99accf19'
        //   },
        //   {
        //     name: { en: 'Special Needs' },
        //     filters: [{ displayName: { en: 'MSC Certified' } }, { displayName: { en: 'Wild Caught' } }, { displayName: { en: 'Farmed' } }],
        //     usedByCategory: '63db88b0c86ca84e99accf19'
        //   },
        //   {
        //     name: { en: 'By Size' },
        //     filters: [{ displayName: { en: 'Whole Fish' } }, { displayName: { en: 'Baby Size' } }, { displayName: { en: 'Fillet' } }],
        //     usedByCategory: '63db88b0c86ca84e99accf19'
        //   }
        // ]
        // let newFilter = [
        //   {
        //     name: { en: 'By Storage' },
        //     filters: [
        //       { displayName: { en: 'Fresh' } },
        //       { displayName: { en: 'Frozen' } }
        //     ],
        //     usedByCategory: '63dbdd052fd38d267f36af2f'
        //   },
        //   {
        //     name: { en: 'Special Needs (Veggies & Fruits)' },
        //     filters: [{ displayName: { en: 'Organic' } }],
        //     usedByCategory: '63dbdd052fd38d267f36af2f'
        //   },
        //   {
        //     name: { en: 'Special Needs (Bakery)' },
        //     filters: [{ displayName: { en: 'Gluten free' } }, { displayName: { en: 'Ketogenic' } }, { displayName: { en: 'Paleo' } }],
        //     usedByCategory: '63dbdd052fd38d267f36af2f'
        // },

        // ]

        let newFilter = req.body;
        console.log(newFilter)
        let data = await _itemsService.addFilter(req, newFilter);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(JSON.stringify(data));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

module.exports = router;
