/**
 * Validation Schemas for Trading API Endpoints
 * Using Zod for runtime type checking and validation
 */

const { z } = require('zod');

/**
 * Schema for placing a new order
 */
const placeOrderSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase alphanumeric'),
  
  side: z.enum(['buy', 'sell'], {
    errorMap: () => ({ message: 'Side must be either "buy" or "sell"' })
  }),
  
  qty: z.number()
    .positive('Quantity must be positive')
    .finite('Quantity must be a finite number'),
  
  price: z.number()
    .positive('Price must be positive')
    .finite('Price must be a finite number')
    .optional(),
  
  type: z.enum(['market', 'limit'], {
    errorMap: () => ({ message: 'Type must be either "market" or "limit"' })
  }),
});

/**
 * Schema for cancelling an order
 */
const cancelOrderSchema = z.object({
  orderId: z.string()
    .min(1, 'Order ID is required')
    .max(100, 'Order ID too long'),
  
  reason: z.string()
    .max(500, 'Reason too long')
    .optional(),
});

/**
 * Validate request body against a schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {{ success: boolean, data?: any, errors?: any }}
 */
function validateBody(schema, data) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

module.exports = {
  placeOrderSchema,
  cancelOrderSchema,
  validateBody,
};
