// loading modules
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

/*
method : POST
route : /api/user/
description: to create a user
*/
const createUser = async (req, res) => {
  const { name, email, password, is_admin } = req.body;

  // validation
  if (!name || !email || !password)
    return res.status(400).json({
      msg: "enter all the fields",
    });

  // user already exist
  const duplicate = await user.findOne({
    email,
  });

  if (duplicate) return res.json({ msg: "user with same email already exist" });

  // default user
  if (is_admin == null) is_admin = false;

  // encrypting password
  const salt = uuidv4();
  const encry_password = crypto
    .createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  // creating user
  const newUser = new user({
    name,
    email,
    encry_password,
    salt,
    is_admin,
  });

  newUser
    .save()
    .then((user) => {
      res.status(400).json({
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
        id: user._id,
      });
    })
    .catch((err) => res.json({ err }));
};

/*
method: GET
route: /api/user/:id
description: get's a single user given the id
*/
const getUser = async (req, res) => {
  const { id } = req.params;

  // validation
  if (!id) return res.json({ msg: "id not found" });

  const foundUser = await user.findOne({
    _id: id,
  });

  // user not available
  if (!foundUser) return res.json({ msg: "User not Available" });

  // returns user
  return res.json({
    id: foundUser._id,
    email: foundUser.email,
    name: foundUser.name,
    is_admin: foundUser.is_admin,
  });
};

/*
method: GET
route: /api/user/
description: get's all the users
*/
const getAllUsers = async (req, res) => {
  await user
    .find({})
    .then((users) => {
      return res.status(400).json({
        users,
      });
    })
    .catch((err) => res.json({ err }));
};

/*
method: DELETE
route: /api/user/
description: deletes a single user given the id
*/
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // validation
  if (!id) return res.json({ msg: "no id detected" });

  // deletion
  const delUser = await user.findOne({ _id: id });

  if (!delUser) return res.json({ msg: "User Does not exist" });

  delUser
    .deleteOne()
    .then((deletedUser) => {
      return res.json({
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        is_admin: deletedUser.is_admin,
      });
    })
    .catch((err) => res.json({ err }));
};

// exporting the modules
module.exports = { createUser, getUser, getAllUsers, deleteUser };