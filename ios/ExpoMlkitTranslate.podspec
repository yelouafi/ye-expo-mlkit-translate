require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoMlkitTranslate'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = { :ios => '15.5', :tvos => '15.5' }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/yelouafi/ye-expo-mlkit-translate' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleMLKit/Translate', '~> 8.0.0'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
