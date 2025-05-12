import express from"express";
import storeController from"../controllers/storeController.js";

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

export default router;
