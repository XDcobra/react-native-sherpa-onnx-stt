require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "SherpaOnnxStt"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/XDcobra/react-native-sherpa-onnx-stt.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"
  
  # Include sherpa-onnx headers
  s.public_header_files = "ios/include/**/*.h"
  
  # Link with required frameworks and libraries
  s.frameworks = 'Foundation'
  s.libraries = 'c++'
  
  # sherpa-onnx XCFramework integration
  framework_path = File.join(__dir__, 'ios', 'Frameworks', 'sherpa_onnx.xcframework')
  
  unless File.exist?(framework_path)
    raise <<~MSG
      SherpaOnnxStt: Required XCFramework 'ios/Frameworks/sherpa_onnx.xcframework' was not found.

      Make sure the sherpa_onnx.xcframework is bundled with the npm package or added to:
        #{File.join(__dir__, 'ios', 'Frameworks')}

      You can obtain the framework by:
      1. Downloading from GitHub Actions workflow artifacts
      2. Building it yourself using the build-sherpa-onnx-framework.yml workflow
    MSG
  end
  
  # Preserve the XCFramework and xcconfig files
  s.preserve_paths = [
    'ios/Frameworks/sherpa_onnx.xcframework/**/*',
    'ios/SherpaOnnxStt.xcconfig'
  ]
  
  # Use xcconfig file for conditional library linking
  # This handles device vs simulator builds correctly at build time (not pod install time)
  s.xcconfig = { 'PODS_TARGET_SRCROOT' => '${PODS_TARGET_SRCROOT}' }
  
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'HEADER_SEARCH_PATHS' => '$(inherited) "$(PODS_TARGET_SRCROOT)/ios/include"',
    # Include our xcconfig file for conditional linker settings
    # Note: We include the xcconfig content directly since podspec doesn't support #include
    # Device builds
    'SHERPA_ONNX_LIB_DIR[sdk=iphoneos*]' => '$(PODS_TARGET_SRCROOT)/ios/Frameworks/sherpa_onnx.xcframework/ios-arm64',
    # Simulator builds
    'SHERPA_ONNX_LIB_DIR[sdk=iphonesimulator*]' => '$(PODS_TARGET_SRCROOT)/ios/Frameworks/sherpa_onnx.xcframework/ios-arm64_x86_64-simulator',
    # Library search path (uses the conditional SHERPA_ONNX_LIB_DIR)
    'LIBRARY_SEARCH_PATHS' => '$(inherited) "$(SHERPA_ONNX_LIB_DIR)"',
    # Force load the static library
    'OTHER_LDFLAGS' => '$(inherited) -force_load "$(SHERPA_ONNX_LIB_DIR)/libsherpa-onnx.a"'
  }
  
  s.user_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++'
  }

  install_modules_dependencies(s)
end
