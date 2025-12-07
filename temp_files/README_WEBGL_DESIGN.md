# 🎨 WebGL Design Implementation

## Overview
This project now includes a WebGL-powered homepage design inspired by [ship-25-explorations](https://github.com/basementstudio/ship-25-explorations), featuring a 3D Cursor logo.

## Features

### WebGL Canvas Background
- **3D Cursor Logo**: Animated 3D Cursor logo with rotation and floating effects
- **Particle Field**: Subtle background particle effects
- **Smooth Animations**: Performance-optimized animations using React Three Fiber

### Design Elements
- Modern, minimalist layout
- WebGL-powered visual effects
- Cursor branding throughout
- Responsive design maintained

## Installation

Install the required dependencies:

```bash
npm install @react-three/fiber @react-three/drei three
```

## Components

### `WebGLCanvas`
Main WebGL canvas component that renders the 3D scene.

**Location**: `src/components/WebGLCanvas.tsx`

**Props**:
- `className?: string` - Additional CSS classes
- `showLogo?: boolean` - Toggle logo visibility

### `CursorLogo3D`
3D Cursor logo component with animations.

**Location**: `src/components/CursorLogo3D.tsx`

**Props**:
- `position?: [number, number, number]` - 3D position
- `rotationSpeed?: number` - Rotation speed multiplier
- `scale?: number` - Scale factor

## Usage

The WebGL canvas is integrated into the homepage (`src/app/page.tsx`) as a background layer:

```tsx
<div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
  <WebGLCanvas className="opacity-30" showLogo={true} />
</div>
```

## Performance

- Uses `Suspense` for code splitting
- Optimized particle count (100 particles)
- Disabled controls for background use
- Low opacity to maintain readability

## Customization

### Adjust Logo Animation
Edit `src/components/CursorLogo3D.tsx`:
- Change `rotationSpeed` prop
- Modify `useFrame` animation logic
- Adjust scale and position

### Modify Particles
Edit `ParticleField` in `src/components/WebGLCanvas.tsx`:
- Change `particleCount`
- Adjust particle size and opacity
- Modify animation speed

## Browser Support

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Graceful degradation for unsupported browsers

## Next Steps

1. ✅ Install dependencies
2. ✅ Create WebGL components
3. ✅ Integrate into homepage
4. 🔄 Test and optimize
5. 🔄 Add more interactive effects (optional)


