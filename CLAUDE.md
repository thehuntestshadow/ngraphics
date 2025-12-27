# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGRAPHICS - AI Product Graphics Studio. A web application suite for creating marketing materials using the OpenRouter API with various AI image generation models (Gemini, GPT, Flux, Recraft).

## Development

No build process required. To run:
- Open any `.html` file directly in a browser, or
- Serve with any static file server (e.g., `python3 -m http.server 8000`)

## Architecture

The application consists of multiple pages, each with its own JS file, sharing common styles:

### Pages

| Page | Files | Purpose |
|------|-------|---------|
| Infographics | `index.html`, `script.js` | Generate product infographics with features/callouts |
| Model Studio | `models.html`, `models.js`, `models.css` | Generate AI model photos wearing/holding products |
| Documentation | `docs.html`, `docs.css` | User documentation |

### Shared Styles
- `styles.css` - Base styles, CSS variables, theming (Anthropic-inspired color palette), common components

## API Integration

Uses OpenRouter's `/api/v1/chat/completions` endpoint with `modalities: ['image', 'text']` for image generation. Response handling supports multiple formats (Gemini's inline_data, OpenAI's image_url, base64 responses).

---

## Infographics Generator (`index.html` + `script.js`)

Main page for creating product marketing infographics.

### Structure
- `state` object: Manages language, API key, uploaded images, generated images, history
- `elements` object: Cached DOM references (initialized in `initElements()`)
- `iconSuggestions` map: Keyword-to-icon mapping for smart icon suggestions

### Key Functions
- `generatePrompt()`: Builds comprehensive AI prompt based on all settings
- `generateInfographic()`: Makes API call to OpenRouter with multimodal support
- `enhanceImage()`: Client-side auto-levels and contrast adjustment
- History management: localStorage-based with 20-item limit
- Language toggle: English/Romanian with proper diacritics support

### Features
- Multimodal input: Product photo uploaded and sent to AI as reference
- Multiple style presets: auto, rich callouts, callout lines, light/dark/gradient backgrounds
- Generation history: Stored in localStorage, viewable in modal, exportable
- Bilingual: English and Romanian with proper character support (ă, â, î, ș, ț)
- Feedback-based adjustment: Regenerate with text feedback to refine results
- SEO alt text: Auto-generated descriptive text with copy button
- Watermark system: Text or logo watermarks with position/opacity controls
- Keyboard shortcuts: Ctrl+Enter to generate, Ctrl+D to download, Escape to close modals

### Advanced Options

**Layout & Composition:**
- Layout Template: Auto, Product Center/Left/Right/Top, Grid, Hero
- Aspect Ratio: Auto, 1:1, 2:3, 4:5, 16:9, 9:16
- Product Focus: Auto, Full, Close-up, Dynamic, In Context (with custom description input), Floating, Multi-View
- Variations: Generate 1, 2, or 4 images at once (parallel API calls)

**Visual Style:**
- Visual Density Slider: Minimal to Rich (5 levels)
- Font Style: Auto, Modern Sans-Serif, Classic Serif, Bold, Playful, Technical, Elegant
- Icon Style: Auto, Flat, Outlined, 3D, Minimal, None

**Colors & Background:**
- Color Harmony: Match Product, Complementary, Analogous, Triadic, Monochrome, High Contrast
- Background Type: Auto, Solid, Subtle Texture, Textured, Gradient, Pattern, Environmental
- Brand Colors: Custom hex codes to incorporate

**Style Reference:**
- Upload reference image to match visual style
- Style Influence Slider: 10-100% control

**Generation Settings:**
- Seed control for reproducible generations
- Negative prompts to specify what to avoid

### Characteristic Features
- Star button to mark primary features (shown larger/more prominent)
- Auto-icon suggestions based on keyword detection (battery, wifi, camera, etc.)
- Manual icon selection per characteristic

---

## Model Studio (`models.html` + `models.js` + `models.css`)

Generate AI model photos with products (person wearing/holding product).

### Structure
- `state` object: Product settings, model appearance, shot type, scene, quality enhancements
- `elements` object: Cached DOM references
- Description maps: Convert option values to detailed prompt text

### Key Functions
- `generatePrompt()`: Builds prompt for model photo generation
- `generateModelPhoto()`: Makes API call for model image
- `analyzeProductImage()`: Auto-detect product type and description

### Model Configuration

**Product Settings:**
- Product Type: Clothing, Footwear, Accessories, Beauty, Electronics, etc.
- Product Description: Auto-analyzed or manual input

**Model Appearance:**
- Gender: Female, Male, Non-binary
- Age: Young Adult, Adult, Middle-aged, Senior
- Ethnicity: Any, or specific options
- Body Type: Slim, Average, Athletic, Plus-size (contextual based on product)
- Hair: Any, or specific styles

**Shot Types:**
- Headshot, Half-body, Full-body, Close-up, Over-shoulder, Back view, etc.

**Scenes:**
- Studio, Outdoor, Urban, Nature, Lifestyle, Abstract, etc.

**Photography Styles:**
- Editorial, Commercial, Lifestyle, Fashion, Candid, Artistic

### Quality Enhancements

**Camera & Technical:**
- Focal Length: 24mm, 35mm, 50mm, 85mm, 135mm, Macro
- Film Grain: None, Subtle, Medium, Heavy
- Sharpness: Soft, Natural, Sharp, Ultra Sharp
- Contrast: Low, Medium, High

**Color & Tone:**
- Color Temperature: Cool, Neutral, Warm, Very Warm
- Shadow Style: Lifted, Natural, Crushed

**Environment:**
- Time of Day: Morning, Midday, Golden Hour, Blue Hour, Night
- Weather: Clear, Cloudy, Foggy, Rainy, Snowy

**Product Enhancement:**
- Focus on: Texture, Shine, Color Accuracy, Fine Detail

**Realism Control:**
- Auto (default), Photorealistic, Slightly Stylized, Stylized, Illustrated

### Collage Mode
- Generate multi-angle product collages
- Model positions: Standing, Sitting, Lying down, Turned around
- Face toggle: Show model face or product-only focus
- Variations: 1, 2, or 4 images

### Advanced Options
- Pose: Natural, Dynamic, Relaxed, Professional, etc.
- Lighting: Studio, Natural, Dramatic, Soft, Rim, etc.
- Camera Angle: Eye-level, High, Low, Dutch, Bird's eye
- Expression: Neutral, Smiling, Serious, Candid, etc.
- Depth of Field: Auto, Shallow, Medium, Deep
- Color Grading: Auto, Natural, Warm, Cool, Cinematic, etc.
- Skin Retouch: None, Natural, Polished, Editorial
- Composition: Auto, Rule of Thirds, Center, Golden Ratio
- Quality Level: Standard, High, Ultra

---

## Common Patterns

### State Management
Each page uses a `state` object for reactive state management, persisting key values to localStorage.

### Element Caching
DOM elements are cached in an `elements` object, initialized via `initElements()` on page load.

### Prompt Generation
Each page has a `generatePrompt()` function that builds detailed AI prompts by concatenating descriptions from various option maps.

### History
Generation history stored in localStorage with configurable limits, supporting view, re-use, and export.

### Error Handling
`showError()` function displays user-friendly error messages. API errors are caught and displayed appropriately.
