import { AppDataSource } from "../config/database.js"
import {Store} from "../entities/Store.js"
import AppError from "../utils/AppError.js"

const storeRepository = AppDataSource.getRepository(Store);

const createStore = async (storeData) => {
  const store = storeRepository.create(storeData);
  return await storeRepository.save(store);
};

const getAllStores = async () => {
  return await storeRepository.find({
    relations: ["products"],
  });
};

const getStoreById = async (id) => {
  const store = await storeRepository.findOne({
    where: { id },
    relations: ["products", "products.comments", "products.category", "seller", ],
  });

  if (!store) {
    throw new AppError(`Store with id ${id} not found`, 404);
  }

  return store;
};

const updateStore = async (id, storeData) => {
  const store = await storeRepository.findOne({
    where: { id },
    relations: ["products"],
  });

  if (!store) {
    throw new AppError(`Store with id ${id} not found`, 404);
  }

  Object.assign(store, storeData);
  return await storeRepository.save(store);
};

const deleteStore = async (id) => {
  const result = await storeRepository.delete(id);
  if (result.affected === 0) {
    throw new AppError("Store not found", 404);
  }
};

const updateStoreStatus = async (id, status) => {
  const store = await storeRepository.findOne({
    where: { id },
    relations: ["products"],
  });
  if (!store) {
    throw new AppError("Store not found", 404);
  }
  store.isActive = status === 'active';
  return await storeRepository.save(store);
};


export default {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  updateStoreStatus
}