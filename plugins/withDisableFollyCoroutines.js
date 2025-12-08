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

      let podfileContent = fs.readFileSync(podfilePath, "utf-8");

      // Add post_install hook to disable Folly coroutines
      const postInstallPatch = `
  # Disable Folly coroutines for iOS 26 SDK compatibility
  installer.pods_project.targets.each do |target|
    if target.name == 'RCT-Folly' || target.name == 'RNReanimated' || target.name.include?('Folly')
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAS_COROUTINES=0'
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] ||= ['$(inherited)']
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-DFOLLY_HAS_COROUTINES=0'
      end
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
