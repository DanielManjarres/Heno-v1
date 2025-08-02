package com.ecocomercialapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  // Nombre del componente principal registrado desde JavaScript
  override fun getMainComponentName(): String = "EcoComercialApp"

  // Delegate que permite usar la nueva arquitectura (si está habilitada)
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // NECESARIO para que el módulo react-native-gesture-handler funcione correctamente
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
