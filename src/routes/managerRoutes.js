import express from"express";
import managerController from"../controllers/managerController.js";
const router = express.Router();

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

export default router;
