import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // React Three Fiber elements
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      pointsMaterial: any;
      points: any;
      bufferGeometry: any;
      [key: string]: any; // Allow any Three.js element
    }
  }
}
