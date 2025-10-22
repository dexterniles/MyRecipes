# MyRecipes - Cross-Device Recipe Management

A modern, responsive recipe management application with cross-device synchronization using a Node.js backend and SQLite database.

## Features

- 🔐 User authentication (register/login)
- 📱 Cross-device recipe synchronization
- 🍳 Comprehensive recipe management (CRUD operations)
- 🏷️ Recipe categorization and filtering
- 🔍 Search functionality
- 📊 Recipe scaling
- 🎨 Modern, responsive UI
- 🔒 Secure JWT-based authentication

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   npm run init-db
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3000

### Development Setup

For development, you can run both the frontend and backend:

1. **Terminal 1 - Backend:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   python3 -m http.server 8000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Recipes
- `GET /api/recipes` - Get all user recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User authentication and profile data
- `recipes` - Recipe information
- `allergens` - Recipe allergens (many-to-many)
- `dietary` - Dietary restrictions (many-to-many)

## Configuration

Create a `.env` file in the root directory:

```env
DB_PATH=./database/recipes.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8000
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Deployment

For production deployment:

1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Enable HTTPS

## Migration from localStorage

If you have existing recipes in localStorage, you can migrate them by:

1. Export your recipes from the old version
2. Create a new account in the new version
3. Import your recipes using the "Add Recipe" functionality

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Ensure the database directory exists
   - Check file permissions
   - Run `npm run init-db` to recreate the database

2. **CORS errors:**
   - Verify the CORS_ORIGIN setting matches your frontend URL
   - Check that both frontend and backend are running

3. **Authentication issues:**
   - Clear browser localStorage
   - Check JWT_SECRET configuration
   - Verify token expiration settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
