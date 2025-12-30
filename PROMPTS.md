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

---

## Lifestyle Studio Prompt Pattern

### Purpose
Generate pure product photography in lifestyle environments - no text overlays or infographic elements.

### Opening Structure
```
Create a [quality level] lifestyle photograph showing the product in a real-world setting.

PRODUCT REFERENCE: I am providing a photo of the actual product.
CRITICAL: The product must appear EXACTLY as shown - same colors, shape, labels, and details.
Do NOT add any text, labels, icons, or infographic elements to the image.

SCENE: [scene description]
MOOD: [mood description]
TIME OF DAY: [lighting description]
```

### Scene Descriptions
- **Living room**: "cozy living room with comfortable sofa, soft textiles, warm ambient lighting"
- **Kitchen**: "modern kitchen with clean countertops, natural light from window"
- **Outdoor**: "outdoor setting with natural elements, trees or garden visible"
- **Café**: "stylish café or coffee shop with warm wood tones and ambient lighting"
- **Beach**: "beach setting with sand, ocean, natural daylight"

### Mood Descriptors
- **Cozy**: "warm, inviting, comfortable atmosphere with soft textures"
- **Minimal**: "clean, uncluttered, plenty of negative space, modern aesthetic"
- **Luxurious**: "high-end, premium feel, rich materials, elegant styling"
- **Energetic**: "vibrant, dynamic, bright colors, active feeling"

### Time of Day
- **Morning**: "soft morning light, gentle shadows, fresh feeling"
- **Golden hour**: "warm golden sunlight, long soft shadows, romantic atmosphere"
- **Midday**: "bright even lighting, minimal shadows, clean look"

---

## Packaging Mockup Prompt Pattern

### Purpose
Visualize products in professional packaging designs.

### Opening Structure
```
Create a [quality level] product packaging mockup.

PRODUCT REFERENCE: I am providing a photo of the actual product.
The product should be shown [inside/on/with] professional [packaging type] packaging.

PACKAGING TYPE: [box/bottle/bag/pouch/jar/tube/can/label]
MATERIAL: [material description]
```

### Packaging Type Descriptions
- **Box**: "clean product box with [material], professional printing, crisp edges"
- **Bottle**: "[shape] bottle in [material], clean label application"
- **Bag**: "premium [paper/fabric] bag with handles, branded appearance"
- **Pouch**: "stand-up pouch with matte/glossy finish, resealable top"

### Scene Options
- **Studio**: "clean white/gradient studio backdrop, professional product photography"
- **Unboxing**: "unboxing scene with tissue paper, gift presentation feeling"
- **Retail shelf**: "retail store shelf setting, surrounded by complementary products"
- **Flat lay**: "top-down flat lay arrangement with props and decorative elements"

---

## Comparison Generator Prompt Pattern

### Purpose
Create side-by-side and before/after comparison images.

### Opening Structure
```
Create a [quality level] product comparison image.

COMPARISON TYPE: [before-after / vs-competitor / feature-table / size-lineup]

CRITICAL: Show products EXACTLY as provided - same colors, details, proportions.
```

### Layout Descriptions
- **Split**: "50/50 vertical split composition, clear dividing line"
- **Slider**: "comparison slider style with draggable divider appearance"
- **Grid**: "clean grid layout with equal spacing, labels for each product"
- **Table**: "comparison table format with features as rows, products as columns"

### Comparison Types
- **Before/After**: "transformation comparison showing [before state] vs [after state]"
- **Vs Competitor**: "side-by-side comparison with checkmarks for winning features"
- **Feature Table**: "tabular comparison highlighting [feature list] for each product"
- **Size Lineup**: "size variants displayed in sequence (small to large)"

---

## Size Visualizer Prompt Pattern

### Purpose
Show product scale with reference objects for size context.

### Opening Structure
```
Create a [quality level] size reference image showing the product alongside a familiar object for scale.

PRODUCT REFERENCE: I am providing a photo of the actual product.
REFERENCE OBJECT: [reference object]
PRODUCT DIMENSIONS: [width] x [height] x [depth] [units]
```

### Reference Object Descriptions
- **Hand**: "adult human hand (approximately 18-20cm length) for natural scale reference"
- **Smartphone**: "standard smartphone (approximately 15cm x 7cm) for tech context"
- **Coin**: "common coin (approximately 2.5cm diameter) for small item scale"
- **Ruler**: "measuring ruler with visible markings for precise scale"
- **Credit card**: "standard credit card (8.5cm x 5.4cm) for familiar reference"

### Display Mode Descriptions
- **Side-by-side**: "product placed next to reference object on clean surface"
- **In hand**: "product held naturally in human hand"
- **Technical**: "blueprint-style technical drawing with dimension callouts and measurement lines"
- **Context scene**: "product shown in [context] environment for real-world scale"

---

## FAQ Generator Prompt Pattern

### Purpose
Generate visual FAQ infographics from text Q&As.

### Opening Structure (for image generation)
```
Create a [quality level] FAQ infographic image.

PRODUCT: [product name/description]
STYLE: [infographic / Q&A card / top 5]

Display the following questions and answers in an engaging visual format:
[FAQ content]
```

### Image Type Descriptions
- **Infographic**: "full infographic layout with multiple Q&As, icons, visual hierarchy"
- **Q&A Card**: "single question spotlight card with prominent answer, clean design"
- **Top 5**: "numbered list format showing top 5 questions in engaging layout"

### Text Generation Structure
```
Generate [count] frequently asked questions and answers for this product.

PRODUCT: [product description from image analysis]
CATEGORIES: [selected categories: general, technical, shipping, usage, comparison, warranty]
TONE: [professional / friendly / casual / technical]
LANGUAGE: [English / Romanian]

Return as JSON array with format:
[{"category": "...", "question": "...", "answer": "..."}]
```

---

## Copywriter Prompt Pattern

### Purpose
Generate comprehensive marketing copy from product images.

### Analysis Prompt
```
Analyze this product image and extract:
1. Product title (SEO-optimized, ~80 characters)
2. Product category
3. Key features (5-7 bullet points)
4. Benefits (3-5 customer value propositions)

Return as JSON:
{"productTitle": "...", "productCategory": "...", "features": [...], "benefits": [...]}
```

### Copy Generation Structure
```
Generate comprehensive marketing copy for this product.

PRODUCT: [product title]
CATEGORY: [product category]
KEY FEATURES: [feature list]
BENEFITS: [benefit list]
TONE: [professional / casual / enthusiastic / luxury]
LANGUAGE: [English / Romanian]

Generate the following sections:
1. E-commerce: productTitle, shortDescription, longDescription, bulletFeatures, benefitsList
2. SEO: metaTitle (<60 chars), metaDescription (<160 chars), focusKeywords, altText
3. Social: instagramCaption (with hashtags), facebookPost, twitterPost (<280 chars)
4. Extras: taglines (3), emailSubjects (3)

Return as structured JSON.
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
9. **Match tone to brand** - Luxury products need different language than casual items
10. **Include dimensions** - For size-related prompts, actual measurements help accuracy
