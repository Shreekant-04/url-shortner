const mongoose = require("mongoose");

const connection = () => {
  mongoose
    .connect(process.env.MONGODB)
    .then(() => {
      console.log("database Connected");
    })
    .catch((err) => {
      console.log("Error", err);
    });
};
module.exports = connection;
