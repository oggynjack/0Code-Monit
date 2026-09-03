/**
 * Builds static Go binaries for 0Code-Monit push notifications.
 * Repository: https://github.com/oggynjack/0Code-Monit
 *
 * Usage:
 *   node build.js                    # Build all targets
 *   node build.js linux amd64        # Build single target
 *   node build.js windows amd64      # Windows build
 *   node build.js linux arm          # ARM build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const targets = [
    { os: 'linux',   arch: 'amd64', ext: '' },
    { os: 'linux',   arch: 'arm64', ext: '' },
    { os: 'linux',   arch: 'arm',   ext: '' },
    { os: 'windows', arch: 'amd64', ext: '.exe' },
    { os: 'darwin',  arch: 'amd64', ext: '' },
    { os: 'darwin',  arch: 'arm64', ext: '' },
];

const goSrcDir = path.join(__dirname, 'go-src');

function build(target) {
    const outDir     = path.join(__dirname, 'build');
    const targetDir  = path.join(outDir, `${target.os}-${target.arch}`);
    const binaryName = `0code-push${target.ext}`;
    const outputPath = path.join(targetDir, binaryName);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    console.log(`Building 0code-push for ${target.os}/${target.arch}...`);

    try {
        execSync(
            `go build -ldflags="-s -w" -o "${outputPath}" .`,
            {
                cwd: goSrcDir,
                stdio: 'inherit',
                env: {
                    ...process.env,
                    GOOS:  target.os,
                    GOARCH: target.arch,
                },
            }
        );
        console.log(`  ✓ ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
    } catch (err) {
        console.error(`  ✗ Build failed for ${target.os}/${target.arch}`);
        throw err;
    }
}

function buildAll() {
    console.log('==> Building 0code-push for all targets...\n');
    for (const target of targets) {
        try {
            build(target);
        } catch (err) {
            console.error(`\nSkipping ${target.os}/${target.arch} due to build error.\n`);
        }
    }
    console.log('\n==> Build complete! Binaries in: ./build/');
}

const args = process.argv.slice(2);
if (args.length >= 2) {
    const [goos, goarch] = args;
    const ext = args[2] || (goos === 'windows' ? '.exe' : '');
    build({ os: goos, arch: goarch, ext }).catch(() => process.exit(1));
} else {
    buildAll();
}
