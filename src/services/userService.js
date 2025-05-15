import { AppDataSource } from "../config/database.js";
import { Roles, User } from "../entities/index.js";
import AppError from "../utils/AppError.js";

class UserService {
  constructor() {
    this.repo = AppDataSource.getRepository(User);
    this.roleRepo = AppDataSource.getRepository(Roles)
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
    return await this.repo.find({
      relations: ["roles"],
    });
  }

  // Get user by ID
  async getUserById(id) {
    const user = await this.repo.findOne({ where: { id }, relations: ["roles",
      "comments",
      "cart",
      "seller",
      "seller.store",
      "manager",
    ] });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    delete user.password;
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

  async getAllRoles() {
    const allRoles = await this.roleRepo.find()
    return allRoles
  }
}

export default  new UserService();
