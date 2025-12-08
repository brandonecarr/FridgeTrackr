const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * This plugin patches the Podfile to fix:
 * 1. Folly 'folly/coro/Coroutine.h' file not found error with Xcode 16+
 * 2. Reanimated C++ compilation errors with React Native 0.81.5
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
          // The fix code to insert inside post_install
          const follyFixCode = `
    # Fix for Folly coroutines with Xcode 16+ and Reanimated C++ issues with RN 0.81
    installer.pods_project.targets.each do |target|
      if target.name == 'RCT-Folly' || target.name == 'folly' || target.name.start_with?('Folly')
        target.build_configurations.each do |build_config|
          build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_COROUTINES=0'
          build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
      end
      
      # Fix for RNReanimated C++ compilation with RN 0.81.5
      if target.name == 'RNReanimated'
        target.build_configurations.each do |build_config|
          # Suppress the 'override hides virtual member function' error
          build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] ||= ['$(inherited)']
          build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-error=inconsistent-missing-override'
          build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-inconsistent-missing-override'
          build_config.build_settings['GCC_WARN_ABOUT_MISSING_NEWLINE'] = 'NO'
        end
      end
    end`;

          // Look for the post_install block with react_native_post_install
          if (podfile.includes("react_native_post_install(installer)")) {
            // Insert after react_native_post_install
            podfile = podfile.replace(
              /react_native_post_install\(installer\)/,
              `react_native_post_install(installer)${follyFixCode}`
            );
          } else if (podfile.includes("post_install do |installer|")) {
            // Insert right after post_install do |installer|
            podfile = podfile.replace(
              /post_install do \|installer\|/,
              `post_install do |installer|${follyFixCode}`
            );
          }
          
          fs.writeFileSync(podfilePath, podfile);
          console.log("[withFollyFix] Successfully patched Podfile with Folly and Reanimated fixes");
        } else {
          console.log("[withFollyFix] Fixes already applied, skipping");
        }
      }
      
      return config;
    },
  ]);
};

module.exports = withFollyFix;
