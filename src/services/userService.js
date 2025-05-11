const { AppDataSource } = require("../config/database");
const { User } = require("../entities");
const AppError = require("../utils/AppError");

class UserService {
  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  // Create a new user
  async createUser(userData) {
    try {
      const user = this.repo.create(userData);
      return await this.repo.save(user);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Email already exists", 400);
      }
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    return await this.repo.find();
  }

  // Get user by ID
  async getUserById(id) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  // Update user
  async updateUser(id, userData) {
    const user = await this.getUserById(id);
    Object.assign(user, userData);
    return await this.repo.save(user);
  }

  // Delete user
  async deleteUser(id) {
    const user = await this.getUserById(id);
    await this.repo.remove(user);
    return { message: "User deleted successfully" };
  }
}

module.exports = new UserService();
