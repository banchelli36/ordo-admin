#!/usr/bin/env bash
npm i
ionic cordova platform add android
sed -i "1s/^/allprojects {repositories {flatDir {dirs '..\/..\/..\/libs\/android'}}}/" platforms/android/build.gradle

mkdir libs
mkdir libs/android
mkdir www/rtr_assets

#download license and apk from https://rtrsdk.com/
#copy android apk to libs/android
#copy license file and content of assets folder to www/rtr_assets

#ionic cordova run android
