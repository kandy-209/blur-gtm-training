// Global WebGL context - similar to ship-25-explorations
import { createContext } from 'react';

export interface WebGLContextType {
  gl: WebGLRenderingContext | null;
  canvas: HTMLCanvasElement | null;
}

export const GLOBAL_GL: WebGLContextType = {
  gl: null,
  canvas: null,
};

export const WebGLContext = createContext<WebGLContextType>(GLOBAL_GL);

