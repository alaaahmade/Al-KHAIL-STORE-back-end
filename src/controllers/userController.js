import userService from "../services/userService.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getAllRoles = catchAsync(async (req, res) => {
  const roles = await userService.getAllRoles();
  res.status(200).json({
    status: "success",
    results: roles.length,
    data: {
      roles,
    },
  });
});


export const handleIsActive = catchAsync(async (userId) => {
   await userService.activateUser(userId);
})

export const disActivateUser = catchAsync((userId) => {
  userService.disActivateUser( userId)
})


const checkEmailExists = catchAsync(async (req, res) => {
  const { email } = req.params;
  const user = await userService.getUserByEmail(email);
  res.status(200).json({ exists: !!user });
});


const getCustomers = catchAsync(async (req, res) => {
  const users = await userService.getCustomers()
  res.status(200).json({data: users})
})

const changeUserStatus = catchAsync(async (req, res) => {
  const {id, status} = req.body
  console.log(id, status);
  
  await userService.changeUserStatus(id, status)
  res.status(200).json({message: "Merchants status updated successfully"})
})

export default {
  getAllUsers,
  getUser,
  getCustomers,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  checkEmailExists,
  changeUserStatus
}
