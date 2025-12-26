# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Product Infographics Generator - a web application that creates marketing infographics using the OpenRouter API with various AI image generation models (Gemini, GPT, Flux, Riverflow).

## Development

No build process required. To run:
- Open `index.html` directly in a browser, or
- Serve with any static file server (e.g., `python3 -m http.server 8000`)

## Architecture

The application is split into three files:

### `index.html`
- Two-column layout with input form (left) and result display (right)
- History section and modals (lightbox, history modal)
- All HTML structure and component markup

### `styles.css`
- CSS variables for theming (Anthropic-inspired color palette)
- Responsive grid layout
- Form components, sliders, buttons
- Modal system, lightbox, watermark controls
- Advanced options section styling

### `script.js`
Vanilla JS with the following structure:
- `state` object: Manages language, API key, uploaded images, generated images, history
- `elements` object: Cached DOM references (initialized in `initElements()`)
- `iconSuggestions` map: Keyword-to-icon mapping for smart icon suggestions
- Key functions:
  - `generatePrompt()`: Builds comprehensive AI prompt based on all settings
  - `generateInfographic()`: Makes API call to OpenRouter with multimodal support
  - `enhanceImage()`: Client-side auto-levels and contrast adjustment
  - History management: localStorage-based with 20-item limit
  - Language toggle: English/Romanian with proper diacritics support

## API Integration

Uses OpenRouter's `/api/v1/chat/completions` endpoint with `modalities: ['image', 'text']` for image generation. The response handling supports multiple formats (Gemini's inline_data, OpenAI's image_url, base64 responses).

## Key Features

- Multimodal input: Product photo can be uploaded and sent to the AI as reference
- Multiple style presets: auto, rich callouts, callout lines, light/dark/gradient backgrounds
- Generation history: Stored in localStorage, viewable in modal, exportable
- Bilingual: English and Romanian with proper character support (ă, â, î, ș, ț)
- Feedback-based adjustment: Regenerate with text feedback to refine results
- SEO alt text: Auto-generated descriptive text with copy button
- Watermark system: Add text or logo watermarks with position/opacity controls (client-side canvas)
- Keyboard shortcuts: Ctrl+Enter to generate, Ctrl+D to download, Escape to close modals

### Image Quality Controls (Advanced Options)

**Layout & Composition:**
- Layout Template: Auto, Product Center/Left/Right/Top, Grid, Hero
- Aspect Ratio: Auto, 1:1, 2:3, 4:5, 16:9, 9:16
- Product Focus: Auto, Full Product, Close-up, Dynamic Angle, In Context, Floating, Multiple Views
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
- Style Influence Slider: 10-100% control over how strongly reference affects output

**Generation Settings:**
- Seed control for reproducible generations
- Negative prompts to specify what to avoid

### Characteristic Features
- Star button to mark primary features (shown larger/more prominent)
- Auto-icon suggestions based on keyword detection (battery, wifi, camera, etc.)
- Manual icon selection per characteristic

### Image Enhancement
- Auto-enhance toggle for uploaded product photos (auto-levels, contrast adjustment)
