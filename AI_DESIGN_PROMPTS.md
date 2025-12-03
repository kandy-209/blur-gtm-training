# AI Design Agent Prompts Collection 🤖

This document contains ready-to-use prompts for AI design agents to improve the premium liquid/gloss design system.

---

## 🎨 Prompt Template Structure

Each prompt follows this structure:
- **Role**: Define the AI's expertise level
- **Context**: Provide current state information
- **Task**: Clear, specific instructions
- **Requirements**: Constraints and criteria
- **Output**: Expected deliverables

---

## Prompt 1: Visual Depth System Enhancement

```
You are a top 0.05% UI/Brand design engineer specializing in premium liquid and gloss aesthetics inspired by Vercel and Cursor.

CONTEXT:
I have a design system with glassmorphism effects, but the visual depth needs enhancement. Current implementation uses basic shadows and borders.

TASK:
Create an advanced visual depth system with:

1. Multi-layer shadow system (5 depth levels: subtle, light, medium, elevated, floating)
   - Each level should have 3-4 shadow layers
   - Include inset shadows for glass effect
   - Add colored shadows for depth cues

2. Refined border treatments
   - Ultra-minimal borders (0.05-0.1 opacity)
   - Gradient borders for premium feel
   - Contextual border opacity based on element state

3. Depth cues for interactive elements
   - Hover: Elevate with shadow increase
   - Focus: Add colored glow ring
   - Active: Inset shadow for pressed effect
   - Disabled: Reduce depth significantly

4. Glass effect integration
   - Shadows must complement backdrop-filter blur
   - Ensure depth works with transparency
   - Test with various background colors

REQUIREMENTS:
- All shadows must be GPU-accelerated (use transform, opacity)
- Maintain WCAG AA contrast ratios
- Support both light and dark modes
- Performance: 60fps animations
- Mobile: Optimize shadow complexity for performance
- Browser: Provide fallbacks for older browsers

OUTPUT:
1. CSS utility classes for 5 depth levels
2. Component variants with depth system
3. Usage examples for cards, buttons, modals
4. Dark mode variants
5. Performance optimization notes
6. Browser compatibility notes

Format: CSS utilities, React/TypeScript component examples, documentation.
```

---

## Prompt 2: Advanced Liquid Effects System

```
You are a top 0.05% UI/Brand design engineer. Create an advanced liquid effects system.

CONTEXT:
Current system has basic shimmer and gloss-sweep animations. Need more dynamic, interactive liquid effects.

TASK:
Implement sophisticated liquid/gloss effects:

1. Interactive liquid hover effects
   - Ripple effect on button click/hover
   - Liquid wave animation on card hover
   - Gradient shift on interaction
   - Smooth morphing between states

2. Dynamic gradient animations
   - Background gradients that shift subtly
   - Color transitions that feel organic
   - Multi-stop gradients with animation
   - Context-aware gradient changes

3. Liquid loading states
   - Progress bars with liquid fill effect
   - Spinner with liquid rotation
   - Skeleton loaders with shimmer
   - Smooth state transitions

4. Fluid transitions
   - Page transitions with liquid morphing
   - Element state changes with fluid motion
   - Smooth color transitions
   - Organic easing curves

REQUIREMENTS:
- All animations: 60fps performance
- Accessibility: Respect prefers-reduced-motion
- Mobile: Optimize for touch (larger touch targets)
- Performance: Use CSS transforms, avoid layout shifts
- Browser: Provide JavaScript fallbacks
- Duration: Animations should feel natural (200-400ms)

OUTPUT:
1. CSS keyframe animations
2. React hooks for interactive effects
3. Loading state components
4. Transition utilities
5. Performance optimization guide
6. Accessibility implementation notes

Format: Code examples, component implementations, usage documentation.
```

---

## Prompt 3: Color & Contrast Enhancement

```
You are a top 0.05% UI/Brand design engineer. Design a sophisticated color system.

CONTEXT:
Current design uses primarily black/white/gray. Need accent colors and better contrast system.

TASK:
Create a premium color system:

1. Accent color palette
   - Primary accent: Blue (for CTAs, links)
   - Secondary accent: Purple (for highlights)
   - Success: Green (subtle, professional)
   - Warning: Amber (subtle, not alarming)
   - Error: Red (clear but not harsh)
   - All colors must work with glass effects

2. Gradient overlays
   - Subtle gradients for depth
   - Color overlays for glass elements
   - Gradient borders
   - Background gradients

3. Color-coded states
   - Success: Green tint with glow
   - Warning: Amber tint with glow
   - Info: Blue tint with glow
   - Error: Red tint with glow
   - All maintain glass aesthetic

4. Contrast system
   - Ensure WCAG AA compliance
   - Test with color blindness simulators
   - Provide high-contrast mode
   - Dark mode color variants

REQUIREMENTS:
- Colors must feel premium and professional
- Gradients should be subtle (not overwhelming)
- States must be clearly distinguishable
- Dark mode: Inverted but harmonious
- Color-blind: Use patterns/icons in addition to color
- Accessibility: WCAG AA minimum, AAA preferred

OUTPUT:
1. CSS color variables (light/dark modes)
2. Gradient utilities
3. State variant components
4. Contrast testing results
5. Color usage guidelines
6. Dark mode implementation

Format: Design tokens, CSS variables, component examples, documentation.
```

---

## Prompt 4: Micro-interaction Enhancement

```
You are a top 0.05% UI/Brand design engineer. Enhance micro-interactions throughout the system.

CONTEXT:
Current interactions are functional but lack the premium feel of Vercel/Cursor. Need more sophisticated feedback.

TASK:
Enhance micro-interactions:

1. Button interactions
   - Hover: Liquid ripple + elevation + glow
   - Active: Pressed effect with liquid compression
   - Focus: Animated ring with glow
   - Loading: Liquid progress indicator
   - Success: Celebration animation

2. Card interactions
   - Hover: Smooth lift with shadow increase
   - Focus: Border glow + shadow
   - Click: Subtle press feedback
   - Loading: Skeleton with shimmer

3. Form inputs
   - Focus: Animated border + glow
   - Valid: Green checkmark with liquid reveal
   - Invalid: Red shake with error message
   - Typing: Subtle pulse on active

4. Navigation
   - Active state: Underline with liquid fill
   - Hover: Smooth color transition
   - Focus: Clear visual indicator
   - Mobile: Touch-optimized interactions

REQUIREMENTS:
- Response time: <100ms for feedback
- Animations: Guide user attention
- Accessibility: Keyboard navigation support
- Mobile: Touch targets 44x44px minimum
- Performance: GPU-accelerated transforms
- Duration: 200-400ms for most interactions

OUTPUT:
1. Enhanced component interactions
2. Animation utilities
3. Interaction guidelines
4. Accessibility implementation
5. Mobile optimization notes
6. Performance benchmarks

Format: Component code, CSS animations, usage examples, documentation.
```

---

## Prompt 5: Performance & Accessibility Audit

```
You are a top 0.05% UI/Brand design engineer. Conduct comprehensive audit.

CONTEXT:
Design system needs performance optimization and accessibility improvements.

TASK:
Audit and optimize:

1. Performance analysis
   - Measure animation FPS
   - Identify layout shift sources
   - Analyze paint/composite costs
   - Test on low-end devices
   - Optimize backdrop-filter usage

2. Accessibility audit
   - WCAG AA compliance check
   - Screen reader testing
   - Keyboard navigation testing
   - Color contrast verification
   - Focus management review

3. Mobile optimization
   - Touch target sizing
   - Gesture support
   - Performance on mobile
   - Viewport optimization
   - Touch interaction feedback

4. Browser compatibility
   - Test on major browsers
   - Provide fallbacks
   - Progressive enhancement
   - Feature detection
   - Graceful degradation

5. Motion preferences
   - prefers-reduced-motion support
   - Alternative animations
   - Respect user preferences
   - Provide toggle option

REQUIREMENTS:
- Lighthouse: 90+ performance score
- WCAG: AA compliance minimum
- Mobile: Smooth on mid-range devices
- Browser: Support last 2 versions
- Motion: Full reduced-motion support
- Performance: 60fps animations

OUTPUT:
1. Performance report with metrics
2. Accessibility checklist and fixes
3. Mobile optimization guide
4. Browser compatibility matrix
5. Reduced-motion alternatives
6. Optimization recommendations

Format: Reports, checklists, code fixes, documentation.
```

---

## Prompt 6: Complete Design System Refinement

```
You are a top 0.05% UI/Brand design engineer. Conduct comprehensive design system review.

CONTEXT:
Need to refine entire design system to match/exceed Vercel and Cursor quality.

TASK:
Comprehensive refinement:

1. Design pattern analysis
   - Compare with Vercel patterns
   - Compare with Cursor patterns
   - Identify gaps
   - Find opportunities
   - Document differences

2. Unified design language
   - Consistent spacing system
   - Unified typography scale
   - Harmonious color system
   - Standardized component patterns
   - Clear visual hierarchy

3. Component consistency
   - Review all components
   - Ensure consistent patterns
   - Standardize variants
   - Document usage
   - Create component library

4. Design documentation
   - Usage guidelines
   - Component API docs
   - Design principles
   - Best practices
   - Common patterns

5. Migration path
   - Identify breaking changes
   - Provide upgrade guide
   - Create codemods if needed
   - Versioning strategy
   - Deprecation notices

REQUIREMENTS:
- Quality: Match/exceed Vercel/Cursor
- Consistency: Unified patterns
- Scalability: Easy to extend
- Documentation: Comprehensive
- Migration: Smooth upgrade path
- Performance: No regressions

OUTPUT:
1. Design system documentation
2. Component library updates
3. Migration guide
4. Design principles document
5. Usage examples
6. Versioning strategy

Format: Documentation, code updates, migration guides, examples.
```

---

## Prompt 7: Responsive Design Optimization

```
You are a top 0.05% UI/Brand design engineer. Optimize for responsive design.

CONTEXT:
Design system needs optimization for various screen sizes and devices.

TASK:
Responsive optimization:

1. Breakpoint system
   - Define breakpoints (mobile, tablet, desktop, large)
   - Optimize glass effects per breakpoint
   - Adjust blur intensity
   - Scale shadows appropriately
   - Optimize animations

2. Mobile-first approach
   - Touch-optimized interactions
   - Simplified effects for performance
   - Larger touch targets
   - Swipe gestures
   - Mobile navigation patterns

3. Tablet optimization
   - Balanced effects
   - Touch + mouse support
   - Optimized layouts
   - Performance considerations

4. Desktop enhancement
   - Full effect intensity
   - Hover states
   - Keyboard navigation
   - Multi-column layouts

REQUIREMENTS:
- Mobile: Smooth on mid-range devices
- Tablet: Balanced experience
- Desktop: Full premium effects
- Performance: No degradation
- Accessibility: Maintained across sizes
- Consistency: Unified experience

OUTPUT:
1. Responsive utilities
2. Breakpoint system
3. Mobile optimizations
4. Component variants per breakpoint
5. Performance notes
6. Testing checklist

Format: CSS utilities, component variants, documentation, examples.
```

---

## Prompt 8: Dark Mode Enhancement

```
You are a top 0.05% UI/Brand design engineer. Enhance dark mode implementation.

CONTEXT:
Current dark mode is basic. Need sophisticated dark mode that maintains premium feel.

TASK:
Dark mode enhancement:

1. Color system
   - Dark backgrounds (not pure black)
   - Adjusted glass effects
   - Proper contrast ratios
   - Accent color adjustments
   - Gradient modifications

2. Glass effects
   - Adjusted opacity for dark backgrounds
   - Modified blur intensity
   - Border color adjustments
   - Shadow modifications
   - Glow effects enhancement

3. Visual hierarchy
   - Maintain depth in dark mode
   - Ensure readability
   - Preserve visual interest
   - Adjust shadows
   - Enhance glows

4. Transitions
   - Smooth light/dark switching
   - Preserve animations
   - Maintain performance
   - User preference respect

REQUIREMENTS:
- Readability: WCAG AA contrast
- Aesthetics: Premium feel maintained
- Performance: No degradation
- Consistency: Unified experience
- Accessibility: Full support
- User control: Toggle option

OUTPUT:
1. Dark mode color tokens
2. Component dark variants
3. Transition utilities
4. Usage guidelines
5. Testing checklist
6. Implementation guide

Format: CSS variables, component updates, documentation, examples.
```

---

## 📋 Usage Instructions

1. **Copy the prompt** you need
2. **Add context** specific to your codebase
3. **Specify file paths** to current implementation
4. **Run with AI agent** (Claude, GPT-4, etc.)
5. **Review output** and iterate
6. **Test implementations** thoroughly
7. **Document decisions** made

---

## 🔄 Iteration Workflow

1. **Start with Prompt 6** (Complete System Review)
2. **Prioritize improvements** based on review
3. **Run specific prompts** (1-5, 7-8) as needed
4. **Test implementations** with users
5. **Iterate** based on feedback
6. **Document** final decisions

---

## ✅ Quality Checklist

Before using prompts, ensure:
- [ ] Current codebase is accessible
- [ ] Design goals are clear
- [ ] Performance baseline established
- [ ] User testing plan ready
- [ ] Documentation structure planned

---

*Last Updated: [Current Date]*
*Version: 1.0*


