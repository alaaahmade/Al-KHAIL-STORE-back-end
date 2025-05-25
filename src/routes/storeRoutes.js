import express from"express";
import storeController from"../controllers/storeController.js";
import { protect, restrictTo, isOwnerOrAdmin } from '../middleware/auth.js';
import storeService from "../services/storeService.js";

const router = express.Router();

// Helper to get seller userId from store
const getStoreSellerId = async (req) => {
  const store = await storeService.getStoreById(req.params.id);
  if (store.seller && store.seller.user && store.seller.user.id) {
    return store.seller.user.id;
  }
  throw new Error('Cannot determine store owner');
};

router
  .route("/")
  .get(storeController.getAllStores)
  .post(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    storeController.createStore
  );

router
  .route("/:id")
  .get(storeController.getStore)
  .patch(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getStoreSellerId),
    storeController.updateStore
  )
  .delete(
    protect,
    restrictTo('SELLER', 'ADMIN'),
    isOwnerOrAdmin(getStoreSellerId),
    storeController.deleteStore
  );

router.route(":id/status").patch(
  protect,
  restrictTo('SELLER', 'ADMIN'),
  isOwnerOrAdmin(getStoreSellerId),
  storeController.updateStoreStatus
);

export default router;
