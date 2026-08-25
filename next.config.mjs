/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep pdfjs-dist external on the server so its runtime worker resolution is
  // not rewritten into a Next.js chunk path that disappears on Vercel.
  serverExternalPackages: ["pdfjs-dist"],

  // pdfjs-dist loads pdf.worker.mjs through a runtime variable in Node. Vercel's
  // file tracer cannot infer that dynamic import, so explicitly include the
  // package for the PDF extraction route.
  outputFileTracingIncludes: {
    "/api/pdf/extract": ["./node_modules/pdfjs-dist/**/*"],
  },
};

export default nextConfig;
