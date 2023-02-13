const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FoodSchema = new Schema({
  name: { type: String, required: true },
  summary: { type: String, required: true },
  price: {type: Number, required: true},
  amount: {type: Number, required: true},
  foodtype: [{ type: Schema.Types.ObjectId, ref: "Foodtype" }],
});

// Virtual for book's URL
FoodSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/food/${this._id}`;
});

// Export model
module.exports = mongoose.model("Food", FoodSchema);
