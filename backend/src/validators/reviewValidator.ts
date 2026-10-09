import { z } from 'zod';
import { config } from '../config/index.js';

export const reviewSchema = z.object({
  code: z
    .string()
    .min(1, 'Source code cannot be empty')
    .max(config.maxCodeCharacters, `Source code exceeds maximum limit of ${config.maxCodeCharacters} characters.`),
  language: z.string().min(1, 'Language must be specified').default('javascript'),
  focus: z
    .enum(['comprehensive', 'bugs', 'security', 'performance', 'readability'])
    .default('comprehensive'),
  title: z.string().max(120, 'Title cannot exceed 120 characters').optional(),
  storeCode: z.boolean().optional().default(false)
});
