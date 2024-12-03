# Module Resolution Error: @popperjs/core

## Issue Description

```
Uncaught TypeError: Failed to resolve module specifier "@popperjs/core". 
Relative references must start with either "/", "./", or "../".
```

## Cause
This error occurs when using ES modules in the browser and trying to import `@popperjs/core` using Node.js-style bare module specifiers. Browsers don't support bare module specifiers and require full URLs or relative paths.

## Solution

Replace the bare module import with a direct CDN URL. Here are two approaches:

### Option 1: Use CDN URL directly
```html
<script type="module">
  import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/popper.min.js';
</script>
```

### Option 2: Use import maps (Modern browsers)
Add this before any module scripts:
```html
<script type="importmap">
{
  "imports": {
    "@popperjs/core": "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/popper.min.js"
  }
}
</script>
```

Then you can use the original import:
```javascript
import * as Popper from '@popperjs/core';
```

## Implementation
We've implemented Option 1 in our codebase as it has broader browser support. The fix has been applied to the following files:
- `images.html`
- Other pages using Bootstrap's JavaScript components

## Related Issues
- Bootstrap's JavaScript components depend on @popperjs/core
- This is a common issue when transitioning from Node.js/bundler environments to native ES modules in the browser

## References
- [MDN: Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
- [Popper.js Documentation](https://popper.js.org/docs/v2/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/getting-started/javascript/)
