import { GifFrame, Gif } from 'gifwrap'
// import Transformation=require('./Transformation')

/*
  interface Transform {
    static async function transform(gif: PseudoGif, options: object): Promise<PseudoGif>
  }

  export class Flip implements Transform{}
*/
export const zoomImageDefaultZoom: number
export const rollImageDefaultSpeed: number
export const genkiImageDefaultSpeed: number
export const imageDefaultInterval: number
export const defaultWidth: number
export const defaultHeight: number
export const speedImageDefaultDelay: number
export const gifwrapDefaultDelay: number

export class PseudoGif {
  frames: GifFrame[]
  width: number
  height: number

  constructor (frames: GifFrame[], width: number, height: number)
}

export namespace Transformation {
  export function resizeDown (image: PseudoGif): PseudoGif
  export function transform (image: PseudoGif, mode: string, options: object): PseudoGif
  export function generateGif (gif: PseudoGif): Promise<Gif>
}
