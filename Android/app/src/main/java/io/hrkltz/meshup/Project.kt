package io.hrkltz.meshup

import android.util.Log
import io.hrkltz.meshup.node.Node
import io.hrkltz.meshup.node.ScriptNode
import io.hrkltz.meshup.node.StartNode


class Project {
    companion object {
        // The @Volatile annotation makes the instance property is atomic.
        @Volatile
        private var instance: Project? = null


        // The synchronized keyword prevents accessing the method from multiple threads
        // simultaneously.
        fun getInstance() =
            instance ?: synchronized(this) { instance ?: Project().also { instance = it } }
    }

    // Instance - private
    private var nodeMap = mutableMapOf<String, Node>()


    // Instance - public
    fun init() {
        val startNode: Node = StartNode()
        nodeMap.put(startNode.id, startNode)
        val scriptNode: Node = ScriptNode()
        nodeMap.put(scriptNode.id, scriptNode)
    }


    fun start() {
        Log.i("MeshUp", "Project.start()")
        nodeMap.filter { it.value is StartNode }.forEach { it.value.worker() }
    }


    fun sendData(nodeId: String, outputIndex: Int, data: Any?) {
        Log.i("MeshUp", "Project.sendData($nodeId, $outputIndex, $data)")
        nodeMap[nodeId]!!.inputArray[outputIndex]!!.data = data

        if (nodeMap[nodeId]!!.inputArray[outputIndex]!!.mode == "Active") {
            nodeMap[nodeId]!!.worker()
        }
    }
}