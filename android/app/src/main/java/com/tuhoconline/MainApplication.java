package com.tuhoconline;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.github.yamill.orientation.OrientationPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.wheelpicker.WheelPickerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.imagepicker.ImagePickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNCWebViewPackage(),
            new SplashScreenReactPackage(),
            new RNFirebasePackage(),
            new OrientationPackage(),
            new AsyncStoragePackage(),
            new RNGestureHandlerPackage(),
            new RNFetchBlobPackage(),
            new WheelPickerPackage(),
            new VectorIconsPackage(),
            new ImagePickerPackage(),
            new RNFirebaseNotificationsPackage() ,
            new RNFirebaseMessagingPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
