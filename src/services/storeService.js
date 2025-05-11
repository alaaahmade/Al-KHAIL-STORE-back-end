const { AppDataSource } = require("../config/database");
const Store = require("../entities/Store");
const AppError = require("../utils/AppError");

const storeRepository = AppDataSource.getRepository(Store);

exports.createStore = async (storeData) => {
  const store = storeRepository.create(storeData);
  return await storeRepository.save(store);
};

exports.getAllStores = async () => {
  return await storeRepository.find({
    relations: ["products"],
  });
};

exports.getStoreById = async (id) => {
  const store = await storeRepository.findOne({
    where: { id },
    relations: ["products"],
  });

  if (!store) {
    throw new AppError(`Store with id ${id} not found`, 404);
  }

  return store;
};

exports.updateStore = async (id, storeData) => {
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

exports.deleteStore = async (id) => {
  const result = await storeRepository.delete(id);
  if (result.affected === 0) {
    throw new AppError("Store not found", 404);
  }
};

exports.updateStoreStatus = async (id, status) => {
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
