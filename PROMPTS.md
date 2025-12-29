# PROMPTS.md

Prompt engineering patterns for AI image generation in NGRAPHICS.

---

## General Principles

### Structure
All prompts follow this pattern:
1. **Opening statement** - What to create (1 sentence)
2. **Critical instructions** - Non-negotiable requirements
3. **Subject details** - Product, model, or scene specifics
4. **Style parameters** - Visual style, lighting, composition
5. **Technical specs** - Aspect ratio, quality level
6. **Negative prompt** - What to avoid (optional)

### Effective Descriptors

**Quality boosters** (use sparingly):
- "professional photography"
- "high-quality, 4K resolution"
- "magazine-quality professional photography"
- "shot with Canon EOS R5 and 85mm f/1.4 lens"
- "award-winning masterpiece photography"
- "Vogue/Harper's Bazaar editorial quality"

**Lighting terms**:
- "professional studio lighting setup, clean and even"
- "natural daylight, bright and even"
- "warm golden hour lighting with soft orange tones"
- "soft diffused lighting, flattering and even with minimal shadows"
- "dramatic cinematic lighting with strong contrast and shadows"
- "backlit with rim light effect, glowing edges"

**Camera/lens terms**:
- "shot at eye level" / "low angle looking up" / "high angle looking down"
- "shallow depth of field with creamy bokeh, shot at f/1.8"
- "deep depth of field at f/8-f/11, sharp throughout"
- "85mm portrait lens, flattering compression"
- "35mm lens, natural street photography perspective"

**Style terms**:
- "clean commercial e-commerce photography"
- "high-fashion editorial magazine photography style"
- "natural lifestyle photography, candid and authentic"
- "cinematic film look with rich contrast and teal-orange tones"

### Things to Avoid

**In prompts:**
- Vague terms like "beautiful" or "nice" without specifics
- Contradictory instructions
- Too many competing styles
- Overly long prompts (diminishing returns after ~300 words)

**Common negative prompts:**
- "blurry, text, watermark, distorted, low quality"
- "cropped, out of frame, duplicate"
- "bad anatomy, deformed, ugly"

---

## Infographics Prompt Pattern

### Purpose
Create marketing infographics with product photos, feature callouts, and styled text.

### Opening Structure
```
Create a [quality level] - a product infographic IMAGE with text overlays, icons, and visual elements.

PRODUCT REFERENCE: I am providing a photo of the actual product.
CRITICAL: The product must appear EXACTLY as shown - same colors, shape, labels, and details.

BACKGROUND: [style description]

DESIGN REQUIREMENTS:
- Text should be sharp, readable, and contrast well with the background
- Include icons next to each feature
- Professional marketing aesthetic
```

### Quality Levels
- **standard**: "professional marketing graphic"
- **high**: "high-quality professional marketing graphic with sharp text and crisp details"
- **ultra**: "premium quality marketing graphic, magazine-advertisement quality"
- **masterpiece**: "award-winning advertising campaign quality, luxury brand aesthetic"

### Style Reference
When user provides a style reference image:
```
STYLE REFERENCE: I am also providing a style reference image. Match its visual aesthetic,
color treatment, typography style, and overall design language. The influence should be [X]%.
```

### Feature Formatting
```
PRODUCT FEATURES:
Display each feature with an icon. Use the EXACT text provided - do not expand, rephrase, or add words.

PRIMARY FEATURES (display larger/more prominent):
★ "Feature text" [icon: checkmark]

SECONDARY FEATURES:
• "Feature text" [icon: shield]
```

### Layout Instructions
- **Center**: "Place the product in the CENTER with features arranged around it"
- **Left/Right**: "Place the product on the [SIDE], features on the opposite side"
- **Grid**: "Create a GRID LAYOUT with product in larger cell, features in smaller cells"
- **Hero**: "Product prominently displayed at top, features in a row below"

### Visual Density Scale
1. "MINIMAL - very few elements, maximum whitespace, only essential text"
2. "CLEAN - simple layout, generous whitespace, subtle decorations"
3. "BALANCED - moderate elements, good whitespace, some decorative elements"
4. "DETAILED - more visual elements, icons for each feature, decorative backgrounds"
5. "RICH - many elements, badges, icons, patterns, decorative shapes, vibrant"

### Icon Style Options
- **Realistic**: "PHOTO-LIKE icons, small detailed images, realistic textures"
- **Illustrated**: "HAND-DRAWN style, artistic, sketch-like with brush strokes"
- **3D**: "3D RENDERED with depth, shadows, lighting, perspective"
- **Flat**: "FLAT, MINIMAL with solid colors, no gradients, simple shapes"
- **Outlined**: "STROKE icons with consistent line weight, no fill"
- **Gradient**: "GLOSSY icons with color transitions and shine effects"

### Callout Lines Specification
```
CALLOUT LINES - IMPORTANT SPECIFICATIONS:

LINE THICKNESS: [1px HAIRLINE / 2px THIN / 3px MEDIUM / 4-5px THICK / 6-8px HEAVY]
LINE COLORS: [MONO / MULTI / GRADIENT / MATCH PRODUCT]

STRUCTURE FOR EACH CALLOUT:
- Draw a line from the product part → to a label with ICON + short text
- Add decorative endpoints: dots, circles, or small shapes
```

---

## Model Studio Prompt Pattern

### Purpose
Generate photos of AI models wearing/holding products.

### Model Description Building
Build flowing, natural sentences:
```javascript
// Pattern:
"a [ethnicity] [gender] model [age] with [body type] and [hair]"

// Examples:
"a Caucasian female model in their early 20s with slim build and long hair"
"a Black/African male model in their late 20s with athletic/muscular build and short hair"
"a East Asian model in their 40s with curvy build"
```

### Product Integration Terms
- Clothing: "wearing the [product description]"
- Accessory: "wearing/using the [product] as an accessory"
- Handheld: "holding the [product] naturally in their hands"
- Footwear: "wearing the [product] on their feet"
- Jewelry: "wearing the [product] as jewelry"
- Bag: "carrying/holding the [product]"

### Shot Type Descriptions
- **Full body**: "full body shot showing the entire outfit"
- **Half body**: "half body/waist-up shot"
- **Portrait**: "portrait/headshot focusing on upper body"
- **Closeup**: "close-up shot focusing on the product"
- **Hands**: "close-up of hands holding/interacting with the product"
- **Detail**: "extreme close-up detail shot of the product being worn"

### Scene Descriptions
Base + optional custom details:
```
"professional photography studio with clean backdrop"
"urban city street with modern architecture"
"cozy café or coffee shop interior with warm ambiance"
"stylish modern home interior with comfortable furniture and warm lighting"
```

### Expression Terms
- "neutral calm expression"
- "gentle natural smile"
- "serious confident expression"
- "candid natural expression"

### Pose Terms
- "natural relaxed pose"
- "confident power pose"
- "dynamic pose with movement"
- "elegant graceful pose"
- "walking pose with natural movement"

### Quality Enhancement Stack
```
// Standard
"professional photography"

// High
"professional high-quality photography, sharp details, 4K resolution"

// Ultra
"8K ultra high resolution, magazine-quality, shot with Canon EOS R5 and 85mm f/1.4 lens, professionally retouched"

// Masterpiece
"award-winning masterpiece photography, Vogue/Harper's Bazaar editorial quality, shot by world-renowned fashion photographer, 8K ultra-detailed, perfect lighting, professionally color graded, gallery-worthy"
```

### Technical Parameters
- **Depth of field**: "shallow at f/1.8 with creamy bokeh" / "deep at f/8-f/11, sharp throughout"
- **Color grading**: "warm golden", "cool moody with blue shadows", "cinematic teal-orange"
- **Skin retouch**: "natural with visible texture" → "flawless porcelain-like, magazine-ready"
- **Composition**: "centered" / "rule of thirds" / "generous negative space"

### Collage Mode
```
"Create a [2x2 grid / 2-panel side-by-side / 3-panel grid] collage showing:
[front view, left profile, right profile, back view]
Each panel should show the same model and outfit from different angles."
```

---

## Bundle Studio Prompt Pattern

### Purpose
Create product bundle/kit images from multiple individual products.

### Opening Structure
```
Create a [quality level]

TASK: Generate a product bundle image showing [N] items arranged together as a cohesive set.

CRITICAL: I am providing reference images of the actual products. Each product must appear
EXACTLY as shown - same colors, labels, packaging, and details. Do NOT modify, reinterpret,
or stylize any product.

PRODUCTS IN BUNDLE:
1. Product Name: description
2. Product Name: description
```

### Quality Levels (same as Model Studio)
- **standard**: "Professional product photography."
- **high**: "Professional high-quality product photography, sharp details, 4K resolution."
- **ultra**: "8K ultra high resolution, magazine-quality product photography"
- **masterpiece**: "Award-winning masterpiece product photography, luxury brand campaign quality"

### Layout Descriptions
- **Flat lay**: "photographed from directly above (bird's eye view), artfully scattered with intentional spacing"
- **Grouped**: "natural grouping, casually placed together, can slightly overlap or lean against each other"
- **Grid**: "clean organized grid pattern with equal spacing, clinical e-commerce style"
- **Hero**: "main product prominently larger/centered, supporting products smaller around it"
- **Unboxing**: "products in and around an open container, some spilling out, gift being unwrapped feeling"
- **Numbered**: "clear sequence with visible number indicators (1, 2, 3...)"

### Container Options
- "elegant gift box with lid"
- "clean cardboard shipping box"
- "fabric pouch or drawstring bag"
- "decorative tray or plate"
- "woven basket"

### Surface Descriptions
- "white/gray marble surface"
- "light natural wood surface"
- "dark walnut or mahogany wood surface"
- "natural linen or cotton fabric surface"
- "smooth concrete or stone surface"
- "terrazzo surface with colorful speckles"

### Cohesion Instructions
```
"Ensure all products are clearly visible and identifiable.
Maintain consistent lighting and shadows across all items.
The composition should feel cohesive, as if all products belong together as a set.
High-quality, professional product photography."
```

---

## Adjustment/Feedback Pattern

When regenerating with user feedback:

```
"Here is an image I generated previously, along with the original generation prompt.
Please regenerate this image with the following adjustments:

ADJUSTMENT REQUEST: [user feedback]

ORIGINAL PROMPT: [previous prompt]

Keep the same overall composition and style, but apply the requested adjustments."
```

---

## Tips for Better Results

1. **Be specific** - "warm golden hour lighting" beats "nice lighting"
2. **Use photography terms** - Models understand camera/lens language
3. **Layer quality boosters** - Combine resolution + equipment + style terms
4. **Preserve the product** - Always include "DO NOT modify the product"
5. **Specify exact text** - Use quotes for text that must appear verbatim
6. **Control density** - Match visual complexity to use case
7. **Include aspect ratio** - Models handle this better with explicit instruction
8. **Use negative prompts** - Filter out common issues proactively
