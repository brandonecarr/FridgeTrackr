#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Running EAS pre-install hook to fix Folly coroutines issue..."

PODFILE_PATH="ios/Podfile"

if [ -f "$PODFILE_PATH" ]; then
  echo "📝 Patching Podfile to disable Folly coroutines..."
  
  # Check if already patched
  if grep -q "FOLLY_HAVE_COROUTINES" "$PODFILE_PATH"; then
    echo "✅ Podfile already patched, skipping..."
  else
    # Create the fix to insert
    cat >> "$PODFILE_PATH" << 'EOF'

# Fix for Folly coroutines with Xcode 16+ and RNReanimated
post_install do |installer|
  installer.pods_project.targets.each do |target|
    # Disable Folly coroutines
    if target.name == 'RCT-Folly' || target.name == 'folly' || target.name.start_with?('Folly') || target.name == 'ReactCommon'
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_COROUTINES=0'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
      end
    end
    
    # Fix RNReanimated C++ compilation
    if target.name == 'RNReanimated'
      target.build_configurations.each do |config|
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] ||= ['$(inherited)']
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-error=inconsistent-missing-override'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_COROUTINES=0'
      end
    end
  end
end
EOF
    
    echo "✅ Podfile patched successfully!"
  fi
else
  echo "⚠️  Podfile not found at $PODFILE_PATH"
fi

echo "✅ Pre-install hook completed!"
