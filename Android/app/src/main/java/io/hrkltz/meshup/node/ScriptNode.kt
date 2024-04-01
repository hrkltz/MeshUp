package io.hrkltz.meshup.node

import android.util.Log
import com.caoccao.javet.interception.logging.JavetStandardConsoleInterceptor
import com.caoccao.javet.interop.V8Host
import com.caoccao.javet.interop.V8Runtime
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json


class ScriptNode: Node {
    // Instance - private
    @Serializable
    private data class Content(var code: String = "")
    private var content: Content


    // Instance - public
    constructor() : super("ScriptNode", 1, 1) {
        inputArray[0]!!.mode = "Active"
        //val output0Split = "ScriptNode.0".split(".")
        //outputArray[0]!!.nodeId = output0Split[0]
        //outputArray[0]!!.inputIndex = output0Split[1].toInt()
        contentJson = "{\"code\":\"console.log('Hello ' + input + '!');\"}"
        content = Json.decodeFromString<Content>(contentJson)
    }


    override fun worker() {
        Log.i("MeshUp", "ScriptNode.worker()")
        // lifecycleScope.launch { ?
        V8Host.getV8Instance().createV8Runtime<V8Runtime>().use {
            // Link console.log(..) to Log.i(..).
            JavetStandardConsoleInterceptor(it).register(it.globalObject)

            // Add InputPort value to the JS instance.
            // TODO: Switch based on object type.
            val v8Object: Any = when (inputArray[0]!!.data) {
                is String -> it.createV8ValueString(inputArray[0]!!.data as String)
                is Boolean -> it.createV8ValueBooleanObject(inputArray[0]!!.data as Boolean)
                is Int -> it.createV8ValueIntegerObject(inputArray[0]!!.data as Int)
                is Double -> it.createV8ValueDoubleObject(inputArray[0]!!.data as Double)
                // TODO: Support Array and Map.
                else -> it.createV8ValueObject().bind(inputArray[0]!!.data)
            }

            it.globalObject.set("input", v8Object)
            // TODO: Link setOutput or similar named function to JS.
            it.getExecutor(content.code).executeVoid()
            // Delete the interceptor.
            it.globalObject.delete("input")
            // Unregister console.
            JavetStandardConsoleInterceptor(it).unregister(it.globalObject)
            // Notify V8 to perform GC. (Optional)
            it.lowMemoryNotification()
        }
    }
}