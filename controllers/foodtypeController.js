const Foodtype = require("../models/foodtype");
const Food = require("../models/food");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all foodtype.
exports.foodtype_list = (req, res, next) => {
  Foodtype.find()
    .sort([['name','ascending']])
    .exec(function (err, list_foodtype){
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("foodtype_list", {
        title: "Food Group List",
        foodtype_list: list_foodtype,
      });
    }); 
};

// Display detail page for a specific foodtype.
exports.foodtype_detail = (req, res, next) => {
  async.parallel(
    {
      foodtype(callback) {
        Foodtype.findById(req.params.id).exec(callback);
      },

      foodtype_foods(callback) {
        Food.find({ foodtype: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.foodtype == null) {
        // No results.
        const err = new Error("Food group not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("foodtype_detail", {
        title: "Food Group Details",
        foodtype: results.foodtype,
        foodtype_foods: results.foodtype_foods,
      });
    }
  );
};

// Display foodtype create form on GET.

exports.foodtype_create_get = (req, res, next) => {
  res.render("foodtype_form", { title: "Create Food Group" });
};

// Handle foodtype create on POST.
exports.foodtype_create_post = [
  // Validate and sanitize the name field.
  body("description", "Food Group name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Foodyupe object with escaped and trimmed data.
    const foodtype = new Foodtype({ description: cap(req.body.description) });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("foodtype_form", {
        title: "Create Food Group",
        foodtype,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Foodtype with same name already exists.
      Foodtype.findOne({ description: req.body.description }).exec((err, found_foodtype) => {
        if (err) {
          return next(err);
        }

        if (found_foodtype) {
          // foodtype exists, redirect to its detail page.
          res.redirect(found_foodtype.url);
        } else {
          foodtype.save((err) => {
            if (err) {
              return next(err);
            }
            // foodtype saved. Redirect to foodtype detail page.
            res.redirect(foodtype.url);
          });
        }
      });
    }
  },
];



// Display foodtype delete form on GET.
exports.foodtype_delete_get = (req, res, next) => {
  async.parallel(
    {
      foodtype(callback) {
        Foodtype.findById(req.params.id).exec(callback);
      },

      foodtype_foods(callback) {
        Food.find({ foodtype: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.foodtype == null) {
        // No results.
        const err = new Error("Food group not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("foodtype_delete", {
        title: "Delete food group",
        foodtype: results.foodtype,
        foodtype_foods: results.foodtype_foods,
      });
    }
  );
};


// Handle foodtype delete on POST.
exports.foodtype_delete_post = (req, res, next) => {
  async.parallel(
    {
      foodtype(callback) {
        Foodtype.findById(req.params.id).exec(callback);
      },

      foodtype_foods(callback) {
        Food.find({ foodtype: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.foodtype == null) {
        // No results.
        const err = new Error("Food group not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      Foodtype.findByIdAndRemove(req.body.foodtypeid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to foodtype list
        res.redirect("/catalog/foodtypes");
      });
    }
  );
};
 
     

// Display foodtype update form on GET.
exports.foodtype_update_get = function (req, res, next) {
  Foodtype.findById(req.params.id, function (err, foodtype) {
    if (err) {
      return next(err);
    }
    if (foodtype == null) {
      // No results.
      var err = new Error("Food group not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("foodtype_update", { title: "Update Food Group Name", foodtype: foodtype });
  });
};

function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// Handle foodtype update on POST.
exports.foodtype_update_post = [
  
  // Validate and sanitze the name field.
  body("description", "Food Group name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a foodtype object with escaped and trimmed data (and the old id!)
    var foodtype = new Foodtype({
      description: cap(req.body.description),
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("foodtype_update", {
        title: "Update Food Group",
        foodtype: foodtype,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Foodtype.findByIdAndUpdate(
        req.params.id,
        foodtype,
        {},
        function (err, thefoodtype) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to foodtype detail page.
          res.redirect(thefoodtype.url);
        }
      );
    }
  },
];
