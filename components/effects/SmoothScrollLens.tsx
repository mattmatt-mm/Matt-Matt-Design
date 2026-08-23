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
  uniform float uApproachHeight;
  uniform float uLensHeight;
  uniform float uScrollX;
  uniform float uScroll;
  uniform vec2 uTextureTexel;
  uniform vec2 uHalfTexel;
  uniform float uVelocity;
  uniform float uViewportWidth;
  uniform float uCanvasTop;

  varying vec2 vUv;

  // Lens tuning ------------------------------------------------------------
  // Setting this true reflects content across the horizon instead of letting
  // it travel in the page's own scrolling direction.
  const bool MIRROR_EFFECT = false;

  // The lens is two bands meeting at the horizon, and a letterform passes
  // through both. Above the horizon it runs from untouched to elongated; below
  // it, from elongated on to compressed. These are vertical sampling rates in
  // document pixels per screen pixel: below 1 the content is stretched, above
  // 1 it is squeezed. Starting the approach band at exactly 1 is what lets the
  // canvas meet the page with nothing happening at all, so there is no edge at
  // which the effect switches on.
  const float NORMAL_RATE = float(1.0);
  const float ENTRY_RATE = float(0.62);
  const float EXIT_RATE = float(1.38);

  // How each band eases between its two rates. At 0 the change is spread
  // linearly across the band; at 1 it is a full S-curve that both leaves and
  // arrives flat, so the effect never starts or stops on a single scanline and
  // the two bands meet with matching slope at the horizon.
  const float EASE_CURVE = float(1.0);

  // Chromatic split is present at rest, then grows with scroll velocity.
  const float REST_CHROMA_X_PX = float(1.0);
  const float VELOCITY_CHROMA_X_PX = float(2.4);
  const float REST_CHROMA_Y_PX = float(1.8);
  const float VELOCITY_CHROMA_Y_PX = float(3.6);
  const float VELOCITY_SHEAR_PX = float(8.0);

  // Glass takes light apart along a spectrum rather than into two opposed
  // channels, so the split is walked in steps and each step weighted by where
  // it falls in that spectrum: red and orange leading, blue and violet
  // trailing. The weights are normalised per channel, which is what keeps a
  // flat field exactly the colour it already was — every step there samples
  // the same pixel, so it can only sum back to itself. Colour appears on
  // edges, where the steps genuinely disagree.
  // Depth of field. Nothing is softened at the horizon, where the strip has to
  // meet the page exactly; it builds only as content travels away, so the blur
  // reads as distance rather than as a lens that cannot hold focus.
  const float DEPTH_BLUR_PX = float(1.6);

  // Residual sub-pixel trim, in document pixels, if a particular display still
  // lands the strip a hair off the page. Negative moves the sampling left.
  const float SAMPLE_NUDGE_X_PX = float(0.0);

  const int DISPERSION_TAPS = 9;
  const float DISPERSION_VIOLET = float(0.42);
  const float DISPERSION_MIX = float(0.95);

  // Local edge displacement. These controls create liquid tendrils without
  // changing the global mirror curve above.
  const float GOO_STRENGTH_PX = float(5.0);
  const float GOO_RADIUS_PX = float(5.5);
  // Shapes the goo on top of the shared envelope. Above 1 it pulls the liquid
  // in tighter around the horizon.
  const float GOO_FALLOFF = float(1.4);
  const float GOO_THRESHOLD = float(0.20);
  const float GOO_SOFTNESS = float(0.05);
  const float GOO_VELOCITY_GAIN = float(0.45);

  // Eased progress through a band, and the area under that easing. The area is
  // what turns a rate curve into a position: integrating it in closed form is
  // what keeps the two bands one continuous piece of geometry rather than two
  // strips that happen to touch.
  float lensEase(float p) {
    return mix(p, p * p * (3.0 - 2.0 * p), EASE_CURVE);
  }

  float lensEaseArea(float p) {
    float linearArea = 0.5 * p * p;
    float easedArea = p * p * p - 0.5 * p * p * p * p;
    return mix(linearArea, easedArea, EASE_CURVE);
  }

  // Document pixels covered after travelling p of the way through a band
  // whose sampling rate eases from rateA to rateB.
  float lensSpan(float p, float rateA, float rateB) {
    return rateA * p + (rateB - rateA) * lensEaseArea(p);
  }

  vec3 dispersionWeight(float t) {
    float warm = smoothstep(0.70, 0.0, t);
    float violet = smoothstep(0.52, 1.0, t);
    float core = exp(-pow((t - 0.42) * 2.9, 2.0));
    // Red carries a violet tail as well, so the far end reads as purple rather
    // than a flat blue, and red over the warm core gives the orange.
    return vec3(warm + DISPERSION_VIOLET * violet, core, violet);
  }

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

    // Distance travelled down the canvas, in screen pixels. The approach band
    // occupies the first uApproachHeight of it and the horizon is where the
    // two bands meet.
    float canvasHeight = uApproachHeight + uLensHeight;
    float fromTop = (1.0 - vUv.y) * canvasHeight;
    float approach = clamp(uApproachHeight, 0.0, canvasHeight);
    float approachProgress =
      approach > 0.0 ? clamp(fromTop / approach, 0.0, 1.0) : 1.0;
    float depthProgress = uLensHeight > 0.0
      ? clamp((fromTop - approach) / uLensHeight, 0.0, 1.0)
      : 0.0;
    float contentDirection = MIRROR_EFFECT ? -1.0 : 1.0;

    // Both bands accumulate into one offset, so a letterform crossing the
    // horizon carries its own stretch through rather than restarting.
    float documentOffset =
      approach * lensSpan(approachProgress, NORMAL_RATE, ENTRY_RATE) +
      uLensHeight * lensSpan(depthProgress, ENTRY_RATE, EXIT_RATE);

    // How much lens is acting here: nothing where the canvas meets the
    // untouched page, everything at the horizon, easing away again toward the
    // screen edge. Multiplying the two eased bands gives that in one
    // expression, because each sits at 1 while the other is doing the work.
    float lensAmount =
      lensEase(approachProgress) * (1.0 - lensEase(depthProgress));

    // Shear from scroll velocity peaks mid-canvas and falls to nothing at both
    // ends, so motion never disturbs either join.
    float profile = sin((fromTop / max(canvasHeight, 1.0)) * 3.14159265);
    float canvasTopY = uScroll + uCanvasTop;
    float documentY = canvasTopY + contentDirection * documentOffset;
    documentY += direction * velocity * profile * VELOCITY_SHEAR_PX;

    // Land on the centre of the captured pixel, not its top-left corner. Half
    // a texel of drift is enough to read as the strip sitting a pixel off the
    // page it continues.
    float textureY =
      1.0 - clamp(documentY / uDocumentHeight, 0.0, 1.0) - uHalfTexel.y;
    // Map each canvas x-position back to the same CSS pixel in the captured
    // document. The gallery uses optimized images while project pages use
    // ordinary content images, so stretching the full capture across the
    // canvas can otherwise make those routes appear to use different lenses.
    // Refraction geometry intentionally changes y only.
    float documentX = uScrollX + vUv.x * uViewportWidth;
    float textureX =
      clamp(documentX / uDocumentWidth, 0.0, 1.0) +
      uHalfTexel.x +
      SAMPLE_NUDGE_X_PX * uTextureTexel.x;
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
    // Goo follows the same envelope: it builds through the approach band, is
    // heaviest at the horizon, and thins out below it.
    float gooEnvelope = pow(clamp(lensAmount, 0.0, 1.0), GOO_FALLOFF);
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
    ) * lensAmount;
    // Four taps on a diagonal cross, widening with depth below the horizon.
    float blurPx = DEPTH_BLUR_PX * depthProgress * depthProgress;
    vec2 blur = uTextureTexel * blurPx;
    vec3 softened =
      texture2D(uPage, clamp(sampleUv + blur, vec2(0.0), vec2(1.0))).rgb +
      texture2D(uPage, clamp(sampleUv - blur, vec2(0.0), vec2(1.0))).rgb +
      texture2D(uPage, clamp(sampleUv + vec2(blur.x, -blur.y), vec2(0.0), vec2(1.0))).rgb +
      texture2D(uPage, clamp(sampleUv - vec2(blur.x, -blur.y), vec2(0.0), vec2(1.0))).rgb;
    base = mix(base, softened * 0.25, clamp(blurPx, 0.0, 1.0));

    vec3 dispersed = vec3(0.0);
    vec3 weightSum = vec3(0.0);
    for (int i = 0; i < DISPERSION_TAPS; i++) {
      float t = float(i) / float(DISPERSION_TAPS - 1);
      vec3 weight = dispersionWeight(t);
      vec2 spread = mix(-chromaOffset, chromaOffset, t);
      dispersed +=
        texture2D(uPage, clamp(sampleUv + spread, vec2(0.0), vec2(1.0))).rgb *
        weight;
      weightSum += weight;
    }
    dispersed /= max(weightSum, vec3(0.0001));
    vec3 color = mix(base, dispersed, DISPERSION_MIX);

    // Opaque throughout. The canvas samples the page exactly where the two
    // meet, so there is nothing to fade against — and an alpha ramp here would
    // show the page's own copy of a line under the displaced one, which is the
    // pale doubled band this replaced.
    gl_FragColor = vec4(color, 1.0);
  }
`;

// An image the viewport has not reached yet never settles `decode()`, so a
// bare await here stalls the whole capture until something scrolls it into
// view. html2canvas reloads every image eagerly inside its own clone, so this
// wait is only about letting work already in flight finish.
const IMAGE_SETTLE_MS = 1_500;

// The strip has to resolve as finely as the page it continues, so both the
// capture and the strip run at the device ratio. The area cap is what keeps a
// nineteen-image case study from asking for a canvas the browser refuses.
const MAX_PIXEL_RATIO = 2;
const MAX_CAPTURE_PIXELS = 26_000_000;

function waitForImages(root: HTMLElement) {
  return Promise.all(
    Array.from(root.querySelectorAll("img")).map((image) => {
      if (image.complete) return;
      return Promise.race([
        // A failed decorative image should not prevent the lens from starting.
        image.decode().catch(() => undefined),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, IMAGE_SETTLE_MS);
        }),
      ]);
    }),
  );
}

// Rendering through the browser means the page is rasterised inside an SVG
// <foreignObject>, and that cannot reach out to fetch anything: an <img> still
// pointing at a URL simply renders as nothing. html2canvas' own `inlineImages`
// only ever covers <canvas>, so fold each bitmap into the markup here.
//
// Drawing from the element also sidesteps a second problem. html2canvas' other
// path sizes an image from `naturalWidth`, which the browser reports after
// dividing out the density descriptor of the srcset candidate it chose, then
// paints the raw bitmap — so on a 2x screen every next/image was captured as
// its top-left quarter blown up. drawImage takes the whole source by default,
// so the descriptor never enters into it.
const INLINE_IMAGE_QUALITY = 0.92;

function inlineClonedImages(
  clonedRoot: HTMLElement,
  scale: number,
  backdrop: string,
) {
  const clonedDocument = clonedRoot.ownerDocument;

  for (const image of Array.from(clonedRoot.querySelectorAll("img"))) {
    if (image.src.startsWith("data:")) continue;
    if (!image.complete || !image.naturalWidth) continue;

    const box = image.getBoundingClientRect();
    const width = Math.round(box.width * scale);
    const height = Math.round(box.height * scale);
    if (width < 1 || height < 1) continue;

    const frame = clonedDocument.createElement("canvas");
    frame.width = width;
    frame.height = height;
    const context = frame.getContext("2d");
    if (!context) continue;

    try {
      // Flatten onto the page's own backdrop rather than keeping an alpha
      // channel. It is what shows through the image on the page anyway, and it
      // lets these encode as JPEG — a case study runs to nineteen images, and
      // lossless ones would put tens of megabytes of base64 into one SVG.
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      image.src = frame.toDataURL("image/jpeg", INLINE_IMAGE_QUALITY);
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
    } catch {
      // A tainted canvas leaves the image as it was; one missing picture is
      // better than losing the whole capture.
    }
  }
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
        uApproachHeight: { value: 0 },
        uLensHeight: { value: 1 },
        uScrollX: { value: window.scrollX },
        uScroll: { value: window.scrollY },
        uTextureTexel: { value: new THREE.Vector2(1, 1) },
        uHalfTexel: { value: new THREE.Vector2(0, 0) },
        uVelocity: { value: 0 },
        uViewportWidth: { value: window.innerWidth },
        uCanvasTop: { value: 0 },
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

      function render(velocity = 0) {
        uniforms.uScrollX.value = window.scrollX;
        // The lens entry must sample the exact document pixel currently
        // touching the viewport edge. Lenis' animatedScroll can temporarily
        // describe a different position from the browser's painted scroll,
        // which makes image details repeat inside the lens instead of joining
        // continuously at its hinge.
        uniforms.uScroll.value = window.scrollY;
        uniforms.uVelocity.value = velocity;
        renderer.render(scene, camera);
      }

      function resizeRenderer() {
        // Every measurement comes from the canvas' own box. It is laid out in
        // the layout viewport, so a classic scrollbar makes it narrower and
        // shorter than window.innerWidth/innerHeight — and mapping the strip
        // across the window instead slid the refraction sideways from the page
        // it is supposed to continue.
        const rect = canvas.getBoundingClientRect();
        const canvasHeight = rect.height;
        // The canvas spans both bands. Only the part below the horizon is the
        // lens proper; the rest is the approach that eases the effect in, and
        // the shader needs to know where the two meet.
        const belowHorizon = Number.parseFloat(
          getComputedStyle(canvas).getPropertyValue("--scroll-lens-height"),
        );
        const lensHeight = Number.isFinite(belowHorizon)
          ? Math.min(belowHorizon, canvasHeight)
          : canvasHeight;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
        renderer.setSize(rect.width, canvasHeight, false);
        uniforms.uApproachHeight.value = Math.max(canvasHeight - lensHeight, 0);
        uniforms.uLensHeight.value = lensHeight;
        uniforms.uViewportWidth.value = rect.width;
        uniforms.uCanvasTop.value = rect.top;
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
          document.documentElement.clientWidth,
        );
        const documentHeight = Math.max(
          content.scrollHeight,
          document.documentElement.scrollHeight,
          document.documentElement.clientHeight,
        );
        const maxTextureSize = renderer.capabilities.maxTextureSize;
        // Capture at the device's own resolution. Sampling a 1.25x texture into
        // a 2x strip is what made the refracted text read soft against the
        // crisp page around it — the lens was showing upscaled pixels, not
        // glass. Long pages fall back rather than asking for a canvas no
        // browser will allocate.
        const areaLimit = Math.sqrt(
          MAX_CAPTURE_PIXELS / (documentWidth * documentHeight),
        );
        const captureScale = Math.max(
          0.75,
          Math.min(
            window.devicePixelRatio,
            MAX_PIXEL_RATIO,
            areaLimit,
            maxTextureSize / documentWidth,
            maxTextureSize / documentHeight,
          ),
        );

        const backdrop = getComputedStyle(document.body).backgroundColor;
        const pageCanvas = await html2canvas(content, {
          backgroundColor: backdrop,
          height: documentHeight,
          scrollX: 0,
          scrollY: 0,
          width: documentWidth,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          scale: captureScale,
          logging: false,
          useCORS: true,
          // Rasterise through the browser instead of html2canvas' own CSS
          // re-implementation. That JS path lays text out itself and put every
          // 16px/21px line about 6px below where the page paints it, so the
          // strip redrew a line the page had already drawn and the seam showed
          // it twice. The browser cannot disagree with itself about where its
          // own text sits.
          foreignObjectRendering: true,
          onclone: (_clonedDocument, clonedRoot) =>
            inlineClonedImages(clonedRoot, captureScale, backdrop),
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
        uniforms.uHalfTexel.value.set(
          0.5 / (documentWidth * captureScale),
          0.5 / (documentHeight * captureScale),
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
        render(event.velocity);
      });
      // Next.js and the browser can restore or reset scroll without going
      // through Lenis (same-route navigation, back/forward cache, scrollbar
      // dragging). Keep the texture origin synchronized for those paths too.
      const onNativeScroll = () => render(uniforms.uVelocity.value);
      window.addEventListener("scroll", onNativeScroll, { passive: true });

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
        window.removeEventListener("scroll", onNativeScroll);
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
