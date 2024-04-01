package io.hrkltz.meshup.node

import io.hrkltz.meshup.item.InputItem
import io.hrkltz.meshup.item.OutputItem


open class Node {
    // Instance - private
    // Instance - public
    var id: String = ""
    var inputArray = emptyArray<InputItem?>()
    var outputArray = emptyArray<OutputItem?>()
    var contentJson: String = ""


    constructor(id: String, inputCount: Int, outputCount: Int) {
        this.id = id
        inputArray = Array(inputCount) { InputItem() }
        outputArray = Array(outputCount) { OutputItem() }
    }


    open fun worker() = Unit
}