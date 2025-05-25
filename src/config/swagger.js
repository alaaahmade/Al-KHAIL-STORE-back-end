import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "E-Commerce API Documentation",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "email",
            "password",
            "phoneNumber",
          ],
          properties: {
            id: {
              type: "integer",
              format: "int64",
              description: "User ID",
            },
            firstName: {
              type: "string",
              description: "User first name",
            },
            lastName: {
              type: "string",
              description: "User last name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
            },
            phoneNumber: {
              type: "string",
              description: "User phone number",
            },
            role: {
              type: "string",
              enum: ["USER", "SELLER", "MANAGER", "ADMIN"],
              description: "User role",
              default: "USER"
            },
            isActive: {
              type: "boolean",
              description: "User account status",
              default: true
            },
          },
        },
        Auth: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT token",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export default swaggerJsdoc(options);
