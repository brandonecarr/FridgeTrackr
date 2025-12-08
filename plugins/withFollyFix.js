const { withDangerousMod, withPlugins } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * This plugin patches Folly to fix the 'folly/coro/Coroutine.h' file not found error
 * that occurs with Xcode 16+ and react-native-reanimated.
 * 
 * It works by patching the Podfile post-install to modify Folly's build settings.
 */
const withFollyFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, "utf-8");
        
        // Check if our fix is already applied
        if (!podfile.includes("FOLLY_HAVE_COROUTINES")) {
          // Find the post_install block and add our fix
          const postInstallFix = `
    # Fix for Folly coroutines with Xcode 16+
    installer.pods_project.targets.each do |target|
      if target.name == 'RCT-Folly' || target.name == 'folly' || target.name.start_with?('Folly')
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_COROUTINES=0'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
      end
      # Also fix for RNReanimated which uses Folly
      if target.name == 'RNReanimated'
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_COROUTINES=0'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
      end
    end
`;
          
          // Insert before the last 'end' of post_install
          if (podfile.includes("post_install do |installer|")) {
            // Find the post_install block and add our code before the final end
            podfile = podfile.replace(
              /(post_install do \|installer\|[\s\S]*?)(^end)/m,
              `$1${postInstallFix}\n$2`
            );
          } else {
            // Add a new post_install block at the end
            podfile += `
post_install do |installer|
${postInstallFix}
end
`;
          }
          
          fs.writeFileSync(podfilePath, podfile);
        }
      }
      
      return config;
    },
  ]);
};

module.exports = withFollyFix;
