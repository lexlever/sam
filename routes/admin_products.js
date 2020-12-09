const express = require('express')
const { validationResult, check } = require('express-validator')
const route = express.Router()
const imageMimetype = ['image/jpeg', 'image/png', 'image/jpg']
const auth = require('../config/auth')
const isAdmin = auth.isAdmin;

const Product = require('../models/product')
const Category = require('../models/categories')
const categories = require('../models/categories')


route.get('/',isAdmin, function (req, res) {
    var count
    Product.count((err, c) => {
        count = c
    })
    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        })
    })
});

route.get('/add-product',isAdmin, (req, res) => {
    var title = ''
    var desc = ''
    var price = ''

    Category.find((err, categories) => {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        })
    })
})


/*
* POST add product
*/
route.post('/add-product', [
    check('title', 'Title must have a value.').notEmpty(),
    check('desc', 'Description must have a value.').notEmpty(),
    check('price', 'Price must have a value.').notEmpty()

],async(req, res) => {
    var title = req.body.title;
     var slog = req.body.title
     var desc = req.body.desc;
     var price = req.body.price;
     var category = req.body.category;
     var img = req.body.img
     var multiple = req.body.multiple

     const errors = validationResult(req)
     if(!errors.isEmpty()) {
         const alert = errors.array()
         Category.find((err, categories) => {
             res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                category: category,
                price: price
             })
         })
     } else {
         Product.findOne({slog: slog}, (err, product) => {
             if(product) {
                 req.flash('danger', 'Product title exists please choose another')
                 Category.find((err, categories) => {
                     res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                     })
                 })
             }
         })
     }
     var product = new Product({
        title,
        slog,
        category,
        desc,
        price
    })
    saveImage(product, img)
    multipleImage(product, multiple)
    try{
        const newProduct = await product.save();
        console.log(newProduct);  
        req.flash('success', 'Product added!');
        res.redirect('/admin/products')
      }catch (err){
        console.log(err);    
     
      }
     console.log(product)
})

function saveImage(movie, imageEncoded) {
    if(imageEncoded == null) return

    const img = JSON.parse(imageEncoded)

    if(img != null && imageMimetype.includes(img.type)) {
        movie.img = new Buffer.from(img.data, 'base64');
        movie.imgType = img.type
    }
}

function multipleImage(movie, imageEncoded) {
    if(imageEncoded == null) return

    const multiple = JSON.parse(imageEncoded)

    if(multiple != null && imageMimetype.includes(multiple.type)) {
        movie.multiple = new Buffer.from(multiple.data, 'base64');
        movie.multipleType = multiple.type
    }
}

route.get('/delete-product/:id',isAdmin, function (req, res) {
    Product.findByIdAndRemove(req.params.id, (err, category) => {
        if(err) console.log(err)
        
        req.flash('success', 'product successfully deleted')
        res.redirect('/admin/products')
    })
});

module.exports = route