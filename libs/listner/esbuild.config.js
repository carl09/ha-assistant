const { dtsPlugin } = require('esbuild-plugin-d.ts');

require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js',
    bundle: true,
    platform: 'neutral',
    external: ['axios'],
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error);
        else console.log('watch build succeeded:', result);
      },
    },
    plugins: [dtsPlugin()],
  })
  .then((result) => {
    console.log('watching...');
  });
