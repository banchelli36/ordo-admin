#!/usr/bin/env bash
npm i
ionic cordova platform add ios
sed -i '' "1s/^/FRAMEWORK_SEARCH_PATHS = \"..\/..\/libs\/ios\"/" platforms/ios/cordova/build.xcconfig

mkdir libs
mkdir libs/ios
mkdir www/rtr_assets

#download license and apk from https://rtrsdk.com/
#copy ios apk to libs/ios
#copy license file and content of assets folder to www/rtr_assets

#ionic cordova run android
