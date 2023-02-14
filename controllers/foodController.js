const Food = require("../models/food");
const Foodtype = require("../models/foodtype");
const async = require("async");
const { body, validationResult } = require("express-validator");


exports.index = (req, res) => {
  async.parallel(
    {
      food_count(callback) {
        Food.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      foodtype_count(callback) {
        Foodtype.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Grocery Store Inventory",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all foods.
exports.food_list = function (req, res, next) {
    Food.find({}, "name")
      .sort({ name: 1 })
      .exec(function (err, list_foods) {
        if (err) {
          return next(err);
        }
        //Successful, so render
        res.render("food_list", { name: "Food List", food_list: list_foods });
      });
  };
  

// Display detail page for a specific food.
exports.food_detail = (req, res, next) => {
  async.parallel(
    {
      food(callback) {
        Food.findById(req.params.id)
          .populate("foodtype")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.food == null) {
        // No results.
        const err = new Error("Food not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("food_detail", {
        name: results.food.name,
        food: results.food,
        foodtype: results.food.foodtype,
      });
    }
  );
};

// Display food create form on GET.
exports.food_create_get = (req, res, next) => {
  // Get all food groups/foodtypes, which we can use for adding to our food.
  async.parallel(
    {
      foodtypes(callback) {
        Foodtype.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("food_form", {
        title: "Add food",
        foodtypes: results.foodtypes,
      });
    }
  );
};



// Handle food create on POST.
exports.food_create_post = [
  // Convert the foodtype to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.foodtype)) {
      req.body.foodtype =
        typeof req.body.foodtype === "undefined" ? [] : [req.body.foodtype];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be 0.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("amount", "Quantity must not be empty").trim().isLength({ min: 1 }).escape(),
  body("foodtype.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Food object with escaped and trimmed data.
    const food = new Food({
      name: req.body.name,
      summary: req.body.summary,
      price: req.body.price,
      amount: req.body.amount,
      foodtype: req.body.foodtype,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all foodtypes for form.
      async.parallel(
        {
          foodtypes(callback) {
            Foodtype.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected foodtypes as checked.
          
          res.render("food_form", {
            title: "Add food",
            foodtypes: results.foodtypes,
            food,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save food.
    food.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new food record.
      res.redirect(food.url);
    });
  },
];


// Display food delete form on GET.
exports.food_delete_get = (req, res, next) => {
  async.parallel(
    {
      food(callback) {
        Food.findById(req.params.id)
          .populate("foodtype")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.food == null) {
        // No results.
        res.redirect("/catalog/foods");
      }
      // Successful, so render.
      res.render("food_delete", {
        title: "Delete Food",
        food: results.food,
      });
    }
  );
};


// Handle food delete on POST.
exports.food_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      food: function (callback) {
        Food.findById(req.body.id)
          .populate("foodtype")
          .exec(callback);
      },
  
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
       else {
        Food.findByIdAndRemove(req.body.foodid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - got to foods list.
          res.redirect("/catalog/foods");
        });
      }
    }
  );
};

// Display food update form on GET.
exports.food_update_get = (req, res) => {
 // Get food and foodtype for form.
 async.parallel(
  {
    food: function (callback) {
      Food.findById(req.params.id)
        .populate("foodtype")
        .exec(callback);
    },
    foodtypes: function (callback) {
      Foodtype.find(callback);
    },
  },
  function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.food == null) {
      // No results.
      var err = new Error("Food not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected foodtypes as checked.
    for (
      var all_g_iter = 0;
      all_g_iter < results.foodtypes.length;
      all_g_iter++
    ) {
      for (
        var food_g_iter = 0;
        food_g_iter < results.food.foodtype.length;
        food_g_iter++
      ) {
        if (
          results.foodtypes[all_g_iter]._id.toString() ===
          results.food.foodtype[food_g_iter]._id.toString()
        ) {
          results.foodtypes[all_g_iter].checked = "true";
        }
      }
    }
    res.render("foodupdate_form", {
      title: "Update Food",
      foodtypes: results.foodtypes,
      food: results.food,
    });
  }
);
};

// Handle food update on POST.
exports.food_update_post = [
  // Convert the foodtype to an array.
  (req, res, next) => {
    if (!(req.body.foodtype instanceof Array)) {
      if (typeof req.body.foodtype === "undefined") req.body.foodtype = [];
      else req.body.foodtype = new Array(req.body.foodtype);
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("amount", "Amount must not be empty").trim().isLength({ min: 1 }).escape(),
  body("foodtype.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Food object with escaped/trimmed data and old id.
    var food = new Food({
      name: req.body.name,
      summary: req.body.summary,
      price: req.body.price,
      amount: req.body.amount,
      foodtype: typeof req.body.foodtype === "undefined" ? [] : req.body.foodtype,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all foodtypes for form
      async.parallel(
        {
          foodtypes: function (callback) {
            Foodtype.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected foodtypes as checked.
          for (let i = 0; i < results.foodtypes.length; i++) {
            if (food.foodtype.indexOf(results.foodtypes[i]._id) > -1) {
              results.foodtypes[i].checked = "true";
            }
          }
          res.render("foodupdate_form", {
            title: "Update Food",
            foodtypes: results.foodtypes,
            food: food,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Food.findByIdAndUpdate(req.params.id, food, {}, function (err, thefood) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to food detail page.
        res.redirect(thefood.url);
      });
    }
  },
];
