import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を読み込む
  const env = loadEnv(mode, process.cwd(), '');
  
  // 環境変数が正しく読み込まれているか確認
  const githubToken = env.VITE_GITHUB_ACCESS_TOKEN || env.VITE_PUBLIC_GITHUB_ACCESS_TOKEN;
  
  console.log('Environment variables loaded:', {
    hasToken: !!githubToken,
    tokenPrefix: githubToken ? 
      `${githubToken.substring(0, 4)}...${githubToken.slice(-4)}` : 
      'No token found',
    availableVars: Object.keys(env).filter(key => key.includes('GITHUB') || key.includes('VITE_'))
  });
  
  // トークンが設定されていない場合は警告を表示
  if (!githubToken) {
    console.warn('GitHub token is not set. Please set VITE_GITHUB_ACCESS_TOKEN in your .env file.');
  }
  
  // 環境変数をログに出力（デバッグ用）
  console.log('Environment variables:', {
    mode,
    nodeEnv: process.env.NODE_ENV,
    hasToken: !!env.VITE_GITHUB_ACCESS_TOKEN || !!env.VITE_PUBLIC_GITHUB_ACCESS_TOKEN,
  });

  const isProduction = mode === 'production';
  
  return {
    // ベースパスを修正
    base: '/',
    // 環境変数の設定
    define: {
      'import.meta.env.VITE_GITHUB_ACCESS_TOKEN': JSON.stringify(env.VITE_GITHUB_ACCESS_TOKEN || ''),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': isProduction,
      'import.meta.env.DEV': !isProduction,
      'import.meta.env.BASE_URL': JSON.stringify('/'),
    },
    // ビルド設定
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
          // アセットのファイル名を設定
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          // JavaScriptファイルのファイル名を設定
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          // モジュール形式を設定
          format: 'esm',
          // グローバル変数の設定
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-router-dom': 'ReactRouterDOM'
          }
        },
      },
      // ビルドの最適化設定
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // チャンクサイズの警告を無効化
      chunkSizeWarningLimit: 1000,
      // モジュールの出力形式を設定
      target: 'esnext',
      // モジュールの解決方法を設定
      modulePreload: {
        polyfill: true
      }
    },
    server: {
      host: "::",
      port: 8080,
      // APIリクエストをプロキシ
      proxy: {
        '/api': {
          target: 'https://api.github.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'Authorization': githubToken ? `token ${githubToken}` : '',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'publicode-search-app',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          configure: (proxy, _options) => {
            // リクエストヘッダーが正しく設定されているか確認するためのログ
            proxy.on('proxyReq', (proxyReq) => {
              console.log('Proxying request to:', proxyReq.path);
              console.log('Request headers:', proxyReq.getHeaders());
            });
            
            // エラーハンドリング
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
              }
              res.end(JSON.stringify({
                error: 'Proxy error',
                details: err.message
              }));
            });
          }
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // 環境変数のプレフィックスを設定
    envPrefix: 'VITE_',
  };
});

