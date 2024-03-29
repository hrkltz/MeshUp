package io.hrkltz.meshup

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.javascriptengine.JavaScriptIsolate
import androidx.javascriptengine.JavaScriptSandbox
import androidx.lifecycle.lifecycleScope
import com.google.common.util.concurrent.FutureCallback
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import io.hrkltz.meshup.ui.theme.MeshUpTheme
import kotlinx.coroutines.guava.await
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import java.util.logging.Logger

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MeshUpTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Greeting("Android")
                    /*Button(onClick = {
                        if (!JavaScriptSandbox.isSupported()) {
                            Log.d("MeshUp", "Not supported!")
                            return@Button
                        }

                        Log.d("MeshUp", "Supported!")

                        val jsSandboxFuture: ListenableFuture<JavaScriptSandbox> = JavaScriptSandbox.createConnectedInstanceAsync(baseContext)
                        val jsIsolate: JavaScriptIsolate = jsSandboxFuture.get().createIsolate()
                        val resultFuture: ListenableFuture<String> = jsIsolate.evaluateJavaScriptAsync(code)
                        val result: String = resultFuture.get(5, TimeUnit.SECONDS)
                        //Log.d("MeshUp", result)
                    }) {
                        Text(text = "Click Me!")
                    }*/
                    Button(onClick = {
                        // Launch a coroutine
                        lifecycleScope.launch {
                            val jsSandbox = JavaScriptSandbox
                                .createConnectedInstanceAsync(applicationContext)
                                .await()
                            val jsIsolate = jsSandbox.createIsolate()
                            /*jsIsolate.provideNamedData("data-1", byteArrayOf(5))
                            final String jsCode = "android.consumeNamedDataAsArrayBuffer('data-1').then((value) => { return String.fromCharCode.apply(null, new Uint8Array(value)); });";*/
                            val code = "function sum(a, b) { let r = a + b; return r.toString(); }; sum(3, 5)"
                            val resultFuture = jsIsolate.evaluateJavaScriptAsync(code)
                            Log.d("MeshUp", "Result: " + resultFuture.await())
                            /*// Await the result
                            textBox.text = resultFuture.await()
                            // Or add a callback
                            Futures.addCallback<String>(
                                resultFuture, object : FutureCallback<String?> {
                                    override fun onSuccess(result: String?) {
                                        textBox.text = result
                                    }
                                    override fun onFailure(t: Throwable) {
                                        // Handle errors
                                    }
                                },
                                mainExecutor
                            )*/
                        }
                    }) {
                        Text(text = "Click Me!!")
                    }
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MeshUpTheme {
        Greeting("Android")
    }
}