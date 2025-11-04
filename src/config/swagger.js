const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YYD (Yeryüzü Doktorları) API',
      version: '1.0.0',
      description: 'Yeryüzü Doktorları Derneği Backend API Documentation',
      contact: {
        name: 'API Support',
        email: 'info@yeryuzudoktorlari.org',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.yeryuzudoktorlari.org',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie (automatic in browser)',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token from login response',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Stack trace (only in development)',
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
            totalItems: {
              type: 'integer',
              example: 48,
            },
            itemsPerPage: {
              type: 'integer',
              example: 10,
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
            },
            hasPreviousPage: {
              type: 'boolean',
              example: false,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'admin',
            },
            email: {
              type: 'string',
              example: 'admin@yyd.org',
            },
            fullName: {
              type: 'string',
              example: 'Admin User',
            },
            roleId: {
              type: 'integer',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Yemen Sağlık Projesi',
            },
            slug: {
              type: 'string',
              example: 'yemen-saglik-projesi',
            },
            description: {
              type: 'string',
              example: 'Yemen\'de sağlık hizmetleri',
            },
            content: {
              type: 'string',
              example: 'Detaylı proje içeriği...',
            },
            coverImage: {
              type: 'string',
              example: '/uploads/projects/image.jpg',
            },
            category: {
              type: 'string',
              example: 'Sağlık',
            },
            location: {
              type: 'string',
              example: 'Yemen',
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'paused', 'planning'],
              example: 'active',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            isFeatured: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        News: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Yemen\'de Yeni Sağlık Merkezi',
            },
            slug: {
              type: 'string',
              example: 'yemen-de-yeni-saglik-merkezi',
            },
            summary: {
              type: 'string',
              example: 'Kısa özet...',
            },
            content: {
              type: 'string',
              example: 'Detaylı haber içeriği...',
            },
            imageUrl: {
              type: 'string',
              example: '/uploads/news/image.jpg',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              example: 'published',
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Donation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            amount: {
              type: 'number',
              format: 'float',
              example: 100.00,
            },
            currency: {
              type: 'string',
              example: 'TRY',
            },
            paymentMethod: {
              type: 'string',
              example: 'credit_card',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              example: 'completed',
            },
            donorName: {
              type: 'string',
              example: 'Ahmet Yılmaz',
            },
            donorEmail: {
              type: 'string',
              example: 'ahmet@example.com',
            },
            isAnonymous: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        GalleryItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Proje Fotoğrafı',
            },
            mediaType: {
              type: 'string',
              enum: ['image', 'video'],
              example: 'image',
            },
            fileUrl: {
              type: 'string',
              example: '/uploads/gallery/photo.jpg',
            },
            projectId: {
              type: 'integer',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Projects',
        description: 'Project management endpoints',
      },
      {
        name: 'News',
        description: 'News management endpoints',
      },
      {
        name: 'Donations',
        description: 'Donation management endpoints',
      },
      {
        name: 'Gallery',
        description: 'Gallery management endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Roles',
        description: 'Role and permission management endpoints',
      },
      {
        name: 'Volunteers',
        description: 'Volunteer application endpoints',
      },
      {
        name: 'Contact',
        description: 'Contact form endpoints',
      },
      {
        name: 'Upload',
        description: 'File upload endpoints',
      },
    ],
  },
  apis: ['./src/api/modules/**/*.routes.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
