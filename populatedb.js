#! /usr/bin/env node

console.log('This script populates some foods to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Food = require('./models/food')
var Foodtype = require('./models/foodtype')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var foodtypes = []
var foods = []

function foodtypesCreate(description, cb) {
  var foodtype = new Foodtype({ description: description });
       
  foodtype.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Food type: ' + foodtype);
    foodtypes.push(foodtype)
    cb(null, foodtype);
  }   );
}

function foodCreate(name, summary, price,amount, foodtype, cb) {
  fooddetail = { 
    name: name,
    summary: summary,
    price: price,
    amount: amount,
  }
  if (foodtype != false) fooddetail.foodtype = foodtype
    
  var food = new Food(fooddetail);    
  food.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Food: ' + food);
    foods.push(food)
    cb(null, food)
  }  );
}



function createFoodType(cb) {
  async.series([
      function(callback) {
        foodtypesCreate("Meat", callback);
      },
      function(callback) {
        foodtypesCreate("Fruit", callback);
      },
      function(callback) {
        foodtypesCreate("Vegetable", callback);
      },
      function(callback) {
        foodtypesCreate("Wheat", callback);
      },
      function(callback) {
        foodtypesCreate("Dairy", callback);
      },
      ],
      // optional callback
      cb);
}


function createFoods(cb) {
    async.parallel([
        function(callback) {
          foodCreate('Apple', 'An apple is an edible fruit produced by an apple tree (Malus domestica). Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus. The tree originated in Central Asia, where its wild ancestor, Malus sieversii, is still found today. ', 5, 10, [foodtypes[1],], callback);
        },
        function(callback) {
          foodCreate("Orange", 'An orange is a fruit of various citrus species in the family Rutaceae. it primarily refers to Citrus sinensis, which is also called sweet orange, to distinguish it from the related Citrus  aurantium, referred to as bitter orange. The sweet orange reproduces asexually; varieties of sweet orange arise through mutations', 4, 30,  [foodtypes[1],], callback);
        },
        function(callback) {
          foodCreate("Banana", 'A banana is an elongated, edible fruit botanically a berry produced by several kinds of large herbaceous flowering plants in the genus Musa.', 6,15, [foodtypes[1],], callback);
        },
        function(callback) {
          foodCreate("Chicken", 'The chicken is a domesticated junglefowl species, with attributes of wild species such as the grey and the Ceylon junglefowl.', 20, 10, [foodtypes[0],], callback);
        },
        ],
        // optional callback
        cb);
}


async.series([
    createFoodType,
    createFoods,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
 
    // All done, disconnect from database
    mongoose.connection.close();
});



