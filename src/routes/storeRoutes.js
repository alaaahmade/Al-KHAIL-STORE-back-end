const express = require("express");
const storeController = require("../controllers/storeController");

const router = express.Router();

router
  .route("/")
  .get(storeController.getAllStores)
  .post(storeController.createStore);

router
  .route("/:id")
  .get(storeController.getStore)
  .patch(storeController.updateStore)
  .delete(storeController.deleteStore);

router.route("/:id/status").patch(storeController.updateStoreStatus);

module.exports = router;
