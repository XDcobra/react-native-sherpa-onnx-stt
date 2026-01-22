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
  s.header_search_paths = [
    "$(PODS_TARGET_SRCROOT)/ios/include"
  ]
  
  # C++ standard
  s.xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++'
  }
  
  # Link with required frameworks
  s.frameworks = 'Foundation'
  s.libraries = 'c++'
  
  # sherpa-onnx framework integration
  # Automatically use pre-built XCFramework if available (bundled in npm package)
  framework_path = File.join(__dir__, 'ios', 'Frameworks', 'sherpa_onnx.xcframework')
  if File.exist?(framework_path)
    s.vendored_frameworks = 'ios/Frameworks/sherpa_onnx.xcframework'
    s.preserve_paths = 'ios/Frameworks/sherpa_onnx.xcframework/**/*'
  else
    # If framework is not found, provide helpful error message
    s.pod_target_xcconfig = {
      'OTHER_LDFLAGS' => '-Wl,-framework,sherpa_onnx',
      'HEADER_SEARCH_PATHS' => '$(inherited) "$(PODS_TARGET_SRCROOT)/ios/include"'
    }
    s.post_install do |installer|
      installer.pods_project.targets.each do |target|
        if target.name == 'SherpaOnnxStt'
          target.build_configurations.each do |config|
            config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
            config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'SHERPA_ONNX_FRAMEWORK_NOT_FOUND=1'
          end
        end
      end
    end
  end

  install_modules_dependencies(s)
end
