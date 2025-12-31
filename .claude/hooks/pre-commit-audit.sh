#!/bin/bash
# Pre-commit audit hook for NGRAPHICS
# Runs basic checks before allowing commits

set -e

# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Only run for git commit commands
TOOL_INPUT="${1:-}"
if [ -n "$TOOL_INPUT" ]; then
  COMMAND=$(echo "$TOOL_INPUT" | jq -r '.tool_input.command' 2>/dev/null || echo "")
  if [[ ! "$COMMAND" =~ ^git\ commit ]]; then
    # Silent exit for non-commit commands
    exec >/dev/null 2>&1
    exit 0
  fi
fi

echo "🔍 Running pre-commit audit..."

ERRORS=0

# Check 1: Validate JavaScript syntax
echo "  Checking JavaScript syntax..."
for js_file in "$PROJECT_DIR"/*.js; do
  if [ -f "$js_file" ]; then
    if ! node -c "$js_file" 2>/dev/null; then
      echo "  ❌ Syntax error in $(basename "$js_file")"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# Check 2: Verify all HTML files have pre-rendered headers
echo "  Checking pre-rendered headers..."
for html_file in "$PROJECT_DIR"/*.html; do
  if [ -f "$html_file" ] && [ "$(basename "$html_file")" != "docs.html" ]; then
    if ! grep -q "site-header" "$html_file" 2>/dev/null; then
      continue
    fi
    if ! grep -q "logo-mark" "$html_file" 2>/dev/null; then
      echo "  ❌ $(basename "$html_file"): Header not pre-rendered (missing logo-mark)"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# Check 3: Verify theme toggle exists
echo "  Checking theme toggles..."
for html_file in "$PROJECT_DIR"/*.html; do
  if [ -f "$html_file" ] && [ "$(basename "$html_file")" != "docs.html" ]; then
    if grep -q "site-header" "$html_file" 2>/dev/null; then
      if ! grep -q 'id="themeToggle"' "$html_file" 2>/dev/null; then
        echo "  ❌ $(basename "$html_file"): Missing themeToggle button"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi
done

# Check 4: Verify footer exists on studio pages
echo "  Checking footers..."
STUDIO_PAGES=("infographics.html" "models.html" "bundle.html" "lifestyle.html" "copywriter.html"
              "packaging.html" "comparison.html" "size-visualizer.html" "faq-generator.html"
              "background.html" "badge-generator.html" "feature-cards.html" "size-chart.html"
              "a-plus.html" "product-variants.html" "social-studio.html" "export-center.html"
              "ad-creative.html" "model-video.html")
for page in "${STUDIO_PAGES[@]}"; do
  if [ -f "$PROJECT_DIR/$page" ]; then
    if ! grep -q "site-footer" "$PROJECT_DIR/$page" 2>/dev/null; then
      echo "  ❌ $page: Missing footer"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# Check 5: No console.log in production code (warning only)
echo "  Checking for debug statements..."
WARNINGS=0
for js_file in "$PROJECT_DIR"/*.js; do
  if [ -f "$js_file" ]; then
    LOG_COUNT=$(grep -c "console\.log" "$js_file" 2>/dev/null | head -1 || echo "0")
    LOG_COUNT=${LOG_COUNT:-0}
    if [ "$LOG_COUNT" -gt 5 ] 2>/dev/null; then
      echo "  ⚠️  $(basename "$js_file"): $LOG_COUNT console.log statements"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
done

# Summary
echo ""
if [ $ERRORS -gt 0 ]; then
  echo "❌ Audit failed: $ERRORS error(s) found"
  echo "   Fix the issues above before committing."
  exit 2  # Exit code 2 blocks the tool call
else
  if [ $WARNINGS -gt 0 ]; then
    echo "✅ Audit passed with $WARNINGS warning(s)"
  else
    echo "✅ Audit passed"
  fi
  exit 0
fi
