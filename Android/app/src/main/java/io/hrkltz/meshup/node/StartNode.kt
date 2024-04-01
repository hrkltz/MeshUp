package io.hrkltz.meshup.node

import android.util.Log
import io.hrkltz.meshup.Project


class StartNode : Node {
    // Instance - private
    // Instance - public
    constructor() : super("StartNode", 0, 1) {
        val output0Split = "ScriptNode.0".split(".")
        outputArray[0]!!.nodeId = output0Split[0]
        outputArray[0]!!.inputIndex = output0Split[1].toInt()
    }


    // The StartNode simply sends a true to the connected node.
    override fun worker() {
        Log.i("MeshUp", "StartNode.worker()")
        Project.getInstance().sendData(outputArray[0]!!.nodeId!!, outputArray[0]!!.inputIndex,
            true)
    }
}