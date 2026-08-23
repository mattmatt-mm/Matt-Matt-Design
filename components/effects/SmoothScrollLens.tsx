"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uPage;
  uniform float uDocumentWidth;
  uniform float uDocumentHeight;
  uniform float uHasTexture;
  uniform float uLensHeight;
  uniform float uScrollX;
  uniform float uScroll;
  uniform vec2 uTextureTexel;
  uniform float uVelocity;
  uniform float uViewportWidth;
  uniform float uViewportHeight;

  varying vec2 vUv;

  // Lens tuning ------------------------------------------------------------
  // Set this to true to reflect content across the lens entry. With false,
  // content keeps travelling in the page's original scrolling direction.
  const bool MIRROR_EFFECT = false;

  // Depth is a polynomial: 1:1 at the border, then progressively stretched
  // toward the viewport edge so letterforms can change shape with depth.
  const float MIRROR_LINEAR = float(0.72);
  const float MIRROR_QUADRATIC = float(0.16);
  const float MIRROR_CUBIC = float(0.4);
  const float ENTRY_BLEND_DEPTH = float(0.10);

  // Chromatic split is present at rest, then grows with scroll velocity.
  const float REST_CHROMA_X_PX = float(1.4);
  const float VELOCITY_CHROMA_X_PX = float(3.6);
  const float REST_CHROMA_Y_PX = float(2.5);
  const float VELOCITY_CHROMA_Y_PX = float(5.0);
  const float VELOCITY_SHEAR_PX = float(8.0);

  // Local edge displacement. These controls create liquid tendrils without
  // changing the global mirror curve above.
  const float GOO_STRENGTH_PX = float(5.0);
  const float GOO_RADIUS_PX = float(5.5);
  const float GOO_THRESHOLD = float(0.20);
  const float GOO_SOFTNESS = float(0.05);
  const float GOO_VELOCITY_GAIN = float(0.45);

  float lensLuma(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  float lensLumaAt(vec2 uv) {
    return lensLuma(
      texture2D(uPage, clamp(uv, vec2(0.0), vec2(1.0))).rgb
    );
  }

  // Find narrow, locally dark detail instead of treating every dark field as
  // ink. This catches glyph strokes and hardware contours while leaving flat
  // backgrounds quiet.
  float lensEdgeDetail(vec2 uv) {
    vec2 radius = uTextureTexel * GOO_RADIUS_PX;
    float center = lensLumaAt(uv);
    float left = lensLumaAt(uv - vec2(radius.x, 0.0));
    float right = lensLumaAt(uv + vec2(radius.x, 0.0));
    float below = lensLumaAt(uv - vec2(0.0, radius.y));
    float above = lensLumaAt(uv + vec2(0.0, radius.y));
    float neighbourhood = (left + right + below + above) * 0.25;
    float darkDetail = max(neighbourhood - center, 0.0);
    float contrast = max(
      max(abs(center - left), abs(center - right)),
      max(abs(center - below), abs(center - above))
    );
    return max(darkDetail, contrast * 0.18);
  }

  float gooActivation(float detail) {
    return smoothstep(
      GOO_THRESHOLD - GOO_SOFTNESS,
      GOO_THRESHOLD + GOO_SOFTNESS,
      detail
    );
  }

  void main() {
    if (uHasTexture < 0.5) discard;

    float velocity = clamp(abs(uVelocity) * 0.03, 0.0, 1.0);
    float direction = sign(uVelocity);

    // Depth runs from zero at the lens entry to one at the viewport edge.
    // The direction toggle either reflects source pixels across the entry or
    // lets the underlying page continue through the strip unchanged.
    float depth = 1.0 - vUv.y;
    float transition = smoothstep(0.0, 0.30, depth);
    float shapedDepth =
      MIRROR_LINEAR * depth -
      MIRROR_QUADRATIC * depth * depth +
      MIRROR_CUBIC * depth * depth * depth;
    float contentDirection = MIRROR_EFFECT ? -1.0 : 1.0;

    // The changing derivative makes letterforms swell as they travel through
    // the lens instead of preserving one uniformly scaled silhouette.
    float profile = sin(depth * 3.14159265);
    float boundaryY = uScroll + uViewportHeight - uLensHeight;
    float documentY =
      boundaryY + contentDirection * shapedDepth * uLensHeight;
    documentY +=
      direction * velocity * profile * transition * VELOCITY_SHEAR_PX;

    float textureY = 1.0 - clamp(documentY / uDocumentHeight, 0.0, 1.0);
    // Map each canvas x-position back to the same CSS pixel in the captured
    // document. The gallery uses optimized images while project pages use
    // ordinary content images, so stretching the full capture across the
    // canvas can otherwise make those routes appear to use different lenses.
    // Refraction geometry intentionally changes y only.
    float documentX = uScrollX + vUv.x * uViewportWidth;
    float textureX = clamp(documentX / uDocumentWidth, 0.0, 1.0);
    vec2 sampleUv = vec2(textureX, textureY);

    // Search from this pixel back toward the lens hinge. When a
    // nearby high-contrast edge is found, pull that source pixel down into the
    // band. Weighted taps make narrow strokes grow into smooth, unequal
    // tendrils instead of stretching every x-position by the same amount.
    float gooReachPx =
      GOO_STRENGTH_PX * (1.0 + velocity * GOO_VELOCITY_GAIN);
    float gooTap0 = gooActivation(lensEdgeDetail(sampleUv));
    float gooTap1 = gooActivation(lensEdgeDetail(
      sampleUv + vec2(
        0.0,
        contentDirection * uTextureTexel.y * gooReachPx * 0.20
      )
    ));
    float gooTap2 = gooActivation(lensEdgeDetail(
      sampleUv + vec2(
        0.0,
        contentDirection * uTextureTexel.y * gooReachPx * 0.40
      )
    ));
    float gooTap3 = gooActivation(lensEdgeDetail(
      sampleUv + vec2(
        0.0,
        contentDirection * uTextureTexel.y * gooReachPx * 0.65
      )
    ));
    float gooTap4 = gooActivation(lensEdgeDetail(
      sampleUv + vec2(
        0.0,
        contentDirection * uTextureTexel.y * gooReachPx
      )
    ));
    // A weighted accumulation behaves like a tiny one-dimensional blur. Long
    // vertical strokes activate several taps and travel farther; isolated
    // corners receive only a short, soft pull.
    float gooPull =
      gooTap0 * 0.08 +
      gooTap1 * 0.12 +
      gooTap2 * 0.18 +
      gooTap3 * 0.25 +
      gooTap4 * 0.37;
    gooPull = pow(clamp(gooPull, 0.0, 1.0), 1.35);
    float gooEnvelope = pow(max(profile, 0.0), 0.72) * transition;
    sampleUv.y +=
      contentDirection *
      uTextureTexel.y *
      gooReachPx *
      gooPull *
      gooEnvelope;
    sampleUv = clamp(sampleUv, vec2(0.0), vec2(1.0));

    vec3 base = texture2D(uPage, sampleUv).rgb;
    float left = lensLuma(
      texture2D(uPage, sampleUv - vec2(uTextureTexel.x * 1.5, 0.0)).rgb
    );
    float right = lensLuma(
      texture2D(uPage, sampleUv + vec2(uTextureTexel.x * 1.5, 0.0)).rgb
    );
    float below = lensLuma(
      texture2D(uPage, sampleUv - vec2(0.0, uTextureTexel.y * 1.5)).rgb
    );
    float above = lensLuma(
      texture2D(uPage, sampleUv + vec2(0.0, uTextureTexel.y * 1.5)).rgb
    );

    // Split colour along the local image gradient. Text receives a rainbow
    // fringe around its glyphs, while flat colour fields stay clean and object
    // edges (such as the blue iPhone) refract along their own contour.
    vec2 gradient = vec2(right - left, above - below);
    float gradientLength = length(gradient);
    vec2 gradientMagnitude = abs(gradient);
    vec2 axisWeight = gradientLength > 0.0001
      ? gradientMagnitude / max(gradientMagnitude.x + gradientMagnitude.y, 0.0001)
      : vec2(0.5);
    axisWeight = mix(vec2(0.5), axisWeight, 0.74);
    vec2 chromaOffset = vec2(
      uTextureTexel.x *
        (REST_CHROMA_X_PX + velocity * VELOCITY_CHROMA_X_PX) * axisWeight.x,
      uTextureTexel.y *
        (REST_CHROMA_Y_PX + velocity * VELOCITY_CHROMA_Y_PX) * axisWeight.y
    ) * transition;
    float red = texture2D(uPage, sampleUv + chromaOffset).r;
    float blue = texture2D(uPage, sampleUv - chromaOffset).b;
    vec3 refracted = vec3(red, base.g, blue);
    // Flat fields remain unchanged because all three samples contain the same
    // colour; edge pixels separate naturally without a mask that can suppress
    // thin glyphs or fine hardware contours.
    vec3 color = mix(base, refracted, 0.9 + velocity * 0.1);

    // A very short entry fade hides raster rounding while preserving the exact
    // lens hinge. Keeping this narrow prevents a visible blended band.
    float alpha = smoothstep(0.0, ENTRY_BLEND_DEPTH, depth);
    gl_FragColor = vec4(color, alpha);
  }
`;

function waitForImages(root: HTMLElement) {
  return Promise.all(
    Array.from(root.querySelectorAll("img")).map(async (image) => {
      if (image.complete) return;
      try {
        await image.decode();
      } catch {
        // A failed decorative image should not prevent the lens from starting.
      }
    }),
  );
}

export function SmoothScrollLens() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/keystatic")) return;

    const canvasElement = canvasRef.current;
    const contentElement =
      document.querySelector<HTMLElement>("[data-lens-content]");
    if (!canvasElement || !contentElement) return;

    const canvas: HTMLCanvasElement = canvasElement;
    const content: HTMLElement = contentElement;

    let cancelled = false;
    let captureTimer: number | undefined;
    let removeLenisListener: (() => void) | undefined;
    let cleanup: (() => void) | undefined;

    async function start() {
      const [{ default: Lenis }, THREE, { default: html2canvas }] =
        await Promise.all([
          import("lenis"),
          import("three"),
          import("html2canvas"),
        ]);

      if (cancelled) return;

      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
        respectReducedMotion: true,
        anchors: true,
        prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cleanup = () => lenis.destroy();
        return;
      }

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        });
      } catch {
        cleanup = () => lenis.destroy();
        return;
      }

      renderer.setClearColor(0x000000, 0);
      // The page capture already contains display-space colour. Keep the
      // custom shader in that same space so the glass does not darken neutral
      // backgrounds at its entry edge.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
      camera.position.z = 1;

      const uniforms = {
        uPage: { value: null as InstanceType<typeof THREE.Texture> | null },
        uDocumentWidth: { value: 1 },
        uDocumentHeight: { value: 1 },
        uHasTexture: { value: 0 },
        uLensHeight: { value: 1 },
        uScrollX: { value: window.scrollX },
        uScroll: { value: window.scrollY },
        uTextureTexel: { value: new THREE.Vector2(1, 1) },
        uVelocity: { value: 0 },
        uViewportWidth: { value: window.innerWidth },
        uViewportHeight: { value: window.innerHeight },
      };
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        blending: THREE.NoBlending,
        fragmentShader,
        vertexShader,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(geometry, material));

      let pageTexture: InstanceType<typeof THREE.CanvasTexture> | undefined;

      function render(scroll = lenis.animatedScroll, velocity = 0) {
        uniforms.uScrollX.value = window.scrollX;
        uniforms.uScroll.value = scroll;
        uniforms.uVelocity.value = velocity;
        renderer.render(scene, camera);
      }

      function resizeRenderer() {
        const lensHeight = canvas.getBoundingClientRect().height;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, lensHeight, false);
        uniforms.uLensHeight.value = lensHeight;
        uniforms.uViewportWidth.value = window.innerWidth;
        uniforms.uViewportHeight.value = window.innerHeight;
        render();
      }

      async function capturePage() {
        canvas.dataset.ready = "false";

        await document.fonts.ready;
        await waitForImages(content);
        if (cancelled) return;

        const documentWidth = Math.max(
          content.scrollWidth,
          document.documentElement.scrollWidth,
          window.innerWidth,
        );
        const documentHeight = Math.max(
          content.scrollHeight,
          document.documentElement.scrollHeight,
          window.innerHeight,
        );
        const maxTextureSize = renderer.capabilities.maxTextureSize;
        const captureScale = Math.max(
          0.5,
          Math.min(
            window.devicePixelRatio,
            1.25,
            maxTextureSize / documentWidth,
            maxTextureSize / documentHeight,
          ),
        );

        const pageCanvas = await html2canvas(content, {
          backgroundColor: getComputedStyle(document.body).backgroundColor,
          height: documentHeight,
          scrollX: 0,
          scrollY: 0,
          width: documentWidth,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          scale: captureScale,
          logging: false,
          useCORS: true,
        });

        if (cancelled) return;

        pageTexture?.dispose();
        pageTexture = new THREE.CanvasTexture(pageCanvas);
        pageTexture.colorSpace = THREE.NoColorSpace;
        pageTexture.generateMipmaps = false;
        pageTexture.minFilter = THREE.LinearFilter;
        pageTexture.magFilter = THREE.LinearFilter;
        uniforms.uPage.value = pageTexture;
        uniforms.uDocumentWidth.value = documentWidth;
        uniforms.uDocumentHeight.value = documentHeight;
        uniforms.uTextureTexel.value.set(
          1 / documentWidth,
          1 / documentHeight,
        );
        uniforms.uHasTexture.value = 1;
        canvas.dataset.ready = "true";
        render();
      }

      async function refreshCapture(allowRetry = true) {
        try {
          await capturePage();
        } catch {
          // Animated gradient text can briefly expose a modern CSS colour
          // function that html2canvas cannot parse. Retry after that short
          // entry sweep instead of leaking an error or leaving a dead lens.
          if (!cancelled && allowRetry) {
            window.clearTimeout(captureTimer);
            captureTimer = window.setTimeout(
              () => void refreshCapture(false),
              1_800,
            );
          }
        }
      }

      resizeRenderer();
      removeLenisListener = lenis.on("scroll", (event) => {
        render(event.scroll, event.velocity);
      });

      const onResize = () => {
        resizeRenderer();
        window.clearTimeout(captureTimer);
        captureTimer = window.setTimeout(() => void refreshCapture(), 320);
      };
      window.addEventListener("resize", onResize, { passive: true });

      const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
      const onColorSchemeChange = () => {
        window.clearTimeout(captureTimer);
        captureTimer = window.setTimeout(() => void refreshCapture(), 120);
      };
      colorScheme.addEventListener("change", onColorSchemeChange);

      // Let route and page-entry animations settle before freezing the page
      // into the texture used by the lens.
      captureTimer = window.setTimeout(() => void refreshCapture(), 420);

      cleanup = () => {
        window.clearTimeout(captureTimer);
        window.removeEventListener("resize", onResize);
        colorScheme.removeEventListener("change", onColorSchemeChange);
        removeLenisListener?.();
        lenis.destroy();
        pageTexture?.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }

    void start();

    return () => {
      cancelled = true;
      window.clearTimeout(captureTimer);
      removeLenisListener?.();
      cleanup?.();
      delete canvas.dataset.ready;
    };
  }, [pathname]);

  if (pathname.startsWith("/keystatic")) return null;

  return (
    <canvas
      ref={canvasRef}
      className="scroll-lens"
      data-html2canvas-ignore="true"
      data-ready="false"
      aria-hidden="true"
    />
  );
}
