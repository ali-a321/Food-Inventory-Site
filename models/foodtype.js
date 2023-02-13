const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FoodtypeSchema = new Schema({
  description: { type: String, maxLength: 50, minLength: 2 }
});

FoodtypeSchema.virtual("url").get(function () {
  return `/catalog/foodtype/${this._id}`;
});

module.exports = mongoose.model("Foodtype", FoodtypeSchema);