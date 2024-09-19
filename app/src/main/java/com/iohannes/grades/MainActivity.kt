package com.iohannes.grades

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

class MainActivity : AppCompatActivity() {

    private lateinit var myWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(this))
        }

        val py = Python.getInstance()
        try {
            Thread {
                val pyModule = py.getModule("server")
                pyModule.callAttr("main")
            }.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        myWebView = findViewById(R.id.webview)
        myWebView.settings.javaScriptEnabled = true
        Thread.sleep(2000) // TODO try not to use this!!!!

        myWebView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {

                view?.loadUrl(url!!)
                return true
            }
        }

        myWebView.loadUrl("http://127.0.0.1:5000/")
    }


    override fun onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}