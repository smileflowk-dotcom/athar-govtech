# PDF extraction on Vercel

## Failure observed

Production `/api/pdf/extract` failed before reading the uploaded document with:

`Setting up fake worker failed: Cannot find module '/var/task/.next/server/chunks/pdf.worker.mjs'`

The uploaded PDF was not the cause. Next.js bundled `pdfjs-dist` into a server chunk, while PDF.js still resolves `pdf.worker.mjs` dynamically at runtime. Vercel's file tracer could not infer that dynamic worker import, so the worker file was absent from the function bundle.

## Fix

`next.config.mjs` now:

- keeps `pdfjs-dist` external on the server with `serverExternalPackages`;
- explicitly traces `node_modules/pdfjs-dist/**/*` for `/api/pdf/extract` with `outputFileTracingIncludes`.

The standard ATHAR CI build asserts that the generated route trace contains `pdf.worker.mjs`, preventing this packaging regression from returning unnoticed.
