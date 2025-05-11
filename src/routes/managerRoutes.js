const express = require("express");
const router = express.Router();
const managerController = require("../controllers/managerController");

// Base routes
router
  .route("/")
  .get(managerController.getAllManagers)
  .post(managerController.createManager);

// Routes with ID
router
  .route("/:id")
  .get(managerController.getManager)
  .patch(managerController.updateManager)
  .delete(managerController.deleteManager);

// Special routes
router.patch("/:id/password", managerController.updatePassword);
router.patch("/:id/status", managerController.updateStatus);
router.patch("/:id/permissions", managerController.updatePermissions);

module.exports = router;
