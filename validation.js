const Joi = require('joi');

// User registration validation
const userRegistrationSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Username must contain only letters and numbers',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be less than 30 characters',
            'any.required': 'Username is required'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

// User login validation
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

// Recipe validation
const recipeSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.min': 'Recipe name is required',
            'string.max': 'Recipe name must be less than 200 characters',
            'any.required': 'Recipe name is required'
        }),
    
    description: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Description must be less than 1000 characters'
        }),
    
    category: Joi.string()
        .max(50)
        .allow('')
        .messages({
            'string.max': 'Category must be less than 50 characters'
        }),
    
    prep_time: Joi.number()
        .integer()
        .min(0)
        .max(1440) // 24 hours
        .messages({
            'number.min': 'Prep time cannot be negative',
            'number.max': 'Prep time cannot exceed 24 hours'
        }),
    
    cook_time: Joi.number()
        .integer()
        .min(0)
        .max(1440) // 24 hours
        .messages({
            'number.min': 'Cook time cannot be negative',
            'number.max': 'Cook time cannot exceed 24 hours'
        }),
    
    servings: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .messages({
            'number.min': 'Servings must be at least 1',
            'number.max': 'Servings cannot exceed 100'
        }),
    
    difficulty: Joi.string()
        .valid('Easy', 'Medium', 'Hard')
        .messages({
            'any.only': 'Difficulty must be Easy, Medium, or Hard'
        }),
    
    ingredients: Joi.array()
        .items(Joi.string().min(1))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one ingredient is required',
            'any.required': 'Ingredients are required'
        }),
    
    instructions: Joi.array()
        .items(Joi.string().min(1))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one instruction is required',
            'any.required': 'Instructions are required'
        }),
    
    notes: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Notes must be less than 1000 characters'
        }),
    
    image_url: Joi.string()
        .uri()
        .max(500)
        .allow('')
        .messages({
            'string.uri': 'Image URL must be a valid URL',
            'string.max': 'Image URL must be less than 500 characters'
        })
});

// Validation middleware
function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }
        next();
    };
}

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    recipeSchema,
    validate
};
