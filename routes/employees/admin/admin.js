module.exports = {};
const AdminBro = require("admin-bro"),
  AdminBroExpressjs = require("admin-bro-expressjs"),
  mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
Employee = require("../../../models/staff/Employee");

AdminBro.registerAdapter(require("admin-bro-mongoose"));

const adminBro = new AdminBro({
  resources: [Employee],
  rootPath: "/admin"
});

const adminRouter = AdminBroExpressjs.buildRouter(adminBro);

module.exports = adminRouter;
