/**
 * HEFAISTOS - Shared Type Definitions
 * 
 * This file contains JSDoc type definitions used across the codebase.
 * Import types using: @type {import('./types.js').TypeName}
 */

// ============================================
// API TYPES
// ============================================

/**
 * @typedef {Object} APIResponse
 * @property {boolean} success - Whether the request succeeded
 * @property {any} [data] - Response data if successful
 * @property {string} [error] - Error message if failed
 * @property {string} [imageUrl] - Generated image URL
 * @property {string} [imageBase64] - Generated image as base64
 * @property {string} [text] - Generated text content
 */

/**
 * @typedef {Object} APIRequestOptions
 * @property {string} model - Model ID to use
 * @property {string} prompt - Text prompt
 * @property {string[]} [images] - Base64 images for multimodal
 * @property {number} [maxTokens] - Max tokens for response
 * @property {number} [temperature] - Temperature for generation
 * @property {AbortSignal} [signal] - Abort signal for cancellation
 */

/**
 * @typedef {Object} GenerationResult
 * @property {string} id - Unique generation ID
 * @property {string} imageUrl - URL or base64 of generated image
 * @property {string} [thumbnail] - Thumbnail version
 * @property {number} timestamp - Unix timestamp
 * @property {Object} [settings] - Settings used for generation
 * @property {string} [seed] - Seed used for generation
 */

// ============================================
// USER & AUTH TYPES
// ============================================

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User UUID
 * @property {string} email - User email
 * @property {string} [full_name] - Display name
 * @property {string} [avatar_url] - Profile picture URL
 * @property {'user' | 'admin'} role - User role
 * @property {string} [subscription_tier] - Current subscription
 * @property {string} [stripe_customer_id] - Stripe customer ID
 * @property {number} [generation_count] - Total generations
 * @property {number} [monthly_generations] - This month's generations
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} SubscriptionInfo
 * @property {string} tier - Subscription tier name
 * @property {'active' | 'canceled' | 'past_due' | 'trialing'} status - Status
 * @property {number} monthlyLimit - Monthly generation limit
 * @property {number} used - Generations used this period
 * @property {string} [renewsAt] - Next renewal date
 * @property {string} [endsAt] - Cancellation date if canceled
 */

// ============================================
// STORAGE TYPES
// ============================================

/**
 * @typedef {Object} HistoryItem
 * @property {string} id - Unique item ID
 * @property {string} thumbnail - Base64 thumbnail
 * @property {string} [fullImage] - Full image (in IndexedDB)
 * @property {number} timestamp - Unix timestamp
 * @property {string} studio - Studio that created it
 * @property {Object} [settings] - Generation settings
 */

/**
 * @typedef {Object} FavoriteItem
 * @property {string} id - Unique item ID
 * @property {string} thumbnail - Base64 thumbnail
 * @property {string} [fullImage] - Full image (in IndexedDB)
 * @property {number} timestamp - Unix timestamp
 * @property {string} studio - Studio that created it
 * @property {Object} settings - Generation settings (required for favorites)
 * @property {string} [seed] - Seed for reproducibility
 * @property {string} [referenceImage] - Reference image if used
 */

// ============================================
// CMS TYPES
// ============================================

/**
 * @typedef {Object} CMSHomepageHero
 * @property {string} badge - Badge text
 * @property {string} title - Main headline
 * @property {string} subtitle - Subheadline
 * @property {string} cta1_text - Primary CTA text
 * @property {string} cta1_link - Primary CTA link
 * @property {string} cta2_text - Secondary CTA text
 * @property {string} cta2_link - Secondary CTA link
 * @property {string[]} [images] - Showcase image URLs
 */

/**
 * @typedef {Object} CMSPricingPlan
 * @property {string} name - Plan name
 * @property {string} price - Price display (e.g., "$19")
 * @property {string} period - Period (e.g., "per month")
 * @property {string[]} features - Feature list
 * @property {string} [badge] - Badge text (e.g., "Popular")
 */

/**
 * @typedef {Object} CMSGalleryItem
 * @property {string} id - UUID
 * @property {string} title - Image title
 * @property {string} [description] - Image description
 * @property {string} image_url - Image URL
 * @property {string} studio_key - Studio identifier
 * @property {string} studio_label - Studio display name
 * @property {number} sort_order - Display order
 * @property {boolean} is_active - Whether visible
 */

/**
 * @typedef {Object} CMSFAQItem
 * @property {string} id - UUID
 * @property {string} question - Question text
 * @property {string} answer - Answer HTML
 * @property {string} category - Category key
 * @property {number} sort_order - Display order
 * @property {boolean} is_active - Whether visible
 */

// ============================================
// UI COMPONENT TYPES
// ============================================

/**
 * @typedef {Object} ToastOptions
 * @property {'success' | 'error' | 'warning' | 'info'} [type] - Toast type
 * @property {number} [duration] - Duration in ms (default 3000)
 * @property {string} [action] - Action button text
 * @property {() => void} [onAction] - Action callback
 */

/**
 * @typedef {Object} ConfirmOptions
 * @property {string} title - Dialog title
 * @property {string} message - Dialog message
 * @property {string} [confirmText] - Confirm button text
 * @property {string} [cancelText] - Cancel button text
 * @property {boolean} [danger] - Use danger styling
 */

/**
 * @typedef {Object} UploadResult
 * @property {File} file - Original file
 * @property {string} dataUrl - Base64 data URL
 * @property {number} width - Image width
 * @property {number} height - Image height
 * @property {string} [thumbnail] - Compressed thumbnail
 */

// ============================================
// EVENT BUS TYPES
// ============================================

/**
 * @typedef {Object} EventBusEvents
 * @property {GenerationResult} 'generation:complete' - Generation finished
 * @property {string} 'generation:error' - Generation failed
 * @property {void} 'generation:start' - Generation started
 * @property {UserProfile} 'auth:login' - User logged in
 * @property {void} 'auth:logout' - User logged out
 * @property {'light' | 'dark'} 'theme:change' - Theme changed
 * @property {HistoryItem} 'history:add' - Item added to history
 * @property {FavoriteItem} 'favorite:add' - Item added to favorites
 */

// ============================================
// STUDIO COMMON TYPES
// ============================================

/**
 * @typedef {Object} StudioState
 * @property {string} [apiKey] - API key (deprecated, use pool)
 * @property {string} [language] - Generation language
 * @property {File[]} [uploadedImages] - Uploaded product images
 * @property {GenerationResult[]} [generatedImages] - Generated results
 * @property {boolean} [isGenerating] - Currently generating
 * @property {Object} [settings] - Studio-specific settings
 */

/**
 * @typedef {'1:1' | '4:5' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3'} AspectRatio
 */

/**
 * @typedef {'standard' | 'high' | 'ultra'} QualityLevel
 */

/**
 * @typedef {'subtle' | 'normal' | 'dramatic'} IntensityLevel
 */

// ============================================
// UTILITY TYPES
// ============================================

/**
 * @template T
 * @typedef {T | null} Nullable
 */

/**
 * @template T
 * @typedef {T | undefined} Optional
 */

/**
 * @template T
 * @typedef {Promise<T>} Async
 */

// Export nothing - this file is just for type definitions
// Types are referenced via: @type {import('./types.js').TypeName}
