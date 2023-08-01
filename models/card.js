const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlingth: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {

  }
