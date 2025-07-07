import { defineConfig } from 'vite';
// @ts-ignore
import { dirname, resolve } from 'node:path';
// @ts-ignore
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'InklingCompiler',
            fileName: 'index'
        }
    }
})