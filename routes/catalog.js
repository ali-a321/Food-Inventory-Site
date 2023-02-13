const express = require("express");
const router = express.Router();

// Require controller modules.
const food_controller = require("../controllers/foodController");
const foodtype_controller = require("../controllers/foodtypeController");

/// food ROUTES ///

// GET catalog home page.
router.get("/", food_controller.index);

// GET request for creating a food. NOTE This must come before routes that display food (uses id).
router.get("/food/create", food_controller.food_create_get);

// POST request for creating food.
router.post("/food/create", food_controller.food_create_post);

// GET request to delete food.
router.get("/food/:id/delete", food_controller.food_delete_get);

// POST request to delete food.
router.post("/food/:id/delete", food_controller.food_delete_post);

// GET request to update food.
router.get("/food/:id/update", food_controller.food_update_get);

// POST request to update food.
router.post("/food/:id/update", food_controller.food_update_post);

// GET request for one food.
router.get("/food/:id", food_controller.food_detail);

// GET request for list of all food items.
router.get("/foods", food_controller.food_list);

/// foodtype ROUTES ///

// GET request for creating a foodtype. NOTE This must come before route that displays foodtype (uses id).
router.get("/foodtype/create", foodtype_controller.foodtype_create_get);

//POST request for creating foodtype.
router.post("/foodtype/create", foodtype_controller.foodtype_create_post);

// GET request to delete foodtype.
router.get("/foodtype/:id/delete", foodtype_controller.foodtype_delete_get);

// POST request to delete foodtype.
router.post("/foodtype/:id/delete", foodtype_controller.foodtype_delete_post);

// GET request to update foodtype.
router.get("/foodtype/:id/update", foodtype_controller.foodtype_update_get);

// POST request to update foodtype.
router.post("/foodtype/:id/update", foodtype_controller.foodtype_update_post);

// GET request for one foodtype.
router.get("/foodtype/:id", foodtype_controller.foodtype_detail);

// GET request for list of all foodtype.
router.get("/foodtypes", foodtype_controller.foodtype_list);


module.exports = router;
