const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;

// Explicitly pin react-native-css-interop and nativewind for Bun isolated
// workspaces on EAS Build Linux workers so Metro always resolves
// "react-native-css-interop/jsx-runtime" deterministically.
const resolvePackageDir = (pkgName) => {
  const candidates = [
    path.resolve(projectRoot, "node_modules", pkgName),
    path.resolve(monorepoRoot, "node_modules", pkgName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.realpathSync(candidate);
    }
  }
  return candidates[0];
};

const cssInteropDir = resolvePackageDir("react-native-css-interop");
const nativewindDir = resolvePackageDir("nativewind");

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "react-native-css-interop": cssInteropDir,
  nativewind: nativewindDir,
};

const nativeWindConfig = withNativeWind(config, { input: "./app/global.css" });

const prevResolveRequest = nativeWindConfig.resolver.resolveRequest;
nativeWindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native-css-interop/jsx-runtime" ||
    moduleName === "react-native-css-interop/jsx-dev-runtime"
  ) {
    const subpath = moduleName.endsWith("jsx-dev-runtime")
      ? path.join(cssInteropDir, "dist", "runtime", "jsx-dev-runtime.js")
      : path.join(cssInteropDir, "dist", "runtime", "jsx-runtime.js");
    if (fs.existsSync(subpath)) {
      return {
        filePath: subpath,
        type: "sourceFile",
      };
    }
  }
  if (prevResolveRequest) {
    return prevResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = nativeWindConfig;
