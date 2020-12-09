var express = require('express')
var path = require('path')
var morgan = require('morgan')
var mongoose = require('mongoose')
const config = require('./config/database')
const bodyParser = require('body-parser')
const session = require('express-session')
const { check, validationResult } = require('express-validator');
const fileUpload = require('express-fileupload')
const passport = require('passport')

var app = express()

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')


//set globals
app.locals.errors = null

app.use(fileUpload())


//get page model
var Page = require('./models/model')

Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
  if(err) console.log(err)
  app.locals.pages = pages
});

//get category model
var Category = require('./models/categories')

Category.find((err, categories) => {
  if(err) console.log(err)
  app.locals.categories = categories
})

//connect to database
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })

  const conn = mongoose.connection;
  conn.on('error', console.error.bind(console, 'connection error:'));
  conn.once('open', function() {
  
    // we're connected!
    console.log('successfully connected to database')
  });

//setting public folders
app.use(morgan('short'))
app.use(express.static(path.join(__dirname, 'public')))


//body parser middle wear
app.use(bodyParser.urlencoded({extended:false}))

app.use(bodyParser.json())


//express session middle wear
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }))
  

  //express messages middle wear
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart
  res.locals.user = req.user || null
  next()
})

//using routers in admin
const pages = require('./routes/pages')
const admin = require('./routes/admin')
const category = require('./routes/admin_categories')
const adminProducts = require('./routes/admin_products')
const products = require('./routes/products')
const cart = require('./routes/cart')
const users = require('./routes/users')





app.use('/', pages)
app.use('/admin/pages', admin)
app.use('/admin/category', category)
app.use('/admin/products', adminProducts)
app.use('/products/product', products)
app.use('/cart', cart)
app.use('/users', users)




//starting server
const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log('listening on port ', port)
})