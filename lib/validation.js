const Joi = require('joi');

// User registration validation schema
const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must be less than 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    })
});

// User login validation schema
const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Recipe validation schema
const recipeSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Recipe name is required',
      'string.max': 'Recipe name must be less than 255 characters',
      'any.required': 'Recipe name is required'
    }),
  
  category: Joi.string()
    .valid('mains', 'appetizers', 'sauces', 'sides', 'desserts', 'beverages', 'garnishes', 'condiments', 'breads', 'soups', 'salads')
    .required()
    .messages({
      'any.only': 'Please select a valid recipe category',
      'any.required': 'Recipe category is required'
    }),
  
  prepTime: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .allow(null)
    .messages({
      'number.base': 'Prep time must be a number',
      'number.integer': 'Prep time must be a whole number',
      'number.min': 'Prep time must be at least 1 minute',
      'number.max': 'Prep time cannot exceed 24 hours (1440 minutes)'
    }),
  
  yield: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Yield must be less than 100 characters'
    }),
  
  difficulty: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .allow('')
    .messages({
      'any.only': 'Difficulty must be beginner, intermediate, or advanced'
    }),
  
  equipment: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Equipment description must be less than 500 characters'
    }),
  
  allergens: Joi.array()
    .items(Joi.string().valid('nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish'))
    .default([])
    .messages({
      'array.base': 'Allergens must be an array'
    }),
  
  dietary: Joi.array()
    .items(Joi.string().valid('vegetarian', 'vegan', 'keto', 'paleo', 'halal', 'kosher'))
    .default([])
    .messages({
      'array.base': 'Dietary restrictions must be an array'
    }),
  
  ingredients: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Ingredients are required',
      'any.required': 'Ingredients are required'
    }),
  
  instructions: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Instructions are required',
      'any.required': 'Instructions are required'
    }),
  
  costPerPortion: Joi.number()
    .precision(2)
    .min(0)
    .max(1000)
    .allow(null)
    .messages({
      'number.base': 'Cost per portion must be a number',
      'number.min': 'Cost per portion cannot be negative',
      'number.max': 'Cost per portion cannot exceed $1000'
    }),
  
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Notes must be less than 1000 characters'
    })
});

// Recipe update validation schema (all fields optional except id)
const recipeUpdateSchema = recipeSchema.fork(Object.keys(recipeSchema.describe().keys), (schema) => schema.optional());

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    req.body = value; // Use the validated and sanitized data
    next();
  };
};

// Custom validation for recipe ID parameter
const validateRecipeId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid recipe ID'
    });
  }
  
  req.params.id = parseInt(id);
  next();
};

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  recipeSchema,
  recipeUpdateSchema,
  validate,
  validateRecipeId
};
