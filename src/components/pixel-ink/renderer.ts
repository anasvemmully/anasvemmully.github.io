/// <reference types="@webgpu/types" />
import { blobsAt } from "./blobs";
import { GREEN_RAMP_FALLBACK } from "./config";
import { SHADER } from "./shader";

type Rgb = [number, number, number];

/** Floats in the shader's uniform block: 4 + 5×4 + 4×4. */
const UNIFORM_FLOATS = 40;
/** Where the green ramp and the blobs start in the uniform block. */
const RAMP_OFFSET = 4;
const BLOBS_OFFSET = 24;

export type Renderer = {
  /** Matches the canvas to its CSS size and re-reads the green ramp. */
  resize(): void;
  /** Re-reads the green ramp from the CSS variables, after the theme changes. */
  refreshColors(): void;
  /** Draws the wall as it looks `t` seconds after it appeared. */
  draw(t: number): void;
  dispose(): void;
};

/** Converts any CSS color to 0–1 RGB, by letting a 1×1 canvas parse it. */
function toRgb(css: string): Rgb {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

/** The green ramp (empty tile, then levels 1–4) from the `--ink-green-*` CSS variables. */
function readRamp(canvas: HTMLCanvasElement) {
  const style = getComputedStyle(canvas);
  return GREEN_RAMP_FALLBACK.map((fallback, n) =>
    toRgb(style.getPropertyValue(`--ink-green-${n}`).trim() || fallback),
  );
}

/**
 * Sets up WebGPU on a canvas. Resolves to null when WebGPU isn't available,
 * so the caller can leave the canvas empty.
 */
export async function createRenderer(canvas: HTMLCanvasElement): Promise<Renderer | null> {
  if (!navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!device || !context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const shaderModule = device.createShaderModule({ code: SHADER });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shaderModule, entryPoint: "vs" },
    fragment: { module: shaderModule, entryPoint: "fs", targets: [{ format }] },
  });
  const uniformBuffer = device.createBuffer({
    size: UNIFORM_FLOATS * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const uniforms = new Float32Array(UNIFORM_FLOATS);
  let ramp = readRamp(canvas);
  let width = 0;
  let height = 0;
  let dpr = 1;

  return {
    resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ramp = readRamp(canvas);
    },

    refreshColors() {
      ramp = readRamp(canvas);
    },

    draw(t) {
      uniforms.set([width, height, t, dpr], 0);
      ramp.forEach((rgb, n) => uniforms.set([...rgb, 1], RAMP_OFFSET + n * 4));
      blobsAt(t, width, height).forEach((b, n) =>
        uniforms.set([b.x, b.y, b.radius, 0], BLOBS_OFFSET + n * 4),
      );
      device.queue.writeBuffer(uniformBuffer, 0, uniforms);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },

    dispose() {
      device.destroy();
    },
  };
}
