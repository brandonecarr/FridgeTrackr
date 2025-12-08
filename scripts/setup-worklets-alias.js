const fs = require('fs');
const path = require('path');

// Create a symlink/alias from react-native-worklets to react-native-worklets-core
const nodeModules = path.join(__dirname, '..', 'node_modules');
const targetPath = path.join(nodeModules, 'react-native-worklets');
const sourcePath = path.join(nodeModules, 'react-native-worklets-core');

// Check if source exists
if (!fs.existsSync(sourcePath)) {
  console.log('react-native-worklets-core not found, skipping alias setup');
  process.exit(0);
}

// Remove existing if it exists
if (fs.existsSync(targetPath)) {
  try {
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink() || stats.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  } catch (e) {
    // Ignore errors
  }
}

// Create the alias directory with package.json pointing to worklets-core
try {
  fs.mkdirSync(targetPath, { recursive: true });
  
  // Create package.json that redirects to worklets-core
  const packageJson = {
    name: "react-native-worklets",
    version: "1.0.0",
    main: require.resolve('react-native-worklets-core').replace(nodeModules + path.sep, '').replace('react-native-worklets-core' + path.sep, ''),
  };
  
  // Copy the entire worklets-core content
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    fs.mkdirSync(dest, { recursive: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(sourcePath, targetPath);
  
  // Update the package.json name
  const pkgPath = path.join(targetPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.name = 'react-native-worklets';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }
  
  console.log('Successfully created react-native-worklets alias');
} catch (error) {
  console.error('Failed to create worklets alias:', error.message);
  process.exit(1);
}
