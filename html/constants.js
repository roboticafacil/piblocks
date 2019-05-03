'use strict';
/* global Blockly*/
Facilino.locales.initialize();
Facilino.variables = {};
Facilino.isVariable = function(varValue) {
    for (var i in Blockly.Variables.allVariables()) {
        if (Blockly.Variables.allVariables()[i] === varValue) {
            return true;
        }
    }
    if (Facilino.variables[varValue]!==undefined){
        return true;
    }
    if (varValue.search('digitalRead\\(')>=0|| varValue.search('analogRead\\(')>=0){
        return true;
    }
    return false;
};

Facilino.findPinMode=function(dropdown_pin){
    var code='';
    dropdown_pin = dropdown_pin.split(';\n');
    for (var j in dropdown_pin) {
        if (dropdown_pin[j].search('pinMode') >= 0) {
            code += dropdown_pin[j] + ';\n';
        } else {
            dropdown_pin = dropdown_pin[j];
        }
    }
    return {'code':code, 'pin':dropdown_pin};
};