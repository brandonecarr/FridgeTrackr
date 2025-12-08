const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withDisableFollyCoroutines(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      
      // Copy the force-include header to ios directory
      const sourceHeader = path.join(__dirname, "folly-disable-coro.h");
      const destHeader = path.join(
        config.modRequest.platformProjectRoot,
        "folly-disable-coro.h"
      );
      
      if (fs.existsSync(sourceHeader)) {
        fs.copyFileSync(sourceHeader, destHeader);
      } else {
        // Create the header directly if source doesn't exist
        const headerContent = `// Force disable Folly coroutines
#ifdef FOLLY_HAS_COROUTINES
#undef FOLLY_HAS_COROUTINES
#endif
#define FOLLY_HAS_COROUTINES 0
#ifdef __cpp_impl_coroutine
#undef __cpp_impl_coroutine
#endif
#ifdef __cpp_lib_coroutine
#undef __cpp_lib_coroutine
#endif
`;
        fs.writeFileSync(destHeader, headerContent);
      }

      let podfileContent = fs.readFileSync(podfilePath, "utf-8");

      // Use force-include to inject our header BEFORE any other headers
      const postInstallPatch = `
  # Disable Folly coroutines for iOS 26 SDK compatibility
  folly_disable_header = File.join(__dir__, 'folly-disable-coro.h')
  
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |build_config|
      # Force include our header before anything else
      existing_flags = build_config.build_settings['OTHER_CFLAGS'] || '$(inherited)'
      build_config.build_settings['OTHER_CFLAGS'] = "#{existing_flags} -include \\"#{folly_disable_header}\\""
      
      existing_cxx_flags = build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
      build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] = "#{existing_cxx_flags} -include \\"#{folly_disable_header}\\" -DFOLLY_HAS_COROUTINES=0"
      
      # Also add to preprocessor definitions
      existing_defs = build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
      existing_defs = [existing_defs] if existing_defs.is_a?(String)
      existing_defs << 'FOLLY_HAS_COROUTINES=0' unless existing_defs.include?('FOLLY_HAS_COROUTINES=0')
      build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = existing_defs
    end
  end
`;

      // Find the post_install block and add our patch
      if (podfileContent.includes("post_install do |installer|")) {
        podfileContent = podfileContent.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${postInstallPatch}`
        );
      } else {
        // If no post_install exists, add one at the end
        podfileContent += `\npost_install do |installer|${postInstallPatch}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfileContent);

      return config;
    },
  ]);
}

module.exports = withDisableFollyCoroutines;
