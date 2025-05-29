import { AppDataSource } from "../config/database.js";
import { Roles, User } from "../entities/index.js";
import AppError from "../utils/AppError.js";
import { transporter } from '../utils/nodeMailer.js';

class UserService {

  constructor() {
    this.repo = AppDataSource.getRepository(User);
    this.roleRepo = AppDataSource.getRepository(Roles)
  }

  // Find user by email
  async getUserByEmail(email) {
    return await this.repo.findOneBy({ email });
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
  async getUserById(id, relations = []) {
    const user = await this.repo.findOne({ where: { id }, relations: [
      "roles",
      "comments",
      "cart",
      "seller",
      "seller.store",
      "manager",
      ...relations
    ] });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    delete user.password;
    return user;
  }

  // Update user
  async updateUser(id, userData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const userRepository = queryRunner.manager.getRepository('User');
      const rolesRepository = queryRunner.manager.getRepository('Roles');
      
      // Get the user with roles
      const user = await userRepository.findOne({
        where: { id },
        relations: ['roles']
      });
  
      if (!user) {
        throw new AppError('User not found', 404);
      }
  
      // Handle roles update if roles are provided
      if (userData.roles && Array.isArray(userData.roles)) {
        // Deduplicate role IDs
        const roleIds = [...new Set(userData.roles.map(id => Number(id)))];
        console.log('roleIds:', roleIds);
        
        // Get the requested roles
        const roles = await rolesRepository
          .createQueryBuilder('role')
          .where('role.id IN (:...ids)', { ids: roleIds })
          .getMany();
        console.log('roles:', roles);

        if (roles.length !== roleIds.length) {
          const foundRoleIds = roles.map(role => role.id);
          const missingRoles = roleIds.filter(id => !foundRoleIds.includes(id));
          throw new AppError(`The following role IDs do not exist: ${missingRoles.join(', ')}`, 400);
        }

        // Remove all roles first to avoid duplicate key errors
        user.roles = [];
        await userRepository.save(user);

        // Now assign new roles
        user.roles = roles;
        console.log('user.roles after assignment:', user.roles);
        delete userData.roles;
      }
      // Update other user data
      if (Object.keys(userData).length > 0) {
        Object.assign(user, userData);
        delete user.password; // Never update password here
        await userRepository.save(user);
      } else {
        // If only updating roles, we still need to save
        await userRepository.save(user);
      }
  
      await queryRunner.commitTransaction();
      
      // Return the updated user with roles
      const updatedUser = await this.getUserById(id, ['roles']);
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  // Delete user
  async deleteUser(id) {
    const user = await this.getUserById(id);
    const isAdmin = user.roles.some((role) => role.name === "ADMIN");
    if (isAdmin) {
      throw new AppError("Admin users cannot be deleted", 401);
    }
    
    await this.repo.remove(user);
    return { message: "User deleted successfully" };
  }

  async getAllRoles() {
    const allRoles = await this.roleRepo.find()
    return allRoles
  }

  async activateUser (userId) {
    const user = await this.repo.findOneBy({id: userId})
    user.isActive = true
    await this.repo.save(user);
  }

  async activateUser(id) {
    const user = await this.getUserById(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    user.isActive = true;
    user.activationExpires = null; // Clear the expiration if you track it
    
    return await this.repo.save(user);
  }

  async getCustomers() {
    const userRole = await this.roleRepo.findOneBy({name: "USER"})

    if (!userRole) return [];

    const users = await this.repo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .where("role.id = :roleId", { roleId: userRole.id })
      .getMany();
    users.forEach((user => {
      delete user.password
    }))
    return users;
  }

  async disActivateUser(userId) {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    user.isActive = false;
    
    return await this.repo.save(user);
    
    
  }

  async changeUserStatus (id, status) {
    const user = await this.getUserById(id)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    user.status = status
    if (status === "ACTIVE"){
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'balantypro@gmail.com',
        to: user.email,
        subject: 'Al-KHAIL-STORE Password Reset Code',
        text: `
          Hello,
          Your account has been activated. You can now log in to your account.
          Thank you,  
          The Al-KHAIL-STORE Team
        `
  });
    } else if (status === "BANNED") {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'balantypro@gmail.com',
        to: user.email,
        subject: 'Al-KHAIL-STORE Password Reset Code',
        text: `
          Hello,
          Your account has been banned. You cannot log in to your account.
          Thank you,  
          The Al-KHAIL-STORE Team
        `
  });
    } else if (status === "PENDING") {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'balantypro@gmail.com',
        to: user.email,
        subject: 'Al-KHAIL-STORE Password Reset Code',
        text: `
          Hello,
          Your account is pending. You cannot log in to your account until it is approved.
          Thank you,  
          The Al-KHAIL-STORE Team
        `
  });
    }
    return await this.repo.save(user)
  }

}


export default  new UserService();
