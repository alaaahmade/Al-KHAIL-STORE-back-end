const { AppDataSource } = require("../config/database");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const managerRepository = AppDataSource.getRepository("Manager");
const userRepository = AppDataSource.getRepository("User");

// Create a new manager
exports.createManager = catchAsync(async (managerData) => {
  // First create the user
  const hashedPassword = await bcrypt.hash(managerData.password, 12);
  const user = userRepository.create({
    ...managerData,
    password: hashedPassword,
    role: "MANAGER",
  });
  await userRepository.save(user);

  // Then create the manager record
  const manager = managerRepository.create({
    userId: user.id,
  });
  await managerRepository.save(manager);

  return { ...user, managerId: manager.id };
});

// Get all managers
exports.getAllManagers = catchAsync(async () => {
  const managers = await managerRepository.find({
    relations: ["user"],
    select: {
      id: true,
      user: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  });
  return managers;
});

// Get manager by ID
exports.getManager = catchAsync(async (id) => {
  const manager = await managerRepository.findOne({
    where: { id },
    relations: ["user"],
    select: {
      id: true,
      user: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }
  return manager;
});

// Update manager
exports.updateManager = catchAsync(async (id, updateData) => {
  const manager = await managerRepository.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }

  // Update user data
  if (
    updateData.firstName ||
    updateData.lastName ||
    updateData.email ||
    updateData.phoneNumber
  ) {
    Object.assign(manager.user, {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
    });
    await userRepository.save(manager.user);
  }

  return manager;
});

// Delete manager
exports.deleteManager = catchAsync(async (id) => {
  const manager = await managerRepository.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }

  // Delete manager record first
  await managerRepository.remove(manager);
  // Then delete the user
  await userRepository.remove(manager.user);
});

// Get manager by email
exports.getManagerByEmail = catchAsync(async (email) => {
  const user = await userRepository.findOne({
    where: { email, role: "MANAGER" },
  });

  if (!user) {
    throw new AppError("No manager found with that email", 404);
  }

  const manager = await managerRepository.findOne({
    where: { userId: user.id },
    relations: ["user"],
  });

  return manager;
});

// Update manager password
exports.updatePassword = catchAsync(
  async (id, currentPassword, newPassword) => {
    const manager = await managerRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!manager) {
      throw new AppError("No manager found with that ID", 404);
    }

    if (!(await bcrypt.compare(currentPassword, manager.user.password))) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    manager.user.password = hashedPassword;
    await userRepository.save(manager.user);

    return manager;
  }
);

// Update manager status
exports.updateStatus = catchAsync(async (id, isActive) => {
  const manager = await managerRepository.findOne({
    where: { id },
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }

  manager.isActive = isActive;
  await managerRepository.save(manager);

  return manager;
});

// Update manager permissions
exports.updatePermissions = catchAsync(async (id, permissions) => {
  const manager = await managerRepository.findOne({
    where: { id },
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }

  manager.permissions = permissions;
  await managerRepository.save(manager);

  return manager;
});

// Update last login
exports.updateLastLogin = catchAsync(async (id) => {
  const manager = await managerRepository.findOne({
    where: { id },
  });

  if (!manager) {
    throw new AppError("No manager found with that ID", 404);
  }

  manager.lastLogin = new Date();
  await managerRepository.save(manager);

  return manager;
});
