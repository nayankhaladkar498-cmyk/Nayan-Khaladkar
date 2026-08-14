package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null
  private var filePathCallback: ValueCallback<Array<Uri>>? = null

  private val fileChooserLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    if (filePathCallback != null) {
      val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
      filePathCallback?.onReceiveValue(results)
      filePathCallback = null
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val insets = ViewCompat.getRootWindowInsets(window.decorView)
        val isImeVisible = insets?.isVisible(WindowInsetsCompat.Type.ime()) == true

        if (isImeVisible) {
          WindowInsetsControllerCompat(window, window.decorView).hide(WindowInsetsCompat.Type.ime())
          return
        }

        val wv = webView
        if (wv != null && wv.canGoBack()) {
          wv.goBack()
        } else {
          isEnabled = false
          finishAfterTransition()
        }
      }
    })

    setContent {
      MyApplicationTheme {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .systemBarsPadding()
        ) {
          EventSetuWebViewContainer(
            onWebViewCreated = { wv -> webView = wv },
            onOpenFileChooser = { callback, fileChooserParams ->
              filePathCallback?.onReceiveValue(null)
              filePathCallback = callback
              try {
                val intent = fileChooserParams.createIntent()
                fileChooserLauncher.launch(intent)
              } catch (e: Exception) {
                filePathCallback = null
              }
            }
          )
        }
      }
    }
  }

  override fun onResume() {
    super.onResume()
    webView?.onResume()
  }

  override fun onPause() {
    val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
    imm?.hideSoftInputFromWindow(currentFocus?.windowToken ?: window.decorView.windowToken, 0)
    webView?.clearFocus()
    webView?.onPause()
    super.onPause()
  }

  override fun onDestroy() {
    webView?.stopLoading()
    webView?.clearFocus()
    webView?.destroy()
    webView = null
    super.onDestroy()
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EventSetuWebViewContainer(
  onWebViewCreated: (WebView) -> Unit,
  onOpenFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams) -> Unit
) {
  AndroidView(
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )

        setBackgroundColor(0xFF0F172A.toInt())
        scrollBarStyle = View.SCROLLBARS_INSIDE_OVERLAY
        isFocusable = true
        isFocusableInTouchMode = true
        setLayerType(View.LAYER_TYPE_HARDWARE, null)

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          loadWithOverviewMode = true
          useWideViewPort = true
          setSupportZoom(false)
          displayZoomControls = false
          mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
          cacheMode = WebSettings.LOAD_DEFAULT
          safeBrowsingEnabled = false
          mediaPlaybackRequiresUserGesture = false
          offscreenPreRaster = true
        }

        webViewClient = object : WebViewClient() {
          override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val url = request?.url?.toString() ?: return false
            if (url.startsWith("upi:") || url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
              try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                context.startActivity(intent)
                return true
              } catch (e: Exception) {
                Log.w("EventSetu", "Could not open external app for url: $url", e)
              }
            }
            return false
          }

          override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
          ) {
            super.onReceivedError(view, request, error)
            Log.w("EventSetu", "WebView Error: ${error?.description} for ${request?.url}")
          }

          override fun onRenderProcessGone(
            view: WebView?,
            detail: RenderProcessGoneDetail?
          ): Boolean {
            Log.e("EventSetu", "WebView render process gone. Crashed: ${detail?.didCrash()}")
            return true
          }
        }

        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            if (consoleMessage != null) {
              Log.d("EventSetuJS", "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}")
            }
            return true
          }

          override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
          ): Boolean {
            if (filePathCallback != null && fileChooserParams != null) {
              onOpenFileChooser(filePathCallback, fileChooserParams)
              return true
            }
            return false
          }
        }

        loadUrl("file:///android_asset/www/index.html")
        onWebViewCreated(this)
      }
    },
    modifier = Modifier.fillMaxSize()
  )
}

