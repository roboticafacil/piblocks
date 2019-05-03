/*All rights reserved Robótica Fácil*/

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'blockly', 'blockly.blocks'], factory);
    } else {
        factory(_, window.Blockly, window.Blocks);
    }
}(function(_, Blockly, Blocks) {
    var load = function(options) {
        //PiBlocks={};
		PiBlocks.Python={};
		PiBlocks.Blocks={};
		PiBlocks.NumMelodies=0;

		PiBlocks.getStates = function() {
			states = [];
			for (var x=0;x<PiBlocks.NumStates;x++)
				states.push(x);
			return states;
		}

		PiBlocks.locales = {
			defaultLanguage: {},
			hardware: ''
		};

		PiBlocks.locales.setLang = function(lang) {
			this.defaultLanguage = lang;
		}
		PiBlocks.locales.getKey = function(key) {
			if (this.defaultLanguage[key]===undefined)
				console.log(key);
			return this.defaultLanguage[key] || this.EngLanguage[key];
		};

		PiBlocks.locales.setKey = function(key,value) {
			this.defaultLanguage[key]=value;
		};

		PiBlocks.locales.initialize = function() {
			this.defaultLanguage = options.langKeys ||window.langKeys || {};
			this.EngLanguage = window.langKeysEng;
			//console.log(this.defaultLanguage);
			this.hardware = options.proc || window.PiBlocksHardware;
			return this;
		};

		PiBlocks.locales.initialize();
		PiBlocks.variables = {};
		PiBlocks.isVariable = function(varValue) {
			for (var i in Blockly.Variables.allUsedVariables) {
				if (Blockly.Variables.allUsedVariables[i] === varValue) {
					return true;
				}
			}
			if (PiBlocks.variables[varValue] !== undefined) {
				return true;
			}
			return false;
		};

		PiBlocks.increaseIndent = function(str){
			str = str.replace(/^(?=.)/gm, new Array(2).join('\t'));
			return str;
		}

		PiBlocks.decreaseIndent = function(str){
			str = str.split('\n');
			for(var i = 0; i < str.length; i++){
				var line = str[i];
				line = line.replace('\t','');
				str[i] = line;
			}
			str = str.join("\n");
			return str;
		}

		PiBlocks.findPinMode = function(dropdown_pin) {
			var code = '';
			dropdown_pin = dropdown_pin.split(';\n');
			for (var j in dropdown_pin) {
				if (dropdown_pin[j].search('pinMode') >= 0) {
					code += dropdown_pin[j] + ';\n';
				} else {
					dropdown_pin = dropdown_pin[j];
				}
			}
			return {
				'code': code,
				'pin': dropdown_pin
			};
		};
		
		PiBlocks.rgb2hsv = function(rgb) {
			var rr, gg, bb;
			r = rgb[0]/255;
			g = rgb[1]/255;
			b = rgb[2]/255;
			v = Math.max(r, g, b);
			diff = v - Math.min(r, g, b);
			diffc = function(c){
				return (v - c) / 6 / diff + 1 / 2;
			};

			if (diff == 0) {
				h = s = 0;
			} else {
				s = diff / v;
				rr = diffc(r);
				gg = diffc(g);
				bb = diffc(b);

				if (r === v) {
					h = bb - gg;
				}else if (g === v) {
					h = (1 / 3) + rr - bb;
				}else if (b === v) {
					h = (2 / 3) + gg - rr;
				}
				if (h < 0) {
					h += 1;
				}else if (h > 1) {
					h -= 1;
				}
			}
			return [Math.round(h * 360),Math.round(s * 100),Math.round(v * 100)];
}

		PiBlocks.hexToRgb = function(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		};
			
		PiBlocks.pad = function(str,padString,length) {
			while (str.length < length)
				str = padString + str;
			return str;
		}

		var profiles;
		$.ajax({
				url: 'profiles.json',
				dataType: "text",
				async: false,
				}).done(function(text) {
				profiles = $.parseJSON(text);
				if (PiBlocks.locales.hardware==='RaspberryPi3B+')
					profiles['default'] = profiles.raspberryPi3Bp;
				else if (PiBlocks.locales.hardware==='RaspberryPiZeroW')
					profiles['default'] = profiles.raspberryPiZeroW;
				else 
					profiles['default'] = profiles.raspberryPi3Bp;
				});
			
		// RGB block colors
		PiBlocks.LANG_COLOUR_DISTANCE = '#D04141';
		PiBlocks.LANG_COLOUR_SOUND = '#CC7B44';
		PiBlocks.LANG_COLOUR_MOVEMENT = '#CECE42';
		PiBlocks.LANG_COLOUR_SCREEN = '#ACCE42';
		PiBlocks.LANG_COLOUR_CONTROL = '#44CC44';
		PiBlocks.LANG_COLOUR_LOGIC = '#42CE91';
		PiBlocks.LANG_COLOUR_MATH = '#42CBCE';
		PiBlocks.LANG_COLOUR_LIST = '#99CCFF';
		PiBlocks.LANG_COLOUR_TEXT = '#42A3CE';
		PiBlocks.LANG_COLOUR_COMMUNICATION = '#4263CE';
		PiBlocks.LANG_COLOUR_ADVANCED = '#9142CE';
		PiBlocks.LANG_COLOUR_VARIABLES = '#B244CC';
		PiBlocks.LANG_COLOUR_PROCEDURES = '#CE42B3';
		PiBlocks.LANG_COLOUR_LIGHT= '#FF8A00';
		PiBlocks.LANG_COLOUR_DEPRECATED = '#000000';

		Blockly.getBlocks = function() {

			var blocks = { };

			for (var block in this.Blocks) {
				// important check that this is objects own property 
				// not from prototype prop inherited
				if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object) {
					var category = this.Blocks[block].category;
					var subcategory = this.Blocks[block].subcategory;
					var colour = this.Blocks[block].category_colour;
					if (subcategory===undefined)
						subcategory='root';
					blocks[category] = blocks[category] || { };
					blocks[category][subcategory] = blocks[category][subcategory] || [];
					blocks[category][subcategory].push(block);
				}
			}
			return blocks;
		};

		Blockly.createToolbox = function() {

			var blocks = { };
			var colours = { };

			for (var block in this.Blocks) {
				// important check that this is objects own property 
				// not from prototype prop inherited
				if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object && this.Blocks[block].category) {
					var category = this.Blocks[block].category;
					var subcategory = this.Blocks[block].subcategory;
					var colour = this.Blocks[block].category_colour;
					var subsubcategory = this.Blocks[block].subsubcategory;
					if (subcategory===undefined)
						subcategory='root';
					if (subsubcategory===undefined)
						subsubcategory='root';
					blocks[category] = blocks[category] || { };
					colours[category] = colours[category] || colour;
					blocks[category][subcategory] = blocks[category][subcategory] || [];
					blocks[category][subcategory][subsubcategory] = blocks[category][subcategory][subsubcategory] || [];
					blocks[category][subcategory][subsubcategory].push(block);
				}
			}

			var toolbox = '<xml id="toolbox" style="display: none">';

			var categoryItem = function(type) {
				toolbox += '<block type="' + type + '"></block>';
			};

			for (category in blocks) {
				if (blocks.hasOwnProperty(category)) {
					toolbox += '<category id="' + category + '" name="' + category + '" colour="'+colours[category]+'">';
					for (subcategory in blocks[category]) {
						if (subcategory==='root')
							blocks[category]['root']['root'].forEach(categoryItem);
						if (subcategory!=='root'){
							//console.log(blocks);
							toolbox += '<category id="' + subcategory + '" name="' + subcategory + '" colour="'+this.Blocks[blocks[category][subcategory]['root'][0]].colour+'">';
							for (subsubcategory in blocks[category][subcategory])
							{
								if (subsubcategory==='root')
								{
									blocks[category][subcategory]['root'].forEach(categoryItem);
								}
								if (subsubcategory!=='root')
								{
									toolbox += '<category id="' + subsubcategory + '" name="' + subsubcategory + '" colour="'+this.Blocks[blocks[category][subcategory][subsubcategory][0]].colour+'">';
									blocks[category][subcategory][subsubcategory].forEach(categoryItem);
									toolbox += '</category>';
								}
							}
							toolbox += '</category>';
						}
					}
					toolbox += '</category>';
				}

			}
			toolbox += '</xml>';

			return toolbox;
		};

		Blockly.createToolboxColours = function() {

			var blocks = {};

			for (var block in this.Blocks) {
				if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object && this.Blocks[block].category) {
					var category = this.Blocks[block].category;
					blocks[category] = blocks[category] || [];
					if (this.Blocks[block].colour !== undefined)
					{
						blocks[category].push(this.Blocks[block].colour);
					}
				}
			}
			return blocks;
		};

		this["JST"] = this["JST"] || {};
		
		
		this["JST"]["inout_digital_write"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'digitalWrite(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (dropdown_stat)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };


        this["JST"]["inout_digital_read"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'digitalRead(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["inout_digital_read_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',INPUT);\n';

            }
            return __p
        };

        this["JST"]["inout_digital_write_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',OUTPUT);\n';

            }
            return __p
        };

        this["JST"]["procedures_defnoreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'def '+((__t = (funcName)) == null ? '' : __t)+'(' +((__t = (args)) == null ? '' : __t) +'):\n'+((__t = (branch)) == null ? '' : __t)+'\n';
            }
            return __p
        };

        this["JST"]["procedures_defreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    'def '+((__t = (funcName)) == null ? '' : __t)+'(' +((__t = (args)) == null ? '' : __t)+'):\n'+((__t = (branch)) == null ? '' : __t)+'\n'+PiBlocks.increaseIndent('return '+((__t = (returnValue)) == null ? '' : __t))+'\n';
            }
            return __p
        };

        this["JST"]["serial_available"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'if (Serial.available()>0){\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    '\n}\n';

            }
            return __p
        };

        this["JST"]["serial_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'Serial.begin(' +
                    ((__t = (bitrate)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };


        this["JST"]["text_equalsIgnoreCase"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (string1)) == null ? '' : __t) +
                    '.equalsIgnoreCase(' +
                    ((__t = (string2)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["text_length"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.length()';

            }
            return __p
        };
		
		this["JST"]["text_lower"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.toLowerCase()';

            }
            return __p
        };
		
		this["JST"]["text_upper"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.toUpperCase()';

            }
            return __p
        };

        this["JST"]["text_substring"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (string1)) == null ? '' : __t) +
                    '.substring(' +
                    ((__t = (from)) == null ? '' : __t) +
                    ',' +
                    ((__t = (to)) == null ? '' : __t) +
                    ')';
            }
            return __p
        };

		this["JST"]["pinmode_setups_dout"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'pinMode(' +
						((__t = (cs_pin)) == null ? '' : __t) +
						',OUTPUT);';
				}
				return __p
			};

		this["JST"]["pinmode_setups_din"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'pinMode(' +
						((__t = (din_pin)) == null ? '' : __t) +
						',OUTPUT);';
				}
				return __p
			};
		
		this["JST"]["one_wire_definitions_readTempC"] = function (obj) {
		obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'float readTempC()\n{\n tempSensor'+((__t = (pin)) == null ? '' : __t)+'.requestTemperatures();\n return tempSensor'+((__t = (pin)) == null ? '' : __t)+'.getTempCByIndex(0);\n}\n';
				}
				return __p	
		}

		this["JST"]["distance_us"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'distance(' +
						((__t = (trigger_pin)) == null ? '' : __t) +
						',' +
						((__t = (echo_pin)) == null ? '' : __t) +
						')';

				}
				return __p
			};

		this["JST"]["distance_us_collision"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'if (distance(' +
						((__t = (trigger_pin)) == null ? '' : __t) +
						',' +
						((__t = (echo_pin)) == null ? '' : __t) +
						')<(' +
				((__t = (distance)) == null ? '' : __t) +
				')){\n' +
				((__t = (collision)) == null ? '' : __t) +
				'\n}\nelse\n{\n' +
				((__t = (not_collision)) == null ? '' : __t) +
				'}';
				}
				return __p
			};

		this["JST"]["distance_us_definitions_include"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += '#include <wiring_private.h>\n#include <pins_arduino.h>\n';
				}
				return __p
			};


		this["JST"]["distance_us_definitions_pulseIn"] = function (obj) {
		obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'unsigned long _pulseIn(uint8_t pin, uint8_t state, unsigned long timeout)\n{\n  uint8_t bit = digitalPinToBitMask(pin);\n  uint8_t port = digitalPinToPort(pin);\n  uint8_t stateMask = (state ? bit : 0);\n  unsigned long width = 0;\n  unsigned long numloops = 0;\n  unsigned long maxloops = microsecondsToClockCycles(timeout) / 16;\n  while ((*portInputRegister(port) & bit) == stateMask)\n    if (numloops++ == maxloops)\n      return 0;\n  while ((*portInputRegister(port) & bit) != stateMask)\n    if (numloops++ == maxloops)\n      return 0;\n  while ((*portInputRegister(port) & bit) == stateMask) {\n    if (numloops++ == maxloops)\n      return 0;\n    width++;\n  }\n  return clockCyclesToMicroseconds(width * 21 + 16);\n}\n';

				}
				return __p	
		};

        this["JST"]["distance_us_definitions_distance"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'long distance(int trigger_pin, int echo_pin)\n{\n  long microseconds = US_init(trigger_pin, echo_pin);\n  long distance;\n  distance = microseconds/29/2;\n  if (distance == 0){\n    distance = 999;\n  }\n  return distance;\n}\n';

            }
            return __p
        };

        this["JST"]["distance_us_definitions_us_init"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += 'long US_init(int trigger_pin, int echo_pin)\n{\n  digitalWrite(trigger_pin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigger_pin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigger_pin, LOW);\n  long microseconds = _pulseIn(echo_pin ,HIGH,100000);\n  return microseconds;\n}\n';
            }
            return __p
        };

        this["JST"]["distance_us_setups_echo"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (echo_pin)) == null ? '' : __t) +
                    ',INPUT);';
            }
            return __p
        };

        this["JST"]["distance_us_setups_trigger"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (trigger_pin)) == null ? '' : __t) +
                    ',OUTPUT);';
            }
            return __p
        };

		this["JST"]["music_definitions_play_melody"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += 'void playMelody(int pin,const uint16_t* melody, int length)\n{\n  unsigned int note;\n  unsigned long duration;\n  uint16_t* melody_ptr=(uint16_t*)melody;\n  for (int i=0;i<length;i++)\n  {\n    note=*melody_ptr++;\n    duration=*melody_ptr++;\n    tone(pin,note,duration);\n    delay(duration);\n    noTone(pin);\n  }\n}\n';
				}
				return __p
			};


		this["JST"]["softwareserial_def_definitions"] = function(obj) {
				obj || (obj = {});
				var __t, __p = '',
					__e = _.escape;
				with(obj) {
					__p += '#include <SoftwareSerial.h>';

				}
				return __p
			};

        this["JST"]["bt_softwareserial_def_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += '  _bt_softwareSerial.begin(' +
                    ((__t = (baud_rate)) == null ? '' : __t) +
                    ');\n  _bt_softwareSerial.flush();\n';
            }
            return __p
        };
		
        var JST = this.JST;

/*var indentSentences = function(sentences) {
	var splitted_sentences = sentences.split('\n');
	var final_sentences = '';
	for (var i in splitted_sentences) {
		final_sentences += '  ' + splitted_sentences[i] + '\n';
	}
	return final_sentences;
};*/   
		
Blockly.Blocks.procedures_defnoreturn = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_PROCEDURES'),
	category_colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_PROCEDURES_DEFNORETURN_TOOLTIP'],
	init: function() {    	
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		var name = new Blockly.FieldTextInput('',Blockly.Procedures.rename);
		name.setSpellcheck(false);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(PiBlocks.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE')).appendField(name,'NAME').appendField('', 'PARAMS');
		this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
		/*if ((this.workspace.options.comments || (this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) && Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT) {
			this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);
		}*/
		this.setTooltip(PiBlocks.locales.getKey('LANG_PROCEDURES_DEFNORETURN_TOOLTIP'));
		this.arguments_ = [];
		this.type_arguments_ = [];
		this.setStatements_(true);
		this.setInputsInline(false);
	},
	setStatements_: function(hasStatements) {
		if (this.hasStatements_ === hasStatements) {
		  return;
		}
		if (hasStatements) {
		  this.appendStatementInput('STACK').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setCheck(['code','function']);
		  if (this.getInput('RETURN')) {
			this.moveInputBefore('STACK', 'RETURN');
		  }
		} else {
		  this.removeInput('STACK', true);
		}
		this.hasStatements_ = hasStatements;
	},
	updateParams_: function() {
		var badArg = false;
		var hash = {};
		for (var i = 0; i < this.arguments_.length; i++) {
		  if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
			badArg = true;
			break;
		  }
		  hash['arg_' + this.arguments_[i].toLowerCase()] = true;
		}
		if (badArg) {
		  this.setWarningText('Duplicate argument');
		} else {
		  this.setWarningText(null);
		}
		var params = [];
		for (var i in this.arguments_) {
			try{
			params.push(this.arguments_[i]);
			}
			catch(e)
			{
			}
		}
		this.paramString = params.join(', ');
		Blockly.Events.disable();
		try {
		  this.setFieldValue(this.paramString, 'PARAMS');
		} finally {
		  Blockly.Events.enable();
		}
	},  
	mutationToDom: function(opt_paramIds) {
		var container = document.createElement('mutation');
		if (opt_paramIds) {
		  container.setAttribute('name', this.getFieldValue('NAME'));
		}
		for (var i = 0; i < this.arguments_.length; i++) {
		  var parameter = document.createElement('arg_name');
		  parameter.setAttribute('name', this.arguments_[i]);
		  if (opt_paramIds && this.paramIds_) {
			parameter.setAttribute('paramId', this.paramIds_[i]);
		  }
		  container.appendChild(parameter);
		  
		  /*parameter = document.createElement('arg_type');
		  try{
			  parameter.setAttribute('name', this.type_arguments_[i]);
			  if (opt_paramIds && this.paramIds_) {
				parameter.setAttribute('paramId', this.paramIds_[i]);
			  }
		  }
		  catch(e)
		  {
		  }
		  container.appendChild(parameter);*/
		}
		if (!this.hasStatements_) {
		  container.setAttribute('statements', 'false');
		}
		return container;
	},  
	domToMutation: function(xmlElement) {
		this.arguments_ = [];
		for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
		  if (childNode.nodeName.toLowerCase() === 'arg_name') {
			this.arguments_.push(childNode.getAttribute('name'));
		  }
		  /*if (childNode.nodeName.toLowerCase() === 'arg_type') {
			  try{
			this.type_arguments_.push(childNode.getAttribute('name'));
			  }
			  catch(e)
			  {
			  }
		  }*/
		}
		this.updateParams_();
		Blockly.Procedures.mutateCallers(this);
		this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
	},  
	decompose: function(workspace) {
		var containerBlock = workspace.newBlock('procedures_mutatorcontainer');
		containerBlock.initSvg();
		if (this.getInput('RETURN')) {
		  containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE','STATEMENTS');
		} else {
		  containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
		}
		var connection = containerBlock.getInput('STACK').connection;
		for (var i = 0; i < this.arguments_.length; i++) {
		  var paramBlock = workspace.newBlock('procedures_mutatorarg');
		  paramBlock.initSvg();
		  //paramBlock.setFieldValue(this.type_arguments_[i], 'TYPE');
		  paramBlock.setFieldValue(this.arguments_[i], 'NAME');
		  paramBlock.oldLocation = i;
		  connection.connect(paramBlock.previousConnection);
		  connection = paramBlock.nextConnection;
		}
		Blockly.Procedures.mutateCallers(this);
		return containerBlock;
	},    
	compose: function(containerBlock) {
		this.arguments_ = [];
		this.type_arguments_ = [];
		this.paramIds_ = [];
		var paramBlock = containerBlock.getInputTargetBlock('STACK');
		while (paramBlock) {
		  this.arguments_.push(paramBlock.getFieldValue('NAME'));
		  //this.type_arguments_.push(paramBlock.getFieldValue('TYPE'));
		  this.paramIds_.push(paramBlock.id);
		  paramBlock = paramBlock.nextConnection &&
			  paramBlock.nextConnection.targetBlock();
		}
		this.updateParams_();
		Blockly.Procedures.mutateCallers(this);
		var hasStatements = containerBlock.getFieldValue('STATEMENTS');
		if (hasStatements !== null) {
		  hasStatements = hasStatements == 'TRUE';
		  if (this.hasStatements_ != hasStatements) {
			if (hasStatements) {
			  this.setStatements_(true);
			  Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
			  this.statementConnection_ = null;
			} else {
			  var stackConnection = this.getInput('STACK').connection;
			  this.statementConnection_ = stackConnection.targetConnection;
			  if (this.statementConnection_) {
				var stackBlock = stackConnection.targetBlock();
				stackBlock.unplug();
				stackBlock.bumpNeighbours_();
			  }
			  this.setStatements_(false);
			}
		  }
		}
	},
	getProcedureDef: function() {
		return [this.getFieldValue('NAME'), this.arguments_, false];
	},
	getVars: function() {
		return this.arguments_;
	},
	renameVar: function(oldName, newName) {
		var change = false;
		for (var i = 0; i < this.arguments_.length; i++) {
		  if (Blockly.Names.equals(oldName, this.arguments_[i])) {
			this.arguments_[i] = newName;
			change = true;
		  }
		}
		if (change) {
		  this.updateParams_();
		  if (this.mutator.isVisible()) {
			var blocks = this.mutator.workspace_.getAllBlocks();
			for (var i = 0, block; block = blocks[i]; i++) {
			  if (block.type == 'procedures_mutatorarg' &&
				  Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
				block.setFieldValue(newName, 'NAME');
			  }
			}
		  }
		}
	},
	validName: function(name) {
		if (name && name.length > 0) {
			var i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			name = name.replace(/([ ])/g, '_');
			name = name.replace(/([áàâä])/g, 'a');
			name = name.replace(/([éèêë])/g, 'e');
			name = name.replace(/([íìîï])/g, 'i');
			name = name.replace(/([óòôö])/g, 'o');
			name = name.replace(/([úùûü])/g, 'u');
			name = name.replace(/([ñ])/g, 'n');
			name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
			i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			for (var j in Blockly.Python.RESERVED_WORDS_) {
				this.reserved_words = Blockly.Python.RESERVED_WORDS_.split(',');
				if (name === this.reserved_words[j]) {
					this.setWarningText('Reserved word');
					name = '';
					break;
				} else {
					this.setWarningText(null);
				}
			}
		}
		return name;
	},
	callType_: 'procedures_callnoreturn',
	onchange: function() {
		if (this.last_procedure !== this.getFieldValue('NAME')) {
			var name = this.getFieldValue('NAME');
			name = this.validName(name);
			try {
				this.setFieldValue(name, 'NAME');
			} catch (e) {}
			this.last_procedure = name;
		}
	}
};
			
Blockly.Blocks['procedures_mutatorcontainer'] = {
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_PROCEDURES_MUTATORCONTAINER_Field'],
	init: function() {
		this.appendDummyInput().appendField(PiBlocks.locales.getKey('LANG_PROCEDURES_MUTATORCONTAINER_Field'));
		this.appendStatementInput('STACK').setCheck(['code','function']);
		this.appendDummyInput('STATEMENT_INPUT').appendField(Blockly.Msg.PROCEDURES_ALLOW_STATEMENTS).appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		this.setTooltip('');
		this.contextMenu = false;
	}
};
	
Blockly.Blocks['procedures_mutatorarg'] = {
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_VARIABLES_TYPE_NUMBER','LANG_VARIABLES_TYPE_STRING'],
	init: function() {
		var field = new Blockly.FieldTextInput('x', this.validator_);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/box_in.svg',20*options.zoom,20*options.zoom)).appendField(field, 'NAME');
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		this.setTooltip('');
		this.contextMenu = false;
		field.onFinishEditing_ = this.createNewVar_;
		field.onFinishEditing_('x');
	},
	onchange: function() {
		if (this.last_variable !== this.getFieldValue('NAME')) {
			var name = this.getFieldValue('NAME');
			name = this.validName(name);
			try {
				this.setFieldValue(name, 'NAME');
			} catch (e) {}
			this.last_variable = name;
		}
	},
	validName: Blockly.Blocks.procedures_defnoreturn.validName,
	validator_: function(newVar) {
		newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
		return newVar || null;
	},
	createNewVar_: function(newText) {
		var source = this.sourceBlock_;
		if (source && source.workspace && source.workspace.options &&
			source.workspace.options.parentWorkspace) {
		  source.workspace.options.parentWorkspace.createVariable(newText);
		}
	}
};

Blockly.Python.procedures_defnoreturn = function() {
	var funcName = this.getFieldValue('NAME');
	var branch = Blockly.Python.statementToCode(this, 'STACK');
	branch = branch.replace(/&quot;/g, '"');
	if (Blockly.Python.INFINITE_LOOP_TRAP) {
		branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
	}
	var args = this.paramString;
	var code = JST['procedures_defnoreturn']({'funcName': funcName,'args': args,'branch': branch
	});
	code = Blockly.Python.scrub_(this, code);
	Blockly.Python.definitions_[funcName] = code;
	return null;
};
		
Blockly.Python.procedures_defreturn = function() {
	var funcName = this.getFieldValue('NAME');
	var branch = Blockly.Python.statementToCode(this, 'STACK');
	branch = branch.replace(/&quot;/g, '"');
	if (Blockly.Python.INFINITE_LOOP_TRAP) {
		branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
	}
	//console.log(branch);
	var returnValue = Blockly.Python.valueToCode(this, 'RETURN', Blockly.Python.ORDER_NONE) || '';
	var code = '';

	returnValue = returnValue.replace(/&quot;/g, '"');
	var args = this.paramString;
	code += JST['procedures_defreturn']({'funcName': funcName,'args': args,'branch': branch,'returnValue': returnValue});
	code = Blockly.Python.scrub_(this, code);
	Blockly.Python.definitions_[funcName] = code;
	return null;
};
		
Blockly.Blocks.procedures_defreturn = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_PROCEDURES'),
	examples: ['procedures_callreturn_example.bly'],
	category_colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_PROCEDURES_DEFRETURN_PROCEDURE','LANG_VARIABLES_TYPE_NUMBER','LANG_VARIABLES_TYPE_STRING','LANG_PROCEDURES_DEFRETURN_TOOLTIP'],
	init: function() {
		var nameField = new Blockly.FieldTextInput('',Blockly.Procedures.rename);
		nameField.setSpellcheck(false);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(PiBlocks.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE')).appendField(nameField, 'NAME').appendField('', 'PARAMS');
		this.appendValueInput('RETURN').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage("img/blocks/return.svg",16*options.zoom, 16*options.zoom));
		this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
		/*if ((this.workspace.options.comments ||(this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) && Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT) {
		  this.setCommentText(Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT);
		}*/
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		this.setTooltip(PiBlocks.locales.getKey('LANG_PROCEDURES_DEFRETURN_TOOLTIP'));
		this.arguments_ = [];
		this.type_arguments_ = [];
		this.setStatements_(true);
		this.statementConnection_ = null;
	},
	isVariable: function(varValue) {
			for (var i in Blockly.Variables.allUsedVariables) {
				if (Blockly.Variables.allUsedVariables[i] === varValue) {
					return true;
				}
			}
			return false;
		},
	validName: Blockly.Blocks.procedures_defnoreturn.validName,
	setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
	updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
	mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
	domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
	decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
	compose: Blockly.Blocks['procedures_defnoreturn'].compose,
	getProcedureDef: function() {
		//console.log(this.getFieldValue('NAME'));
		return [this.getFieldValue('NAME'), this.arguments_, true];
	},
	getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
	renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
	callType_: 'procedures_callreturn',
	onchange: function() {
		if (this.last_procedure !== this.getFieldValue('NAME')) {
			var name = this.getFieldValue('NAME');
			name = this.validName(name);
			try {
				this.setFieldValue(name, 'NAME');
			} catch (e) {}
			this.last_procedure = name;
		}
	}
};
		
Blockly.Python.procedures_callnoreturn = function() {
	var funcName = this.getFieldValue('PROCEDURES');
	var args = [];
	var code = '';
	var a;
	try {
		for (var x = 0; x < this.getVariables(funcName).length; x++) {
			args[x] = Blockly.Python.valueToCode(this, 'ARG' + x, Blockly.Python.ORDER_NONE) || '';
		}
	} catch (e) {}
	var funcArgs = args.join(', ');
	code += funcName+'('+funcArgs+')\n';
	return code;
};
Blockly.Blocks.procedures_callnoreturn = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_PROCEDURES'), 
	category_colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_PROCEDURES_CALLNORETURN_TOOLTIP','LANG_PROCEDURES_DEFNORETURN_PROCEDURE','LANG_PROCEDURES_CALL_WITHOUT_DEFINITION'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_PROCEDURES_CALLNORETURN_TOOLTIP'));
		this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
		this.quarkConnections_ = null;
		this.quarkArguments_ = null;
		this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		this.setInputsInline(false);
	},
	validName: function(name) {
		if (name && name.length > 0) {
			var i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			name = name.replace(/([ ])/g, '_');
			name = name.replace(/([áàâä])/g, 'a');
			name = name.replace(/([éèêë])/g, 'e');
			name = name.replace(/([íìîï])/g, 'i');
			name = name.replace(/([óòôö])/g, 'o');
			name = name.replace(/([úùûü])/g, 'u');
			name = name.replace(/([ñ])/g, 'n');
			name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
			i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
		}
		return name;
	},
	getProcedures: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		var procedures_dropdown = [];
		if (procedures[0].length > 0) {
			for (var i in procedures[0]) {
				var proc_name = procedures[0][i][0];
				proc_name = this.validName(proc_name);
				procedures_dropdown.push([proc_name, proc_name]);
			}
		} else {
			procedures_dropdown.push([PiBlocks.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE'), PiBlocks.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE')]);
		}
		return procedures_dropdown;
	},
	maxVariableNumber: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		var procedures_dropdown = [];
		var max_num = 0;
		if (procedures[0].length > 0 || procedures[1].length > 0) {
			for (var i in procedures[0]) {
				if (procedures[0][i][1].length > max_num) {
					max_num = procedures[0][i][1].length;
				}
			}
			return max_num;
		} else {
			procedures_dropdown.push(['', '']);
		}
	},
	getVariables: function(funcName) {
		try {
			var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
			var procedures_dropdown = [];
			if (procedures[0].length > 0) {
				for (var i in procedures[0]) {
					if (procedures[0][i][0] === funcName) {
						return procedures[0][i][1];
					}
				}
			} else {
				procedures_dropdown.push(['', '']);
			}
		} catch (e) {}
	},
	exists: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		if (procedures[0].length > 0) {
			for (var i in procedures[0]) {
				if (procedures[0][i][0] === this.getFieldValue('PROCEDURES')) {
					return true;
				}
			}
		} else {
			return false;
		}
	},
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		if ((this.getFieldValue('PROCEDURES') !== this.last_procedure) && this.getFieldValue('PROCEDURES')) {
			this.changeVariables();
			this.last_procedure = this.getFieldValue('PROCEDURES');
			this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		} else if (this.getVariables(this.getFieldValue('PROCEDURES')) !== this.last_variables) {
			this.addVariables();
			this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
			this.last_procedure = this.getFieldValue('PROCEDURES');
		}
		if (!this.exists()) {
			try {
				this.setWarningText(PiBlocks.locales.getKey('LANG_PROCEDURES_CALL_WITHOUT_DEFINITION'));
			} catch (e) {}
		} else {
			try {
				this.setWarningText(null);
			} catch (e) {}
		}
	},
	addVariables: function() {
		var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		var var_num = 0;
		if (func_variables && this.getFieldValue('PROCEDURES')!=='') {
			if (!this.last_variables) {
				this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
			}
			if (func_variables.length >= this.last_variables.length) {
				var_num = func_variables.length;
			} else if (this.last_variables) {
				try {
					var_num = this.last_variables.length;
				} catch (e) {}
			}
			for (var x = 0; x < var_num; x++) {
				if (this.getInput('ARG' + x) === null) {
					this.appendValueInput('ARG' + x).appendField(func_variables[x], 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
				} else {
					if (func_variables[x] && this.getFieldValue('ARG_NAME' + x)) {
						this.setFieldValue(func_variables[x], 'ARG_NAME' + x);
					} else {
						this.removeInput('ARG' + x);
					}
				}
			}
			this.arguments_ = func_variables;
		}
	},
	renameProcedure: function(oldName, newName) {
		if (this.last_procedure&&(this.last_procedure!==PiBlocks.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE'))){
			var procedures = this.getProcedures();
			for (var i in procedures) {
				if (Blockly.Names.equals(oldName, procedures[i][0])) {
					this.setFieldValue(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
					this.addVariables();
				}
			}
			if (this.last_procedure === oldName) {
				this.last_procedure = newName;
			}
			try {
				this.setFieldValue(this.last_procedure, 'PROCEDURES');
			} catch (e) {}
		}
		else
		{
			this.last_procedure=newName;
		}
	},
	changeVariables: function() {
		var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		for (var i = 0; i < this.maxVariableNumber(); i++) {
			if (this.getInput('ARG' + i) === null) {
				break;
			}
			this.removeInput('ARG' + i);
		}
		for (var variable in func_variables) {
			this.appendValueInput('ARG' + variable).appendField(func_variables[variable]).setAlign(Blockly.ALIGN_RIGHT);
		}
		this.arguments_ = func_variables;
	},
	mutationToDom: function() {
		// Save the name and arguments (none of which are editable).
		var container = document.createElement('mutation');
		container.setAttribute('name', this.getFieldValue('PROCEDURES'));
		if (typeof this.arguments_ === 'undefined') {
			this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
		}
		if (typeof this.arguments_ === 'undefined') {
			this.arguments_ = [];
		}
		for (var x = 0; x < this.arguments_.length; x++) {
			var parameter = document.createElement('arg');
			parameter.setAttribute('name', this.arguments_[x]);
			container.appendChild(parameter);
		}
		return container;
	},
	domToMutation: function(xmlElement) {
		this.xmlElement = xmlElement;
		// Restore the name and parameters.
		var name = xmlElement.getAttribute('name');
		this.last_procedure = name;
		this.setFieldValue(name, 'PROCEDURES');
		for (var x = 0; x < xmlElement.childNodes.length; x++) {
			this.appendValueInput('ARG' + x).appendField(xmlElement.childNodes[x].getAttribute('name'), 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
		}
	}
};

Blockly.Python.procedures_callreturn = function() {
	// Call a procedure with a return value.
	var funcName = this.getFieldValue('PROCEDURES');
	var args = [];
	var a;
	var code = '';
	for (var x = 0; x < this.getVariables(funcName).length; x++) {
		args[x] = Blockly.Python.valueToCode(this, 'ARG' + x, Blockly.Python.ORDER_NONE) || 'null';
	}
	var funcArgs = args.join(', ');
	code += funcName+'('+funcArgs+')\n';
	return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
};
Blockly.Blocks.procedures_callreturn = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_PROCEDURES'),
	category_colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	colour: PiBlocks.LANG_COLOUR_PROCEDURES,
	keys: ['LANG_PROCEDURES_CALLRETURN_TOOLTIP','LANG_PROCEDURES_DEFRETURN_PROCEDURE','LANG_PROCEDURES_CALL_WITHOUT_DEFINITION2'],
	output: 'function',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_PROCEDURES);
		this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
		this.setOutput(true);
		this.setTooltip(PiBlocks.locales.getKey('LANG_PROCEDURES_CALLRETURN_TOOLTIP'));
		this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
		this.quarkConnections_ = null;
		this.quarkArguments_ = null;
		this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
	},
	validName: function(name) {
		if (name && name.length > 0) {
			var i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			name = name.replace(/([ ])/g, '_');
			name = name.replace(/([áàâä])/g, 'a');
			name = name.replace(/([éèêë])/g, 'e');
			name = name.replace(/([íìîï])/g, 'i');
			name = name.replace(/([óòôö])/g, 'o');
			name = name.replace(/([úùûü])/g, 'u');
			name = name.replace(/([ñ])/g, 'n');
			name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
			i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			for (var j in Blockly.Python.RESERVED_WORDS_) {
				var reserved_words = Blockly.Python.RESERVED_WORDS_.split(',');
				if (name === reserved_words[j]) {
					this.setWarningText('Reserved word');
					name = '';
					break;
				} else {
					this.setWarningText(null);
				}
			}
		}
		return name;
	},
	getProcedures: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		var procedures_dropdown = [];
		if (procedures[1].length > 0) {
			for (var i in procedures[1]) {
				var proc_name = procedures[1][i][0];
				proc_name = this.validName(proc_name);
				procedures_dropdown.push([proc_name, proc_name]);
			}
		} else {
			procedures_dropdown.push([PiBlocks.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE'), PiBlocks.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE')]);
		}
		//console.log(procedures_dropdown);
		return procedures_dropdown;
	},
	maxVariableNumber: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		var procedures_dropdown = [];
		var max_num = 0;
		if (procedures[1].length > 0) {
			for (var i in procedures[1]) {
				if (procedures[1][i][1].length > max_num) { // if the length of the variable array is larger than the max_num, equal max_num to that number
					max_num = procedures[1][i][1].length;
				}
			}
			return max_num;
		} else {
			procedures_dropdown.push(['', '']);
		}
	},
	getVariables: function(funcName) {
		try {
			var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
			var procedures_dropdown = [];
			if (procedures[1].length > 0) {
				for (var i in procedures[1]) {
					if (procedures[1][i][0] === funcName) {
						return procedures[1][i][1];
					}
					else
						return procedures_dropdown.push(['', '']);
				}
			} else {
				return procedures_dropdown.push(['', '']);
			}
		} catch (e) {}
	},
	exists: function() {
		var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
		if (procedures[1].length > 0) {
			for (var i in procedures[1]) {
				if (procedures[1][i][0] === this.getFieldValue('PROCEDURES')) {
					return true;
				}
			}
		} else {
			return false;
		}
	},
	onchange: function() {
		if (!this.workspace) {
			return;
		}
		//console.log(this.last_procedure);
		if (this.getFieldValue('PROCEDURES') !== this.last_procedure && this.getFieldValue('PROCEDURES')) {
			this.changeVariables();
			this.last_procedure = this.getFieldValue('PROCEDURES');
			this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		} else if (this.getVariables(this.getFieldValue('PROCEDURES')) !== this.last_variables) {
			this.addVariables();
			this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
			this.last_procedure = this.getFieldValue('PROCEDURES');
		}
		if (!this.exists()) {
			try {
				this.setWarningText(PiBlocks.locales.getKey('LANG_PROCEDURES_CALL_WITHOUT_DEFINITION2'));
			} catch (e) {}
		} else {
			try {
				this.setWarningText(null);
			} catch (e) {}
		}
	},
	addVariables: function() {
		var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		var var_num = 0;
		if (func_variables && this.getFieldValue('PROCEDURES')!=='') {
			if (!this.last_variables) {
				this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
			}
			if (func_variables.length >= this.last_variables.length) {
				var_num = func_variables.length;
			} else if (this.last_variables) {
				try {
					var_num = this.last_variables.length;
				} catch (e) {}
			}
			for (var x = 0; x < var_num; x++) {
				if (this.getInput('ARG' + x) === null) {
					this.appendValueInput('ARG' + x).appendField(func_variables[x], 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
				} else {
					if (func_variables[x] && this.getFieldValue('ARG_NAME' + x)) {
						this.setFieldValue(func_variables[x], 'ARG_NAME' + x);
					} else {
						this.removeInput('ARG' + x);
					}
				}
			}
			this.arguments_ = func_variables;
		}
	},
	renameProcedure: function(oldName, newName) {
		if (this.last_procedure&&(this.last_procedure!==PiBlocks.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE'))) {
			var procedures = this.getProcedures();
			for (var i in procedures) {
				if (Blockly.Names.equals(oldName, procedures[i][0])) {
					this.setFieldValue(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
				}
			}
			if (this.last_procedure === oldName) {
				this.last_procedure = newName;
			}
			try {
				this.setFieldValue(this.last_procedure, 'PROCEDURES');
			} catch (e) {}
		}
		else
		{
			this.last_procedure=newName;
		}
	},
	changeVariables: function() {
		var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
		for (var i = 0; i < this.maxVariableNumber(); i++) {
			if (this.getInput('ARG' + i) === null) {
				break;
			}
			this.removeInput('ARG' + i);
		}
		for (var variable in func_variables) {
			this.appendValueInput('ARG' + variable).appendField(func_variables[variable]).setAlign(Blockly.ALIGN_RIGHT);
		}
		this.arguments_ = func_variables;
	},
	mutationToDom: function() {
		var container = document.createElement('mutation');
		container.setAttribute('name', this.getFieldValue('PROCEDURES'));
		if (typeof this.arguments_ === 'undefined') {
			this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
		}
		if (typeof this.arguments_ === 'undefined') {
			this.arguments_ = [];
		}
		for (var x = 0; x < this.arguments_.length; x++) {
			var parameter = document.createElement('arg');
			parameter.setAttribute('name', this.arguments_[x]);
			container.appendChild(parameter);
		}
		return container;
	},
	domToMutation: function(xmlElement) {
		this.xmlElement = xmlElement;
		var name = xmlElement.getAttribute('name');
		this.last_procedure = name;
		this.setFieldValue(name, 'PROCEDURES');
		for (var x = 0; x < xmlElement.childNodes.length; x++) {
			this.appendValueInput('ARG' + x).appendField(xmlElement.childNodes[x].getAttribute('name'), 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
		}
	}
};
       
Blockly.Python.controls_setupLoopFinish = function() {
	var branch = Blockly.Python.statementToCode(this,'SETUP');
	branch = branch.replace(/&quot;/g, '"');    

	/*Blockly.Python.setups_['X_SETUP'] = JST['controls_setupLoop']({
		'branch': branch
	});*/
	var content = Blockly.Python.statementToCode(this, 'LOOP');
	content = content.replace(/&quot;/g, '"');
	content += '\n';
	
	var end_content = Blockly.Python.statementToCode(this, 'END');
	
	content=PiBlocks.decreaseIndent(branch)+'\nwhile True:\n'+content+PiBlocks.decreaseIndent(end_content);
	return content;
};

Blockly.Blocks.controls_setupLoopFinish = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_SETUP_LOOP_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendStatementInput('SETUP').appendField(new Blockly.FieldImage("img/blocks/setup.svg",20*options.zoom, 20*options.zoom)).setCheck('code');
		this.appendStatementInput('LOOP').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom, 20*options.zoom)).setCheck('code');
		this.appendStatementInput('END').appendField(new Blockly.FieldImage("img/blocks/exit.svg",20*options.zoom, 20*options.zoom)).setCheck('code');
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_SETUP_LOOP_TOOLTIP'));
	}
};
		
Blockly.Python.controls_whileUntil = function() {
	var argument0 = Blockly.Python.valueToCode(this, 'BOOL', Blockly.Python.ORDER_NONE) || '';
	argument0 = argument0.replace(/&quot;/g, '"');
	var branch = Blockly.Python.statementToCode(this, 'DO');
	branch = branch.replace(/&quot;/g, '"');

	var code = '';

	if (Blockly.Python.INFINITE_LOOP_TRAP) {
		branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
	}
	if (this.getFieldValue('MODE') === 'UNTIL') {
		if (!argument0.match(/^\w+$/)) {
			argument0 = '(' + argument0 + ')';
		}
		argument0 = 'not(' + argument0+')';
	}
	code += 'while '+argument0+':\n'+branch+'\n'
	return code;
};

Blockly.Blocks.controls_whileUntil = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_WHILEUNTIL_OPERATOR_WHILE','LANG_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL','LANG_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE','LANG_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendValueInput('BOOL').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom, 20*options.zoom)).setCheck(Boolean).appendField(new Blockly.FieldDropdown([
			[PiBlocks.locales.getKey('LANG_CONTROLS_WHILEUNTIL_OPERATOR_WHILE'), 'WHILE'],
			[PiBlocks.locales.getKey('LANG_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL'), 'UNTIL']
		]), 'MODE').appendField(new Blockly.FieldImage("img/blocks/binary.svg",20*options.zoom, 20*options.zoom));
		this.appendStatementInput('DO').appendField(new Blockly.FieldImage("img/blocks/do.svg",20*options.zoom, 20*options.zoom));
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('MODE');
			return Blockly.Blocks.controls_whileUntil.TOOLTIPS[op];
		});
	}
};

Blockly.Blocks.controls_whileUntil.TOOLTIPS = {
	WHILE: PiBlocks.locales.getKey('LANG_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'),
	UNTIL: PiBlocks.locales.getKey('LANG_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL')
};
		
Blockly.Python.controls_for = function() {
	var argument1 = Blockly.Python.valueToCode(this, 'TO', Blockly.Python.ORDER_NONE) || '';
	var branch = Blockly.Python.statementToCode(this, 'DO');
	if (Blockly.Python.INFINITE_LOOP_TRAP) {
		branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
	}
	var code = '';
	var to_input=this.getInputTargetBlock('TO');
	if (to_input)
	{
		code += 'for iter in range(0,'+argument1+ '):\n' + branch + '\n';
	}
	return code;
};

Blockly.Blocks.controls_for = {
	// For loop.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_FOR_TOOLTIP','LANG_CONTROLS_FOR_LOOP_WARNING4'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendValueInput('TO').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
		this.appendStatementInput('DO').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom,16*options.zoom)).setCheck('code');
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setInputsInline(true);
		var thisBlock = this;
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_FOR_TOOLTIP'));
	},
	getVars: function() {
		return ['iter'];
	},
	onchange: function() {
		var to_input=this.getInputTargetBlock('TO');
		if (to_input)
			this.setWarningText(null);
		else
			this.setWarningText(PiBlocks.locales.getKey('LANG_CONTROLS_FOR_LOOP_WARNING4'));
	}
};

Blockly.Python.controls_for_list = function() {
	var argument1 = Blockly.Python.valueToCode(this, 'LIST', Blockly.Python.ORDER_NONE) || '';
	var branch = Blockly.Python.statementToCode(this, 'DO');
	if (Blockly.Python.INFINITE_LOOP_TRAP) {
		branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
	}
	var code = '';
	var to_input=this.getInputTargetBlock('TO');
	if (to_input)
	{
		code += 'for item in '+argument1+ ':\n' + branch + '\n';
	}
	return code;
};

Blockly.Blocks.controls_for_list = {
	// For loop.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_FOR_TOOLTIP','LANG_CONTROLS_FOR_LOOP_WARNING4'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendValueInput('LIST').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).setCheck('LIST');
		this.appendStatementInput('DO').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom,16*options.zoom)).setCheck('code');
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setInputsInline(true);
		var thisBlock = this;
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_FOR_TOOLTIP'));
	},
	getVars: function() {
		return ['item'];
	},
	onchange: function() {
		var to_input=this.getInputTargetBlock('TO');
		if (to_input)
			this.setWarningText(null);
		else
			this.setWarningText(PiBlocks.locales.getKey('LANG_CONTROLS_FOR_LOOP_WARNING4'));
	}
};

Blockly.Python.controls_break = function() {
	var code = 'break\n';
	return code;
};

Blockly.Blocks.controls_break = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_BREAK_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/exit.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_BREAK_TOOLTIP'));
	},
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		var legal = false;
		// Is the block nested in a control statement?
		var block = this;
		do {
			if (block.type === 'controls_setupLoopFinish')
			{
				var clauseBlock = block.getInputTargetBlock('LOOP');
				var x = 0;
                while (clauseBlock) {
					if (clauseBlock.type==='controls_break')
					{
						if (clauseBlock.id===this.id)
						{
							legal = true;
							break;
						}
					}
					clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
                }
				if (legal)
					break;
			}
			else if (block.type === 'controls_for' ||
				block.type === 'controls_whileUntil' ||
				block.type === 'controls_for_list') {
				legal = true;
				break;
			}
			block = block.getSurroundParent();
		} while (block);
		if (legal) {
			this.setWarningText(null);
		} else {
			try {
				this.setWarningText(PiBlocks.locales.getKey('LANG_CONTROLS_FLOW_STATEMENTS_WARNING'));
			} catch (err) {
				console.log('Captured error: ', err);
			}
		}
	}
};

Blockly.Python.controls_if = function() {
	var n = 0;
	var argument = Blockly.Python.valueToCode(this, 'IF' + n, Blockly.Python.ORDER_NONE);
	argument = argument.replace(/&quot;/g, '"');
	var branch = (Blockly.Python.statementToCode(this, 'DO' + n)==='') ? '\tpass\n' : Blockly.Python.statementToCode(this, 'DO' + n);
	var code = '';
	code += 'if '+argument+':\n'+branch;
	
	for (n = 1; n <= this.elseifCount_; n++) {
		argument = Blockly.Python.valueToCode(this, 'IF' + n, Blockly.Python.ORDER_NONE);
		branch = (Blockly.Python.statementToCode(this, 'DO' + n)==='') ? '\tpass\n' : Blockly.Python.statementToCode(this, 'DO' + n);
		code += 'elif '+argument+':\n'+branch;
	}
	
	if (this.elseCount_) {
		branch = (Blockly.Python.statementToCode(this, 'ELSE')==='') ? '\tpass\n' : Blockly.Python.statementToCode(this, 'ELSE');
		code += 'else:\n'+branch;
	}
		
	branch = branch.replace(/&quot;/g, '"');
	code = code.replace(/&quot;/g, '"');
	return code + '\n';
};

Blockly.Blocks.controls_if = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_IF_MSG_IF','LANG_CONTROLS_IF_MSG_THEN','LANG_CONTROLS_IF_TOOLTIP_1','LANG_CONTROLS_IF_ELSEIF_Field_ELSEIF','LANG_CONTROLS_IF_MSG_THEN','LANG_CONTROLS_IF_ELSE_Field_ELSE'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendValueInput('IF0').setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage("img/blocks/binary.svg",20*options.zoom,20*options.zoom));
		this.appendStatementInput('DO0').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setMutator(new Blockly.Mutator(['controls_if_elseif',
			'controls_if_else'
		]));
		var thisBlock = this;
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_IF_TOOLTIP_1'));
		this.elseifCount_ = 0;
		this.elseCount_ = 0;
	},
	mutationToDom: function() {
		if (!this.elseifCount_ && !this.elseCount_) {
			return null;
		}
		var container = document.createElement('mutation');
		if (this.elseifCount_) {
			container.setAttribute('elseif', this.elseifCount_);
		}
		if (this.elseCount_) {
			container.setAttribute('else', 1);
		}
		return container;
	},
	domToMutation: function(xmlElement) {
		this.elseifCount_ = window.parseInt(xmlElement.getAttribute('elseif'), 10);
		this.elseCount_ = window.parseInt(xmlElement.getAttribute('else'), 10);
		for (var x = 1; x <= this.elseifCount_; x++) {
			this.appendValueInput('IF' + x).setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendStatementInput('DO' + x).appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
		}
		if (this.elseCount_) {
			this.appendDummyInput('ELSE_LABEL').appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendStatementInput('ELSE').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
		}
	},
	decompose: function(workspace) {
		var containerBlock = workspace.newBlock('controls_if_if');
		containerBlock.initSvg();
		var connection = containerBlock.getInput('STACK').connection;
		for (var x = 1; x <= this.elseifCount_; x++) {
			var elseifBlock = workspace.newBlock('controls_if_elseif');
			elseifBlock.initSvg();
			connection.connect(elseifBlock.previousConnection);
			connection = elseifBlock.nextConnection;
		}
		if (this.elseCount_) {
			var elseBlock = workspace.newBlock('controls_if_else');
			elseBlock.initSvg();
			connection.connect(elseBlock.previousConnection);
		}
		return containerBlock;
	},
	compose: function(containerBlock) {
		if (this.elseCount_) {
			this.removeInput('ELSE_LABEL');
			this.removeInput('ELSE');
		}
		this.elseCount_ = 0;
		for (var x = this.elseifCount_; x > 0; x--) {
			this.removeInput('IF' + x);
			this.removeInput('DO' + x);
		}
		this.elseifCount_ = 0;
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		while (clauseBlock) {
			switch (clauseBlock.type) {
				case 'controls_if_elseif':
					this.elseifCount_++;
					var ifInput = this.appendValueInput('IF' + this.elseifCount_).setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					var doInput = this.appendStatementInput('DO' + this.elseifCount_).setCheck('code');
					doInput.appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					if (clauseBlock.valueConnection_) {
						ifInput.connection.connect(clauseBlock.valueConnection_);
					}
					if (clauseBlock.statementConnection_) {
						doInput.connection.connect(clauseBlock.statementConnection_);
					}
					break;
				case 'controls_if_else':
					this.elseCount_++;
					this.appendDummyInput('ELSE_LABEL').appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					var elseInput = this.appendStatementInput('ELSE').setCheck('code');
					elseInput.appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					if (clauseBlock.statementConnection_) {
						elseInput.connection.connect(clauseBlock.statementConnection_);
					}
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection &&
				clauseBlock.nextConnection.targetBlock();
		}
	},
	saveConnections: function(containerBlock) {
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		var x = 1;
		while (clauseBlock) {
			switch (clauseBlock.type) {
				case 'controls_if_elseif':
					var inputIf = this.getInput('IF' + x);
					var inputDo = this.getInput('DO' + x);
					clauseBlock.valueConnection_ =
						inputIf && inputIf.connection.targetConnection;
					clauseBlock.statementConnection_ =
						inputDo && inputDo.connection.targetConnection;
					x++;
					break;
				case 'controls_if_else':
					inputDo = this.getInput('ELSE');
					clauseBlock.statementConnection_ =
						inputDo && inputDo.connection.targetConnection;
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection &&
				clauseBlock.nextConnection.targetBlock();
		}
	}
};

Blockly.Blocks.controls_if_if = {
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_IF_IF_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendStatementInput('STACK').setCheck('if');
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_IF_IF_TOOLTIP'));
		this.contextMenu = false;
	}
};

Blockly.Blocks.controls_if_elseif = {
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_IF_ELSEIF_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true,'if');
		this.setNextStatement(true,'if');
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_IF_ELSEIF_TOOLTIP'));
		this.contextMenu = false;
	}
};

Blockly.Blocks.controls_if_else = {
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_IF_ELSE_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true,'if');
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_IF_ELSE_TOOLTIP'));
		this.contextMenu = false;
	}
};
		
Blockly.Python.controls_delay_msec = function() {
	var delay_time = Blockly.Python.valueToCode(this, 'DELAY_TIME', Blockly.Python.ORDER_ATOMIC) || 0;
	var code = '';
	code += 'delay(0.001*('+delay_time+'))\n';
	return code;
};

Blockly.Blocks.controls_delay_msec = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_CONTROLS'),
	category_colour: PiBlocks.LANG_COLOUR_CONTROL,
	colour: PiBlocks.LANG_COLOUR_CONTROL,
	keys: ['LANG_CONTROLS_BASE_DELAY_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_CONTROL);
		this.appendValueInput('DELAY_TIME', Number).appendField(new Blockly.FieldImage("img/blocks/wait.svg",20*options.zoom, 20*options.zoom)).setCheck(Number);
		this.setInputsInline(true);
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_CONTROLS_BASE_DELAY_TOOLTIP'));
	}
};

Blockly.Python.logic_boolean = function() {
	var code = (this.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.logic_boolean = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,	
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_BOOLEAN_TRUE','LANG_LOGIC_BOOLEAN_FALSE','LANG_LOGIC_BOOLEAN_TOOLTIP'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true, Boolean);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown([[PiBlocks.locales.getKey('LANG_LOGIC_BOOLEAN_TRUE'), 'TRUE'],[PiBlocks.locales.getKey('LANG_LOGIC_BOOLEAN_FALSE'), 'FALSE']]), 'BOOL');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LOGIC_BOOLEAN_TOOLTIP'));
	}
};


Blockly.Python.logic_compare = function() {
	var mode = this.getFieldValue('OP');
	var operator = Blockly.Python.logic_compare.OPERATORS[mode];
	//var order = (operator === '==' || operator === '!=') ? Blockly.Python.ORDER_EQUALITY : Blockly.Python.ORDER_RELATIONAL;
	var order = Blockly.Python.ORDER_RELATIONAL;
	var argument0 = Blockly.Python.valueToCode(this, 'A', order) || '';
	var argument1 = Blockly.Python.valueToCode(this, 'B', order) || '';
	var code = '(('+argument0+')'+operator+'('+argument1+'))';
	return [code, order];
};

Blockly.Python.logic_compare.OPERATORS = {
	EQ: '==',
	NEQ: '!=',
	LT: '<',
	LTE: '<=',
	GT: '>',
	GTE: '>='
};


Blockly.Blocks.logic_compare = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,		
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_COMPARE_TOOLTIP_EQ','LANG_LOGIC_COMPARE_TOOLTIP_NEQ','LANG_LOGIC_COMPARE_TOOLTIP_LT','LANG_LOGIC_COMPARE_TOOLTIP_LTE','LANG_LOGIC_COMPARE_TOOLTIP_GT','LANG_LOGIC_COMPARE_TOOLTIP_GTE'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true, Boolean);
		this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/comparison.svg',48*options.zoom,20*options.zoom));
		this.appendValueInput('B').appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP');
		this.setInputsInline(true);
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('OP');
			return Blockly.Blocks.logic_compare.TOOLTIPS[op];
		});
	}
};

Blockly.Blocks.logic_compare.OPERATORS = [
	['=', 'EQ'],
	['\u2260', 'NEQ'],
	['<', 'LT'],
	['\u2264', 'LTE'],
	['>', 'GT'],
	['\u2265', 'GTE']
];

Blockly.Blocks.logic_compare.TOOLTIPS = {
	EQ: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_EQ'),
	NEQ: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_NEQ'),
	LT: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_LT'),
	LTE: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_LTE'),
	GT: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_GT'),
	GTE: PiBlocks.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_GTE')
};

Blockly.Python.logic_operation = function() {
	var code = '';
	var operator = (this.getFieldValue('OP')==='AND') ? 'and' : (this.getFieldValue('OP')==='OR') ? 'or' : '';
	var order = (operator === 'and') ? Blockly.Python.ORDER_LOGICAL_AND : (operator === 'or') ? Blockly.Python.ORDER_LOGICAL_OR : Blockly.Python.ORDER_NONE;
	var argument0 = Blockly.Python.valueToCode(this, 'A', order) || '';
	var argument1 = Blockly.Python.valueToCode(this, 'B', order) || '';
	code +='(('+argument0+')'+operator+'('+argument1+'))';
	return [code, order];
};

Blockly.Blocks.logic_operation = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,				
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_OPERATION_AND','LANG_LOGIC_OPERATION_OR','LANG_LOGIC_OPERATION_TOOLTIP_AND','LANG_LOGIC_OPERATION_TOOLTIP_OR'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true, Boolean);
		this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/and.svg',20*options.zoom,20*options.zoom)).setCheck(Boolean);
		this.appendValueInput('B').setCheck(Boolean).appendField(new Blockly.FieldDropdown([
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_AND') || 'AND', 'AND'],
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_OR') || 'OR', 'OR']
		]), 'OP');
		this.setInputsInline(true);
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('OP');
			return Blockly.Blocks.logic_operation.TOOLTIPS[op];
		});
	}
};
Blockly.Blocks.logic_operation.TOOLTIPS = {
	AND: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_AND'),
	OR: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_OR')										  
};


Blockly.Python.logic_bitwise_operation = function() {
	var code = '';
	var operator = (this.getFieldValue('OP')==='AND') ? '&' : (this.getFieldValue('OP')==='OR') ? '|' : (this.getFieldValue('OP')==='XOR') ? '^'  : (this.getFieldValue('OP')==='SHIFT_LEFT') ? '<<'  : (this.getFieldValue('OP')==='SHIFT_RIGHT') ? '>>' : '';
	var order = (operator === '&') ? Blockly.Python.ORDER_BITWISE_AND : (operator === '|') ? Blockly.Python.ORDER_BITWISE_OR : (operator === '^') ? Blockly.Python.ORDER_BITWISE_XOR : Blockly.Python.ORDER_NONE;
	var argument0 = Blockly.Python.valueToCode(this, 'A', order) || '';
	var argument1 = Blockly.Python.valueToCode(this, 'B', order) || '';
	code +='(('+argument0+')'+operator+'('+argument1+'))';
	return [code, order];
};

Blockly.Blocks.logic_bitwise_operation = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,				
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_OPERATION_AND','LANG_LOGIC_OPERATION_OR','LANG_LOGIC_OPERATION_TOOLTIP_AND','LANG_LOGIC_OPERATION_TOOLTIP_OR'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true,Number);
		this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/bitwise.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
		this.appendValueInput('B').setCheck(Number).appendField(new Blockly.FieldDropdown([
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_AND') || 'AND', 'AND'],
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_OR') || 'OR', 'OR'],
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_XOR') || 'XOR', 'XOR'],
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_SHIFT_LEFT') || 'SHIFT_LEFT', 'SHIFT_LEFT'],
			[PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_SHIFT_RIGHT') || 'SHIFT_RIGHT', 'SHIFT_RIGHT']
		]), 'OP');
		this.setInputsInline(true);
		var thisBlock = this;
		this.setTooltip(function() {
			var op = thisBlock.getFieldValue('OP');
			return Blockly.Blocks.logic_bitwise_operation.TOOLTIPS[op];
		});
	}
};
Blockly.Blocks.logic_bitwise_operation.TOOLTIPS = {
	AND: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_BITWISE_AND'),
	OR: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_BITWISE_OR'),
	XOR: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_BITWISE_XOR'),
	SHIFT_LEFT: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_SHIFT_LEFT'),
	SHIFT_RIGHT: PiBlocks.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_SHIFT_RIGHT')										  
};
		
		
Blockly.Python.logic_negate = function() {
	var order = Blockly.Python.ORDER_LOGICAL_NOT;
	var argument0 = Blockly.Python.valueToCode(this, 'BOOL', order) || 'false';
	var code = 'not('+argument0+')';
	return [code, order];
};


Blockly.Blocks.logic_negate = {
	// Negation.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,	
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_NEGATE_TOOLTIP'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true, Boolean);
		this.appendValueInput('BOOL').setCheck(Boolean).appendField(new Blockly.FieldImage('img/blocks/negation.svg',56*options.zoom,20*options.zoom));
		this.setTooltip(PiBlocks.locales.getKey('LANG_LOGIC_NEGATE_TOOLTIP'));
	}
};

Blockly.Python.logic_bitwise_negate = function() {
	var order = Blockly.Python.ORDER_BITWISE_NOT;
	var argument0 = Blockly.Python.valueToCode(this, 'BOOL', order) || 'false';
	var code = '~('+argument0+')';
	return [code, order];
};

Blockly.Blocks.logic_bitwise_negate = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LOGIC'),
	category_colour: PiBlocks.LANG_COLOUR_LOGIC,				
	colour: PiBlocks.LANG_COLOUR_LOGIC,
	keys: ['LANG_LOGIC_BITWISE_NEGATE_TOOLTIP'],
	output: 'boolean',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LOGIC);
		this.setOutput(true,Number);
		this.appendValueInput('BOOL').appendField(new Blockly.FieldImage('img/blocks/bitwise.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/negation.svg',56*options.zoom,20*options.zoom)).setCheck(Number);
		this.setTooltip(PiBlocks.locales.getKey('LANG_LOGIC_BITWISE_NEGATE_TOOLTIP'));
	}
};
		
Blockly.Python.math_number = function() {
	var code = window.parseFloat(this.getFieldValue('NUM'));
	var order = code < 0 ? Blockly.Python.ORDER_UNARY_PREFIX : Blockly.Python.ORDER_ATOMIC;
	return [code, order];
};

Blockly.Blocks.math_number = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'), // Variables are handled specially.
	category_colour: PiBlocks.LANG_COLOUR_MATH,
	colour: PiBlocks.LANG_COLOUR_MATH,
	keys: ['LANG_MATH_NUMBER_TOOLTIP'],
	output: 'number',
	init: function() {
		this.setColour(this.colour);
		//this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldTextInput('0', Blockly.Blocks.math_number.validator), 'NUM');
		this.appendDummyInput().appendField(new Blockly.FieldTextInput('0', Blockly.Blocks.math_number.validator), 'NUM');
		this.setOutput(true, Number);
		this.setTooltip(PiBlocks.locales.getKey('LANG_MATH_NUMBER_TOOLTIP'));
	}
};
		
Blockly.Blocks.math_number.validator = function(text) {
	// Ensure that only a number may be entered.
	// TODO: Handle cases like 'o', 'ten', '1,234', '3,14', etc.
	var n = window.parseFloat(text || 0);
	return window.isNaN(n) ? null : String(n);
};


Blockly.Python.math_arithmetic = function() {
	var mode = this.getFieldValue('OP');
	var tuple = Blockly.Python.math_arithmetic.OPERATORS[mode];
	var operator = tuple[0];
	var order = tuple[1];
	var argument0 = Blockly.Python.valueToCode(this, 'A', order) || '';
	var argument1 = Blockly.Python.valueToCode(this, 'B', order) || '';
	var code = '('+argument0+operator+argument1+')';	
	return [code, order];
};

Blockly.Python.math_arithmetic.OPERATORS = {
	ADD: ['+', Blockly.Python.ORDER_ADDITIVE],
	MINUS: ['-', Blockly.Python.ORDER_ADDITIVE],
	MULTIPLY: ['*', Blockly.Python.ORDER_MULTIPLICATIVE],
	DIVIDE: ['/', Blockly.Python.ORDER_MULTIPLICATIVE],
	POWER: ['^', Blockly.Python.ORDER_EXPONENTIATION],
	MODULUS: ['%', Blockly.Python.ORDER_MULTIPLICATIVE],
	MODULUS: ['//', Blockly.Python.ORDER_MULTIPLICATIVE]
};

Blockly.Blocks.math_arithmetic = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'),
	category_colour: PiBlocks.LANG_COLOUR_MATH,
	colour: PiBlocks.LANG_COLOUR_MATH,
	keys: ['LANG_MATH_ARITHMETIC_TOOLTIP'],
	output: 'number',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_MATH);
		this.setOutput(true, Number);
		this.appendValueInput('A').setCheck(Number).appendField(new Blockly.FieldImage('img/blocks/math.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendDummyInput('').appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP').setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('B').setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		var thisBlock = this;
		this.setTooltip(PiBlocks.locales.getKey('LANG_MATH_ARITHMETIC_TOOLTIP'));
	}
};

Blockly.Blocks.math_arithmetic.OPERATORS = [
	['+', 'ADD'],
	['-', 'MINUS'],
	['\u00D7', 'MULTIPLY'],
	['\u00F7', 'DIVIDE'],
	['^','POWER'],
	['%','MODULUS'],
	['//','FLOOR']
];

Blockly.Python.math_self_arithmetic = function() {
	var operator = Blockly.Python.math_self_arithmetic.OPERATORS[this.getFieldValue('OP')][0];
	var varValue = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_ASSIGNMENT) || '';
    var varName = this.getFieldValue('VAR') || '';
	var code = varName+operator+'('+varValue+')';
	return code;
};

Blockly.Python.math_self_arithmetic.OPERATORS = {
	ADD: ['+=', Blockly.Python.ORDER_ASSIGNMENT],
	MINUS: ['-=', Blockly.Python.ORDER_ASSIGNMENT],
	MULTIPLY: ['*=', Blockly.Python.ORDER_ASSIGNMENT],
	DIVIDE: ['/=', Blockly.Python.ORDER_ASSIGNMENT],
	POWER: ['**=', Blockly.Python.ORDER_ASSIGNMENT],
	MODULUS: ['%=', Blockly.Python.ORDER_ASSIGNMENT],
	FLOOR: ['//=', Blockly.Python.ORDER_ASSIGNMENT]
};

Blockly.Blocks.math_self_arithmetic = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'),
	category_colour: PiBlocks.LANG_COLOUR_MATH,
	colour: PiBlocks.LANG_COLOUR_MATH,
	keys: ['LANG_MATH_ARITHMETIC_TOOLTIP'],
	output: 'number',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_MATH);
		this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/box_in.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getVariables()),'VAR').appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP').setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('VALUE').appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		var thisBlock = this;
		this.setPreviousStatement(true,'code');
        this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_MATH_SELF_ARITHMETIC_TOOLTIP'));
	},
	getVariables: function() {
		var variables = Blockly.Variables.allVariables();
		var dropdown = [];
		if (variables.length > 0) {
			for (var i in variables) {
				if (variables[i]!=='iteration')
				  dropdown.push([variables[i], variables[i]]);
			}
		} else {
			dropdown.push(['', '']);
		}
		if (dropdown.length<1)
			dropdown.push(['', '']);
		return dropdown;
	},
	onchange: function() {
		if (!this.workspace) {
			return;
		}
		this.last_field_value=this.getFieldValue('VAR');
		if (!this.last_variables){
			this.last_variables=Blockly.Variables.allVariables();
		}
		var variables=Blockly.Variables.allVariables();
		for (var i in variables){
			 if (Blockly.Variables.allVariables()[i]!==this.last_variables[i]){
				 this.getInput('VALUE').removeField('VAR');
				 this.new_field=new Blockly.FieldDropdown(this.getVariables());
				 this.new_field.setValue(this.last_field_value);
				 this.getInput('VALUE').insertFieldAt(1,this.new_field,'VAR');
				 //this.getInput('VALUE').insertFieldAt(1,this.last_field,'VAR');
				 this.last_variables=Blockly.Variables.allVariables();
			 }
		 }
		try {
			if (!this.exists()) {
				this.setWarningText(PiBlocks.locales.getKey('LANG_VARIABLES_CALL_WITHOUT_DEFINITION'));
			} else {
				this.setWarningText(null);
			}
		} catch (e) {}
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setTitleValue(newName, 'VAR');
		}
	},
	exists: function() {
		for (var i in Blockly.Variables.allVariables()) {
			if (Blockly.Variables.allVariables()[i] === this.getFieldValue('VAR')) {
				return true;
			}
		}
		return false;
	}
};

Blockly.Blocks.math_self_arithmetic.OPERATORS = [
	['+=', 'ADD'],
	['-=', 'MINUS'],
	['\u00D7=', 'MULTIPLY'],
	['\u00F7=', 'DIVIDE'],
	['**=','POWER'],
	['%=','MODULUS'],
	['//=','FLOOR']
];
		
		Blockly.Python.base_map = function() {
            var value_num = Blockly.Python.valueToCode(this, 'NUM', Blockly.Python.ORDER_NONE);
			var value_dmin = Blockly.Python.valueToCode(this, 'DMIN', Blockly.Python.ORDER_ATOMIC);
            var value_dmax = Blockly.Python.valueToCode(this, 'DMAX', Blockly.Python.ORDER_ATOMIC);

            var code = '';
            var a = PiBlocks.findPinMode(value_num);
            code += a['code'];
            value_num = a['pin'];

            a = PiBlocks.findPinMode(value_dmax);
            code += a['code'];
            value_dmax = a['pin'];
			
			code += 'map('+value_num+',0,1023,'+value_dmin+','+value_dmax+')';

            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.base_map = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: PiBlocks.LANG_COLOUR_MATH,
			colour: PiBlocks.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_BASE_MAP_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_MATH);
                this.appendValueInput('NUM', Number).appendField(new Blockly.FieldImage('img/blocks/enlarge.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
                this.appendValueInput('DMIN', Number).appendField(new Blockly.FieldImage('img/blocks/from2.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
				this.appendValueInput('DMAX', Number).setCheck(Number);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/to2.svg',20*options.zoom,20*options.zoom));
                this.setInputsInline(true);
                this.setOutput(true,Number);
                this.setTooltip(PiBlocks.locales.getKey('LANG_MATH_BASE_MAP_TOOLTIP'));
            }
        };
		
		
		Blockly.Python.math_minmax = function() {
            // Basic arithmetic operators, and power.
            var op = this.getFieldValue('OP');
            var argument0 = Blockly.Python.valueToCode(this, 'A', Blockly.Python.ORDER_NONE) || '';
            var argument1 = Blockly.Python.valueToCode(this, 'B', Blockly.Python.ORDER_NONE) || '';
            var code = '';
			code+= op+'('+argument0+','+argument1+')';
            
            return [code, Blockly.Python.ORDER_ATOMIC];
        };
		
        Blockly.Blocks.math_minmax = {
            // Basic arithmetic operator.
            category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: PiBlocks.LANG_COLOUR_MATH,
			colour: PiBlocks.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_MINMAX_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_MATH);
                this.setOutput(true, Number);
                this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/minmax.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown([['min', 'min'],['max', 'max']]), 'OP').appendField(new Blockly.FieldImage('img/blocks/one.svg',12*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
                this.appendValueInput('B').setCheck(Number).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/two.svg',12*options.zoom,20*options.zoom));
                this.appendDummyInput('');
				this.setInputsInline(true);
                var thisBlock = this;
                this.setTooltip(PiBlocks.locales.getKey('LANG_MATH_MINMAX_TOOLTIP'));
            }
        };
		
Blockly.Python.math_random = function() {
	var range = this.getInputTargetBlock('RANGE');
	if (range===null)
		return ['',Blockly.Python.ORDER_ATOMIC];
	if (range.type==='list_range')
	{
		Blockly.Python.setups_['setup_randomseed'] = 'random.seed()\n';
		var code = 'random.randint('+Blockly.Python.valueToCode(range,'FROM',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(range,'TO',Blockly.Python.ORDER_NONE)+')'; 
	}
	else
		var code='';
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.math_random = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_MATH'),
	category_colour: PiBlocks.LANG_COLOUR_MATH,
	colour: PiBlocks.LANG_COLOUR_MATH,
	keys: ['LANG_ADVANCED_MATH_RANDOM_TOOLTIP'],
	output: 'number',
	init: function() {
		this.setColour(this.colour);
		this.appendValueInput('RANGE').appendField(new Blockly.FieldImage('img/blocks/dices.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/range.svg',20*options.zoom,20*options.zoom)).setCheck('RANGE').setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setOutput(true,Number);
		this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_MATH_RANDOM_TOOLTIP'));
	}
};
		
Blockly.Python.variables_create = function() {
	var varType;
	var code='';
	var varValue = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_ASSIGNMENT);
	var input = this.getInputTargetBlock('VALUE');
	if (input===null)
		return '';
	var varName = this.getFieldValue('VAR') || '';
	/*var isFunction = false;
	for (var i in Blockly.Python.definitions_) {
		if (Blockly.Python.definitions_[i].search(varValue + ' \\(') >= 0) {
			isFunction = true;
			break;
		}
	}
	if (isFunction) {
		for (i in Blockly.Python.definitions_) {
			if (Blockly.Python.definitions_[i].search(varValue) >= 0) {
				if (Blockly.Python.definitions_[i].substring(0, 5) === 'float') {
					varType = 'float';
				}
				else if (Blockly.Python.definitions_[i].substring(0, 4) === 'bool') {
					varType = 'bool';
				}
				else if (Blockly.Python.definitions_[i].substring(0, 6) === 'String') {
					varType = 'String';
				} 
				else {
					varType = '';
				}
				Blockly.Python.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
				Blockly.Python.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
				break;
			}
		}
	}*/
	if (this.isVariable(varValue)) {
		varType = PiBlocks.variables[varValue][0];
		code = varName + '=' + varValue + '\n';
	}
	else {
		varType = input.output;
		code = varName + '=' + varValue + '\n';
	}
	PiBlocks.variables[varName] = [varType];
	return code;
};

Blockly.Blocks.variables_create = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_VARIABLES'), // Variables are handled specially.
	category_colour: PiBlocks.LANG_COLOUR_VARIABLES,
	colour: PiBlocks.LANG_COLOUR_VARIABLES,	
	keys: ['LANG_VARIABLES_GLOBAL_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_VARIABLES);
		this.appendValueInput('VALUE').appendField(new Blockly.FieldImage('img/blocks/box.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldTextInput(''), 'VAR');
		this.setInputsInline(false);
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_VARIABLES_GLOBAL_TOOLTIP'));
	},
	getVars: function() {
		return [this.getFieldValue('VAR')];
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	isVariable: function(varValue) {
		for (var i in Blockly.Variables.allVariables()) {
			if (Blockly.Variables.allVariables()[i] === varValue) {
				return true;
			}
		}
		return false;
	},
	validName: function(name) {
		if (name && name.length > 0) {
			var i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			name = name.replace(/([ ])/g, '_');
			name = name.replace(/([áàâä])/g, 'a');
			name = name.replace(/([éèêë])/g, 'e');
			name = name.replace(/([íìîï])/g, 'i');
			name = name.replace(/([óòôö])/g, 'o');
			name = name.replace(/([úùûü])/g, 'u');
			name = name.replace(/([ñ])/g, 'n');
			name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\̣\─\ç\`\´\¨\^])/g, '');
			i = 0;
			while (i < name.length) {
				if (!isNaN(parseFloat(name[i]))) {
					name = name.substring(1, name.length);
				} else {
					break;
				}
			}
			for (var j in Blockly.Python.RESERVED_WORDS_) {
				var reserved_words = Blockly.Python.RESERVED_WORDS_.split(',');
				if (name === reserved_words[j]) {
					this.setWarningText('Reserved word');
					name = '';
					break;
				} else {
					this.setWarningText(null);
				}
			}
		}
		return name;
	},
	onchange: function() {
		if (this.last_variable !== this.getFieldValue('VAR')) {
			var name = this.getFieldValue('VAR');
			name = this.validName(name);
			try {
				this.setFieldValue(name, 'VAR');
			} catch (e) {}
			this.last_variable = name;
		}
	}
};

Blockly.Python.variables_get = function() {
	var varName = this.getFieldValue('VAR') || '';
	return [varName, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.variables_get = {
	// Variable setter.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_VARIABLES'), // Variables are handled specially.
	category_colour: PiBlocks.LANG_COLOUR_VARIABLES,
	colour: PiBlocks.LANG_COLOUR_VARIABLES,	
	keys: ['LANG_VARIABLES_GET_TOOLTIP','LANG_CONTROLS_FOR_LOOP_WARNING5'],
	output: 'variable',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_VARIABLES);
		this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage('img/blocks/box_out.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getVariables()), 'VAR');
		this.setOutput(true);
		this.setTooltip(PiBlocks.locales.getKey('LANG_VARIABLES_GET_TOOLTIP'));
	},
	getVariables: function() {
		var variables = Blockly.Variables.allVariables();
		var dropdown = [];
		if (variables.length > 0) {
			for (var i in variables) {
				dropdown.push([variables[i], variables[i]]);
			}
		} else {
			dropdown.push(['', '']);
		}
		return dropdown;
	},
	onchange: function() {
		 if (!this.workspace) {
			 return;
		 }
		 var variables=Blockly.Variables.allVariables();
		 this.last_variable=this.getFieldValue('VAR');
		 if (!this.last_variables){
			 this.last_variables=[];
		 }
		 
		 for (var i=0;i<variables.length;i++){
			 if ((variables[i]!==this.last_variables[i])||(variables.length!==this.last_variables.length)){
				 this.getInput('DUMMY').removeField('VAR');
				 this.getInput('DUMMY').appendField(new Blockly.FieldDropdown(this.getVariables()), 'VAR');
				 this.setFieldValue(this.last_variable, 'VAR');
				 this.last_variables=variables;
			 }
		 }
		try {
			if (!this.exists()) {
				this.setWarningText(PiBlocks.locales.getKey('LANG_VARIABLES_CALL_WITHOUT_DEFINITION'));
			} else {
				if (this.getFieldValue('VAR')==='iteration')
				{
					var in_for_loop=false;
					var block =this.getParent();
					while(block!==null)
					{
						if (block.type==='controls_for')
						{
							in_for_loop=true;
							break;
						}
						block=block.getParent();
					}
					if (in_for_loop)
						this.setWarningText(null);
					else
						this.setWarningText(PiBlocks.locales.getKey('LANG_CONTROLS_FOR_LOOP_WARNING5'));
				}
				else
				  this.setWarningText(null);
			}
		} catch (e) {}
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setTitleValue(newName, 'VAR');
		}
	},
	exists: function() {
		var variables = Blockly.Variables.allVariables();
		for (var i=0;i<variables.length;i++) {
			if (variables[i] === this.getFieldValue('VAR')) {
				return true;
			}
		}
		return false;
	}
};
		
		
Blockly.Python.variables_set = function() {
	var varValue = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_ASSIGNMENT) || '';
	var varName = this.getFieldValue('VAR') || '';
	var code = varName+'='+varValue;
	return code;
};
Blockly.Blocks.variables_set = {
	// Variable setter.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_VARIABLES'),
	category_colour: PiBlocks.LANG_COLOUR_VARIABLES,
	colour: PiBlocks.LANG_COLOUR_VARIABLES,		
	keys: ['LANG_VARIABLES_SET_TOOLTIP','LANG_VARIABLES_CALL_WITHOUT_DEFINITION'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_VARIABLES);
		this.appendValueInput('VALUE').appendField(new Blockly.FieldImage('img/blocks/box_in.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getVariables()),'VAR').setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(false);
		this.setPreviousStatement(true,'code');
		this.setNextStatement(true,'code');
		this.setTooltip(PiBlocks.locales.getKey('LANG_VARIABLES_SET_TOOLTIP'));
	},
	getVariables: function() {
		var variables = Blockly.Variables.allVariables();
		var dropdown = [];
		if (variables.length > 0) {
			for (var i in variables) {
				if (variables[i]!=='iteration')
				  dropdown.push([variables[i], variables[i]]);
			}
		} else {
			dropdown.push(['', '']);
		}
		if (dropdown.length<1)
			dropdown.push(['', '']);
		return dropdown;
	},
	onchange: function() {
		if (!this.workspace) {
			return;
		}
		this.last_field_value=this.getFieldValue('VAR');
		if (!this.last_variables){
			this.last_variables=Blockly.Variables.allVariables();
		}
		var variables=Blockly.Variables.allVariables();
		for (var i in variables){
			 if (Blockly.Variables.allVariables()[i]!==this.last_variables[i]){
				 this.getInput('VALUE').removeField('VAR');
				 this.new_field=new Blockly.FieldDropdown(this.getVariables());
				 this.new_field.setValue(this.last_field_value);
				 this.getInput('VALUE').insertFieldAt(1,this.new_field,'VAR');
				 //this.getInput('VALUE').insertFieldAt(1,this.last_field,'VAR');
				 this.last_variables=Blockly.Variables.allVariables();
			 }
		 }
		try {
			if (!this.exists()) {
				this.setWarningText(PiBlocks.locales.getKey('LANG_VARIABLES_CALL_WITHOUT_DEFINITION'));
			} else {
				this.setWarningText(null);
			}
		} catch (e) {}
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setTitleValue(newName, 'VAR');
		}
	},
	exists: function() {
		for (var i in Blockly.Variables.allVariables()) {
			if (Blockly.Variables.allVariables()[i] === this.getFieldValue('VAR')) {
				return true;
			}
		}
		return false;
	}
};

Blockly.Python.list_range = function() {
	var from_value = Blockly.Python.valueToCode(this,'FROM',Blockly.Python.ORDER_NONE);
	var to_value = Blockly.Python.valueToCode(this,'TO',Blockly.Python.ORDER_NONE);
	var code = '['+from_value+':'+to_value+']';
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.list_range = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,	
	keys: ['LANG_LIST_RANGE_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		//this.appendValueInput('FROM').appendField(new Blockly.FieldImage('img/blocks/range.svg',32*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/left_bracket.svg',6*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('FROM').appendField(new Blockly.FieldImage('img/blocks/left_bracket.svg',6*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('TO').appendField(new Blockly.FieldImage('img/blocks/colon.svg',6*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/right_bracket.svg',6*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setOutput(true,'RANGE');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_RANGE_TOOLTIP'));
	}
};

Blockly.Python.lists_constructor2 = function() {
	var code='['+Blockly.Python.valueToCode(this,'ITEM0',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM1',Blockly.Python.ORDER_NONE)+']';
	return [code,Blockly.Python.ORDER_NONE];
};

		
Blockly.Blocks.lists_constructor2 = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,
	keys: [],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendValueInput('ITEM0').appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/one.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM1').appendField(new Blockly.FieldImage('img/blocks/two.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setOutput(true,'LIST');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR2_TOOLTIP'));
		this.itemCount_ = 2;
	}
};

Blockly.Python.lists_constructor3 = function() {
	var code='['+Blockly.Python.valueToCode(this,'ITEM0',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM1',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM2',Blockly.Python.ORDER_NONE)+']';
	return [code,Blockly.Python.ORDER_NONE];
};

		
Blockly.Blocks.lists_constructor3 = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,
	keys: [],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendValueInput('ITEM0').appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/one.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM1').appendField(new Blockly.FieldImage('img/blocks/two.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM2').appendField(new Blockly.FieldImage('img/blocks/three.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setOutput(true,'LIST');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR3_TOOLTIP'));
		this.itemCount_ = 2;
	}
};

Blockly.Python.lists_constructor4 = function() {
	var code='['+Blockly.Python.valueToCode(this,'ITEM0',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM1',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM2',Blockly.Python.ORDER_NONE)+','+Blockly.Python.valueToCode(this,'ITEM3',Blockly.Python.ORDER_NONE)+']';
	return [code,Blockly.Python.ORDER_NONE];
};

		
Blockly.Blocks.lists_constructor4 = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,
	keys: [],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendValueInput('ITEM0').appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/one.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM1').appendField(new Blockly.FieldImage('img/blocks/two.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM2').appendField(new Blockly.FieldImage('img/blocks/three.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ITEM3').appendField(new Blockly.FieldImage('img/blocks/four.svg',12*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setOutput(true,'LIST');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR4_TOOLTIP'));
		this.itemCount_ = 2;
	}
};
		
Blockly.Python.list_constructor = function() {
	// Array constructor.
	var code='[';
	if (this.itemCount_>0)
	{
		item = Blockly.Python.valueToCode(this, 'ITEM0', Blockly.Python.ORDER_NONE);
		code+=item;
		for (var n = 1; n < this.itemCount_; n++) {
			item = Blockly.Python.valueToCode(this, 'ITEM'+n, Blockly.Python.ORDER_NONE);
			code+=','+item;
		}
	}
	code+=']';
	return [code,Blockly.Python.ORDER_NONE];
};


Blockly.Blocks.list_constructor = {
	// Variable setter.
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,
	keys: [],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendDummyInput('ITEMS').appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom));
		this.setInputsInline(false);
		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setOutput(true,'LIST');
		this.setMutator(new Blockly.Mutator(['list_constructor_item']));
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR_TOOLTIP'));
		this.itemCount_ = 0;
	},
	mutationToDom: function() {
		if (!this.itemCount_) {
			return null;
		}
		var container = document.createElement('mutation');
		if (this.itemCount_) {
			container.setAttribute('item', this.itemCount_);
		}
		return container;
	},
	domToMutation: function(xmlElement) {
		this.itemCount_ = window.parseInt(xmlElement.getAttribute('item'), 10);
		for (var x = 0; x < this.itemCount_; x++) {
			this.appendValueInput('ITEM'+x).appendField(new Blockly.FieldImage('img/blocks/item.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		}
	},
	decompose: function(workspace) {
		var containerBlock = workspace.newBlock('list_constructor_constructor');
		containerBlock.initSvg();
		var connection = containerBlock.getInput('STACK').connection;
		for (var x = 0; x < this.itemCount_; x++) {
			var itemBlock = workspace.newBlock('list_constructor_item');
			itemBlock.initSvg();
			connection.connect(itemBlock.previousConnection);
			connection = itemBlock.nextConnection;
		}
		return containerBlock;
	},
	compose: function(containerBlock) {
		// Disconnect all the task input blocks and remove the inputs.
		for (var x = this.itemCount_-1; x >= 0; x--) {
			this.removeInput('ITEM' + x);
		}
		this.itemCount_ = 0;
		// Rebuild the block's optional inputs.
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		while (clauseBlock) {
			switch (clauseBlock.type) {
				case 'list_constructor_item':
					var itemInput = this.appendValueInput('ITEM' + this.itemCount_).appendField(new Blockly.FieldImage('img/blocks/item.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.itemCount_++;
					// Reconnect any child blocks.
					if (clauseBlock.valueConnection_) {
						itemInput.connection.connect(clauseBlock.valueConnection_);
					}
		 
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}
		//this.getInput('ITEMS').removeField('SEP'+(this.itemCount_-1));
		//this.getInput('ITEMS').appendField('}','SEP'+(this.itemCount_-1));
	},
	saveConnections: function(containerBlock) {
		// Store a pointer to any connected child blocks.
		var clauseBlock = containerBlock.getInputTargetBlock('STACK');
		var x = 0;
		while (clauseBlock) {
			switch (clauseBlock.type) {
				case 'list_constructor_item':
					var itemInput = this.getInput('ITEM' + x);
					clauseBlock.valueConnection_ = itemInput && itemInput.connection.targetConnection;
					x++;
					break;
				default:
					throw 'Unknown block type.';
			}
			clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
		}
	}
	};

Blockly.Blocks.list_constructor_constructor = {
	colour: PiBlocks.LANG_COLOUR_MATH,
	keys: ['LANG_VARIABLES_ARRAY','LANG_VARIABLES_ARRAY_TOOLTIP'],
	// Task.
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_MATH);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendStatementInput('STACK').setCheck('array_item');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR_TOOLTIP'));
		this.contextMenu = false;
	}
};

Blockly.Blocks.list_constructor_item = {
	colour: PiBlocks.LANG_COLOUR_MATH,
	// Task item.
	keys: ['LANG_VARIABLES_ARRAY_ITEM'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_MATH);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/item.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true,'array_item');
		this.setNextStatement(true,'array_item');
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_CONSTRUCTOR_ITEM_TOOLTIP'));
		this.contextMenu = false;
	}
};

Blockly.Python.list_sublist = function() {
	var list = Blockly.Python.valueToCode(this, 'LIST', Blockly.Python.ORDER_NONE);
	var range = Blockly.Python.valueToCode(this, 'RANGE', Blockly.Python.ORDER_NONE);
	//var from_value = this.getFieldValue('FROM');
	//var to_value = this.getFieldValue('TO');
	var code = list+range;
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.list_sublist = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	tags: ['text'],
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,	
	keys: ['LANG_LIST_SUBLIST_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendValueInput('LIST').appendField(new Blockly.FieldImage('img/blocks/list_out.svg',32*options.zoom,20*options.zoom)).setCheck('LIST').setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('RANGE').appendField(new Blockly.FieldImage('img/blocks/range.svg',20*options.zoom,20*options.zoom)).setCheck('RANGE').setAlign(Blockly.ALIGN_RIGHT);
		//this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/left_bracket.svg',6*options.zoom,20*options.zoom)).appendField(new Blockly.FieldNumber(0,0,Infinity,1),'FROM').appendField(new Blockly.FieldImage('img/blocks/colon.svg',6*options.zoom,20*options.zoom)).appendField(new Blockly.FieldNumber(0,0,Infinity,1),'TO').appendField(new Blockly.FieldImage('img/blocks/right_bracket.svg',6*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setOutput(true,String);
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_SUBLIST_TOOLTIP'));
	}
};

Blockly.Python.list_in_list = function() {
	var list = Blockly.Python.valueToCode(this, 'LIST', Blockly.Python.ORDER_NONE);
	var item = Blockly.Python.valueToCode(this, 'ITEM', Blockly.Python.ORDER_ATOMIC);
	var code = '('+item+' in '+list+')';
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.list_in_list = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_LIST'),
	tags: ['text'],
	category_colour: PiBlocks.LANG_COLOUR_LIST,
	colour: PiBlocks.LANG_COLOUR_LIST,	
	keys: ['LANG_LIST_IN_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_LIST);
		this.appendValueInput('ITEM').appendField(new Blockly.FieldImage('img/blocks/item.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('LIST').appendField(new Blockly.FieldImage('img/blocks/in.svg',12*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/list.svg',20*options.zoom,20*options.zoom)).setCheck('LIST').setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setOutput(true,Boolean);
		this.setTooltip(PiBlocks.locales.getKey('LANG_LIST_IN_TOOLTIP'));
	}
};

Blockly.Python.text = function() {
	var code = Blockly.Python.quote_(this.getFieldValue('TEXT'));
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.text = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
	category_colour: PiBlocks.LANG_COLOUR_TEXT,
	colour: PiBlocks.LANG_COLOUR_TEXT,		
	keys: ['LANG_TEXT_TEXT_TOOLTIP'],
	output: 'text',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_TEXT);
		//this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom,20*options.zoom)).appendField('"').appendField(new Blockly.FieldTextInput(''), 'TEXT').appendField('"');
		this.appendDummyInput().appendField("'").appendField(new Blockly.FieldTextInput(''), 'TEXT').appendField("'");
		this.setOutput(true, String);
		this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_TEXT_TOOLTIP'));
	}
};

Blockly.Python.text_join = function() {
	var code = '';
	var a;
	if (this.itemCount_ === 0) {
		return ['\'\'', Blockly.Python.ORDER_ATOMIC];
	} else if (this.itemCount_ === 1) {
		var argument0 = Blockly.Python.valueToCode(this, 'ADD0', Blockly.Python.ORDER_UNARY_POSTFIX) || '';

		code += argument0;
		return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
	} else {
		var i = (Blockly.Python.valueToCode(this, 'ADD0', Blockly.Python.ORDER_NONE) || '');
		var final_line = i;
		for (var n = 1; n < this.itemCount_; n++) {
			i = (Blockly.Python.valueToCode(this, 'ADD' + n, Blockly.Python.ORDER_NONE) || '');
			final_line += '+'+i;
		}
		code += final_line;
		return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
	}
};

Blockly.Blocks.text_join = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
	category_colour: PiBlocks.LANG_COLOUR_TEXT,
	colour: PiBlocks.LANG_COLOUR_TEXT,	
	keys: ['LANG_TEXT_JOIN_TOOLTIP'],
	output: 'text',
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_TEXT);
		this.appendValueInput('ADD0').appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('ADD1').appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setOutput(true,String);
		this.setMutator(new Blockly.Mutator(['text_create_join_item']));
		this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_JOIN_TOOLTIP'));
		this.itemCount_ = 2;
	},
	mutationToDom: function() {
		var container = document.createElement('mutation');
		container.setAttribute('items', this.itemCount_);
		return container;
	},
	domToMutation: function(xmlElement) {
		for (var x = 0; x < this.itemCount_; x++) {
			this.removeInput('ADD' + x);
		}
		this.itemCount_ = window.parseInt(xmlElement.getAttribute('items'), 10);
		for (x = 0; x < this.itemCount_; x++) {
			var input = this.appendValueInput('ADD' + x);
			if (x === 0) {
				input.appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
			}
			input.appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		}
		if (this.itemCount_ === 0) {
			this.appendDummyInput('EMPTY')
				.appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
					'media/quote0.png', 12, 12))
				.appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
					'media/quote1.png', 12, 12));
		}
	},
	decompose: function(workspace) {
		var containerBlock = workspace.newBlock('text_create_join_container');
		containerBlock.initSvg();
		var connection = containerBlock.getInput('STACK').connection;
		for (var x = 0; x < this.itemCount_; x++) {
			var itemBlock = workspace.newBlock('text_create_join_item');
			itemBlock.initSvg();
			connection.connect(itemBlock.previousConnection);
			connection = itemBlock.nextConnection;
		}
		return containerBlock;
	},
	compose: function(containerBlock) {
		if (this.itemCount_ === 0) {
			this.removeInput('EMPTY');
		} else {
			for (var x = this.itemCount_ - 1; x >= 0; x--) {
				this.removeInput('ADD' + x);
			}
		}
		this.itemCount_ = 0;
		var itemBlock = containerBlock.getInputTargetBlock('STACK');
		while (itemBlock) {
			var input = this.appendValueInput('ADD' + this.itemCount_);
			if (this.itemCount_ === 0) {
				input.appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
			}
			input.appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			if (itemBlock.valueConnection_) {
				input.connection.connect(itemBlock.valueConnection_);
			}
			this.itemCount_++;
			itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
		}
		if (this.itemCount_ === 0) {
			this.appendDummyInput('EMPTY')
				.appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
					'media/quote0.png', 12, 12))
				.appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
					'media/quote1.png', 12, 12));
		}
	},
	saveConnections: function(containerBlock) {
		var itemBlock = containerBlock.getInputTargetBlock('STACK');
		var x = 0;
		while (itemBlock) {
			var input = this.getInput('ADD' + x);
			itemBlock.valueConnection_ = input && input.connection.targetConnection;
			x++;
			itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
		}
	}
};

Blockly.Blocks.text_create_join_container = {
	colour: PiBlocks.LANG_COLOUR_TEXT,
	keys: ['LANG_TEXT_CREATE_JOIN_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_TEXT);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
		this.appendStatementInput('STACK').setCheck('text_join');
		this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_CREATE_JOIN_TOOLTIP'));
		this.contextMenu = false;
	}
};

Blockly.Blocks.text_create_join_item = {
	colour: PiBlocks.LANG_COLOUR_TEXT,
	keys: ['LANG_TEXT_CREATE_JOIN_ITEM_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_TEXT);
		this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom));
		this.setPreviousStatement(true,'text_join');
		this.setNextStatement(true,'text_join');
		this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_CREATE_JOIN_ITEM_TOOLTIP'));
		this.contextMenu = false;
	}
};
		
Blockly.Python.text_substring = function() {
	var string1 = Blockly.Python.valueToCode(this, 'STRING1', Blockly.Python.ORDER_NONE);
	var range = Blockly.Python.valueToCode(this, 'RANGE', Blockly.Python.ORDER_NONE);
	var code = string1+range;
	return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.text_substring = {
	category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
	tags: ['text'],
	category_colour: PiBlocks.LANG_COLOUR_TEXT,
	colour: PiBlocks.LANG_COLOUR_TEXT,	
	keys: ['LANG_TEXT_SUBSTRING','LANG_TEXT_SUBSTRING_FROM','LANG_TEXT_SUBSTRING_TO','LANG_TEXT_SUBSTRING_TOOLTIP'],
	init: function() {
		this.setColour(PiBlocks.LANG_COLOUR_TEXT);
		this.appendValueInput('STRING1').appendField(new Blockly.FieldImage('img/blocks/scissors_text.svg',24*options.zoom,18*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('RANGE').appendField(new Blockly.FieldImage('img/blocks/range.svg',20*options.zoom,20*options.zoom)).setCheck('RANGE').setAlign(Blockly.ALIGN_RIGHT);
		//this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/left_bracket.svg',6*options.zoom,20*options.zoom)).appendField(new Blockly.FieldNumber(0,0,Infinity,1),'FROM').appendField(new Blockly.FieldImage('img/blocks/colon.svg',6*options.zoom,20*options.zoom)).appendField(new Blockly.FieldNumber(0,0,Infinity,1),'TO').appendField(new Blockly.FieldImage('img/blocks/right_bracket.svg',6*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setOutput(true,String);
		this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_SUBSTRING_TOOLTIP'));
	}
};

        Blockly.Python.text_length = function() {
            var argument0 = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_length']({'argument0': argument0});
            return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_length = {
            // String length.
            category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: PiBlocks.LANG_COLOUR_TEXT,
			colour: PiBlocks.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck([String]).appendField(new Blockly.FieldImage('img/blocks/length.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, Number);
                this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_LENGTH_TOOLTIP'));
            }
        };
		
		Blockly.Python.text_equalsIgnoreCase = function() {
            var string1 = Blockly.Python.valueToCode(this, 'STRING1', Blockly.Python.ORDER_NONE);
            string1 = string1.replace(/&quot;/g, '"');
            var string2 = Blockly.Python.valueToCode(this, 'STRING2', Blockly.Python.ORDER_NONE);
            string2 = string2.replace(/&quot;/g, '"');
            var code = '';
            code += JST['text_equalsIgnoreCase']({
                'string1': string1,
                'string2': string2
            });

            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.text_equalsIgnoreCase = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: PiBlocks.LANG_COLOUR_TEXT,
			colour: PiBlocks.LANG_COLOUR_TEXT,	
			keys: ['LANG_TEXT_EQUALSIGNORECASE_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_TEXT);
                this.appendValueInput('STRING1').appendField(new Blockly.FieldImage('img/blocks/text_equal.svg',32*options.zoom,20*options.zoom));
                this.appendValueInput('STRING2').appendField('=').setAlign(Blockly.ALIGN_RIGHT);
                this.setInputsInline(true);
                this.setOutput(true,Boolean);
                this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_EQUALSIGNORECASE_TOOLTIP'));
            }
        };
		
		Blockly.Python.text_lower = function() {
            var argument0 = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_lower']({'argument0': argument0});
            return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_lower = {
            // String length.
            category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: PiBlocks.LANG_COLOUR_TEXT,
			colour: PiBlocks.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_LOWER_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck(String).appendField(new Blockly.FieldImage('img/blocks/upper2lower.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_LENGTH_LOWER_TOOLTIP'));
            }
        };
		
		Blockly.Python.text_upper = function() {
            var argument0 = Blockly.Python.valueToCode(this, 'VALUE', Blockly.Python.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_upper']({'argument0': argument0});
            return [code, Blockly.Python.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_upper = {
            // String length.
            category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: PiBlocks.LANG_COLOUR_TEXT,
			colour: PiBlocks.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_UPPER_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck(String).appendField(new Blockly.FieldImage('img/blocks/lower2upper.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_LENGTH_UPPER_TOOLTIP'));
            }
        };
		
		Blockly.Python.text_to_number = function() {
            var str = Blockly.Python.valueToCode(this,'STRING', Blockly.Python.ORDER_NONE);
			var code='';
			code = str+'.toFloat()';
            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.text_to_number = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_TEXT'),
			category_colour: PiBlocks.LANG_COLOUR_TEXT,
			colour: PiBlocks.LANG_COLOUR_TEXT,	
			keys: ['LANG_TEXT_NUMBER_CAST_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_TEXT);
                this.appendValueInput('STRING').appendField(new Blockly.FieldImage('img/blocks/tonumber.svg',64*options.zoom,20*options.zoom));
                this.setOutput(true);
                this.setTooltip(PiBlocks.locales.getKey('LANG_TEXT_NUMBER_CAST_TOOLTIP'));
            }
        };
		
		Blockly.Python.inout_digital_read = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Python.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.inout_digital_read = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: PiBlocks.LANG_COLOUR_ADVANCED,
			colour: PiBlocks.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_DIGITAL_READ_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('PIN').appendField(new Blockly.FieldImage('img/blocks/read.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.setOutput(true, Boolean);
                this.setInputsInline(true);
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_INOUT_DIGITAL_READ_TOOLTIP'));
            }
        };
			
        Blockly.Python.inout_digital_write = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var dropdown_stat = Blockly.Python.valueToCode(this, 'STAT', Blockly.Python.ORDER_ATOMIC);
            var code = '';
            Blockly.Python.setups_['setup_digital_write_' + dropdown_pin] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin});
            code += 'digitalWrite('+dropdown_pin+','+dropdown_stat+')\n';
            return code;
        };

        Blockly.Blocks.inout_digital_write = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: PiBlocks.LANG_COLOUR_ADVANCED,
			colour: PiBlocks.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_DIGITAL_WRITE_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/write.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendValueInput('STAT').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'code');
                this.setInputsInline(true);
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_INOUT_DIGITAL_WRITE_TOOLTIP'));
            }
        };
		
		Blockly.Python.serial_println = function() {
            var content = Blockly.Python.valueToCode(this, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
            var code = '';
            Blockly.Python.setups_['setup_serial'] = JST['serial_setups']({'bitrate': profiles.default.serial});
            code += 'Serial.println(' + content+');\n';
            return code;
        };

        Blockly.Blocks.serial_println = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_PRINTLN_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendValueInput('CONTENT', String).appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/printer.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_SERIAL_PRINTLN_TOOLTIP'));
            }
        };

        Blockly.Python.serial_available = function() {
            var branch = Blockly.Python.statementToCode(this, 'DO');
            branch = branch.replace(/&quot;/g, '"');
            Blockly.Python.setups_['setup_serial'] = JST['serial_setups']({
                'bitrate': profiles.default.serial
            });
            var code = JST['serial_available']({
                'branch': branch
            });
            return code;
        };

        Blockly.Blocks.serial_available = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_AVAILABLE_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/available.svg',20*options.zoom, 20*options.zoom));
                this.appendStatementInput('DO').appendField(new Blockly.FieldImage('img/blocks/do.svg', 16*options.zoom, 16*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_SERIAL_AVAILABLE_TOOLTIP'));
            }
        };
		
        Blockly.Python.serial_parsefloat = function() {
            Blockly.Python.setups_['setup_serial'] = JST['serial_setups']({
                'bitrate': profiles.default.serial
            });
            var code = 'Serial.parseFloat()';

            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.serial_parsefloat = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_PARSE_NUMBER_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom, 20*options.zoom));
                this.setOutput(true, Number);
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_SERIAL_PARSE_NUMBER_TOOLTIP'));
            }
        };

        Blockly.Python.serial_readstring = function() {

            Blockly.Python.setups_['setup_serial'] = JST['serial_setups']({
                'bitrate': profiles.default.serial
            });
            var code = 'Serial.readString()';

            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.serial_readstring = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_READSTRING_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom, 20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(PiBlocks.locales.getKey('LANG_ADVANCED_SERIAL_READSTRING_TOOLTIP'));
            }
        };
        
		
        Blockly.Python.button = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Python.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
            code += 'digitalRead(' +dropdown_pin+')';
            return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.button = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: PiBlocks.LANG_COLOUR_ADVANCED,
			colour: PiBlocks.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.setOutput(true, Boolean);
                this.setTooltip(PiBlocks.locales.getKey('LANG_BQ_BUTTON_TOOLTIP'));
            }
        };

        Blockly.Python.button_case = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Python.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
			var code_pressed = '';
			var code_not_pressed = '';
			code_pressed += Blockly.Python.statementToCode(this, 'PRESSED');
			code_not_pressed += Blockly.Python.statementToCode(this, 'NOT_PRESSED');
			code_pressed = code_pressed.replace(/&quot;/g, '"');
			code_not_pressed = code_not_pressed.replace(/&quot;/g, '"');

            code += 'if ('+'digitalRead(' +dropdown_pin+')==LOW){\n'+code_pressed+'\n}\nelse{\n'+code_not_pressed+'\n}\n';
            return code;
        };
        Blockly.Blocks.button_case = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: PiBlocks.LANG_COLOUR_ADVANCED,
			colour: PiBlocks.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendStatementInput('PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/pushbutton_pressed.svg',20*options.zoom, 20*options.zoom));
                this.appendStatementInput('NOT_PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/pushbutton_release.svg',20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BQ_BUTTON_TOOLTIP'));
            }
        };
		
		Blockly.Python.button_long_short = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Python.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
			Blockly.Python.definitions_['declare_var_button_active_'+dropdown_pin]='boolean _buttonActive_'+dropdown_pin+'=false;\n';
			Blockly.Python.definitions_['declare_var_long_press_active_'+dropdown_pin]='boolean _longPressActive_'+dropdown_pin+'=false;\n';
			Blockly.Python.definitions_['declare_var_button_timer_'+dropdown_pin]='long _buttonTimer_'+dropdown_pin+'=0;\n';	

			var code_long_pressed = '';
			var code_short_pressed = '';
			code_long_pressed += Blockly.Python.statementToCode(this, 'LONG_PRESSED');
			code_short_pressed += Blockly.Python.statementToCode(this, 'SHORT_PRESSED');

			code_long_pressed = code_long_pressed.replace(/&quot;/g, '"');
			code_short_pressed = code_short_pressed.replace(/&quot;/g, '"');

			code+='if (digitalRead('+dropdown_pin+')==LOW) {\n    if (_buttonActive_'+dropdown_pin+'==false) {\n      _buttonActive_'+dropdown_pin+'=true;\n      _buttonTimer_'+dropdown_pin+'=millis();\n    }\n    if ((millis()-_buttonTimer_'+dropdown_pin+'>1000)&&(_longPressActive_'+dropdown_pin+'==false)){\n      _longPressActive_'+dropdown_pin+'=true;\n'+code_long_pressed+'\n}\n  }\n else {\n    if (_buttonActive_'+dropdown_pin+'== true){\n      if (_longPressActive_'+dropdown_pin+'==true){\n        _longPressActive_'+dropdown_pin+'=false;\n      }\n else  if (millis()-_buttonTimer_'+dropdown_pin+'>100){\n'+code_short_pressed+'\n}\n      _buttonActive_'+dropdown_pin+'=false;\n    }\n  }\n';
			return code;
        };
        Blockly.Blocks.button_long_short = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: PiBlocks.LANG_COLOUR_ADVANCED,
			colour: PiBlocks.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_LONG_SHORT_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendStatementInput('LONG_PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/cursor.svg', 20*options.zoom, 20*options.zoom));
                this.appendStatementInput('SHORT_PRESSED').setAlign(Blockly.ALIGN_RIGHT).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/cursor1.svg', 20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
				this.setInputsInline(false);
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BQ_BUTTON_LONG_SHORT_TOOLTIP'));
            }
        };
		
		Blockly.Python.bluetooth_def = function() {
            var dropdown_pin, NextPIN;
            
            dropdown_pin =this.getFieldValue('PIN');
            NextPIN = this.getFieldValue('PIN2');
            var a = PiBlocks.findPinMode(dropdown_pin);
            Blockly.Python.setups_['setup_softwareserial_pinmode'] = a['code'];
            dropdown_pin = a['pin'];
            a = PiBlocks.findPinMode(NextPIN);
            Blockly.Python.setups_['setup_softwareserial_pinmode2'] = a['code'];
            NextPIN = a['pin'];
            var baud_rate = 9600;
			Blockly.Python.definitions_['declare_var_SoftwareSerial' + dropdown_pin] = 'SoftwareSerial _bt_softwareSerial(' + dropdown_pin + ',' + NextPIN + ');\n';
            Blockly.Python.definitions_['define_softwareserial'] = JST['softwareserial_def_definitions']({});
			Blockly.Python.setups_['setup_softwareserial_'] = JST['bt_softwareserial_def_setups']({'baud_rate': baud_rate});
            return '';
        };
		
        Blockly.Blocks.bluetooth_def = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_DEF_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/bluetooth.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/setup.svg', 20*options.zoom, 20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/rx.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/tx.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN2');
				this.setFieldValue('3','PIN2');
				this.setInputsInline(true);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BLUETOOTH_DEF_TOOLTIP'));
            }
        };

    Blockly.Python.bluetooth_app = function()
	{
            var n = 1;
            var argument, branch, case2_argument,case2_code;
            var code = 'if (_bt_softwareSerial.available()>0)\n{\n';
        code += '  int cmd=_bt_softwareSerial.read();\n';
        for (n = 1; n <= this.itemCount_; n++) {
            argument = Blockly.Python.valueToCode(this, 'DATA' + n, Blockly.Python.ORDER_NONE);
			branch = Blockly.Python.statementToCode(this, 'ITEM' + n);
            branch = PiBlocks.increaseIndent(branch);
            branch = branch.substring(0, branch.length - 1);
            code += '     \n  if (cmd=='+argument+'){\n    _bt_cmd=0;\n'+branch+'  }';
        }
        return code+'\n}\n';
        };

        Blockly.Blocks.bluetooth_app = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_APP_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/bluetooth.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/smartphoneC.svg", 20*options.zoom, 20*options.zoom));
				this.setMutator(new Blockly.Mutator(['bluetooth_app_item']));
				this.itemCount_ = 0;
				this.setInputsInline(false);
				this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BLUETOOTH_APP_TOOLTIP'));
            },
			mutationToDom: function() {
                if (!this.itemCount_ ) {
                    return null;
                }
                var container = document.createElement('mutation');
                if (this.itemCount_) {
                    container.setAttribute('item', this.itemCount_);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.itemCount_ = window.parseInt(xmlElement.getAttribute('item'), 10);
                for (var x = 1; x <= this.itemCount_; x++) {
					this.appendValueInput('DATA' + x).setCheck(Number).appendField(new Blockly.FieldImage("img/blocks/byte.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                    this.setInputsInline(false);
					this.appendStatementInput('ITEM' + x).appendField(new Blockly.FieldImage('img/blocks/do.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                }
            },
            decompose: function(workspace) {
                var containerBlock = workspace.newBlock('bluetooth_app_app');
                containerBlock.initSvg();
                var connection = containerBlock.getInput('STACK').connection;
                for (var x = 1; x <= this.itemCount_; x++) {
                    var itemBlock = workspace.newBlock('bluetooth_app_item');
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }
                return containerBlock;
            },
            compose: function(containerBlock) {
                for (var x = this.itemCount_; x > 0; x--) {
                    this.removeInput('DATA' + x);
                    this.removeInput('ITEM' + x);
                }
                this.itemCount_ = 0;
                // Rebuild the block's optional inputs.
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'bluetooth_app_item':
                            this.itemCount_++;
							this.setInputsInline(false);
                            var dataInput = this.appendValueInput('DATA' + this.itemCount_).setCheck(Number).appendField(new Blockly.FieldImage("img/blocks/byte.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
							var itemInput = this.appendStatementInput('ITEM' + this.itemCount_).appendField(new Blockly.FieldImage('img/blocks/do.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                            // Reconnect any child blocks.
                            if (clauseBlock.valueConnection_) {
                                dataInput.connection.connect(clauseBlock.valueConnection_);
                            }
                            if (clauseBlock.statementConnection_) {
                                itemInput.connection.connect(clauseBlock.statementConnection_);
                            }
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
                }
            },
            saveConnections: function(containerBlock) {
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                var x = 1;
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'bluetooth_app_item':
                            var inputData = this.getInput('DATA' + x);
							var inputItem = this.getInput('ITEM' + x);
                            clauseBlock.valueConnection_ =
                                inputData && inputData.connection.targetConnection;
                            clauseBlock.statementConnection_ =
                                inputItem && inputItem.connection.targetConnection;
                            x++;
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
                }
            }
        };
		
		Blockly.Blocks.bluetooth_app_app = {
            // App
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_APP_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/bluetooth.svg",12*options.zoom,12*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/inbox.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/smartphoneC.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput('STACK').setCheck('bt_item');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BLUETOOTH_APP_TOOLTIP'));
                this.contextMenu = false;
            }
        };
    
		Blockly.Blocks.bluetooth_app_item = {
			colour: PiBlocks.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_COMMAND_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/byte.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'bt_item');
                this.setNextStatement(true,'bt_item');
                this.setTooltip(PiBlocks.locales.getKey('LANG_BLUETOOTH_COMMAND_TOOLTIP'));
        this.contextMenu = false;
            }
        };

    Blockly.Python.distance_us = function() {	
		Blockly.Python.definitions_['include_us'] = JST['distance_us_definitions_include']({});
		Blockly.Python.definitions_['define_us_pulseIn'] = JST['distance_us_definitions_pulseIn']({});
        Blockly.Python.definitions_['define_us_init'] = JST['distance_us_definitions_us_init']({});
        Blockly.Python.definitions_['define_us_distance'] = JST['distance_us_definitions_distance']({});
		var code = '';
		var echo_pin = this.getFieldValue('RED_PIN');
        var trigger_pin = this.getFieldValue('BLUE_PIN');
		Blockly.Python.setups_['setup_us_' + echo_pin + trigger_pin] = JST['distance_us_setups_echo']({'echo_pin': echo_pin});
		Blockly.Python.setups_['setup_us_2' + trigger_pin + echo_pin] = JST['distance_us_setups_trigger']({'trigger_pin': trigger_pin});
		code += JST['distance_us']({'trigger_pin': trigger_pin,'echo_pin': echo_pin});
		return [code, Blockly.Python.ORDER_ATOMIC];
        };
		
        Blockly.Blocks.distance_us = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_DISTANCE'),
            category_colour: PiBlocks.LANG_COLOUR_DISTANCE,
			colour: PiBlocks.LANG_COLOUR_DISTANCE,
			keys: ['LANG_US_ECHO_PIN','LANG_US_TRIGGER_PIN','LANG_US_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_DISTANCE);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/ultrasound.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/hc_sr04.svg',36*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/hearing.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'RED_PIN');
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaking.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'BLUE_PIN');
				this.setFieldValue('3','BLUE_PIN');
				this.setInputsInline(true);
                this.setOutput(true, Number);
                this.setTooltip(PiBlocks.locales.getKey('LANG_US_TOOLTIP'));
            }
        };

    Blockly.Python.distance_us_collision = function() {
		Blockly.Python.definitions_['include_us'] = JST['distance_us_definitions_include']({});
		Blockly.Python.definitions_['define_us_pulseIn'] = JST['distance_us_definitions_pulseIn']({});
        Blockly.Python.definitions_['define_us_init'] = JST['distance_us_definitions_us_init']({});
        Blockly.Python.definitions_['define_us_distance'] = JST['distance_us_definitions_distance']({});
		var echo_pin = this.getFieldValue('RED_PIN');
        var trigger_pin = this.getFieldValue('BLUE_PIN');
        var distance = Blockly.Python.valueToCode(this, 'DISTANCE', Blockly.Python.ORDER_ATOMIC);
        var collision = Blockly.Python.statementToCode(this,'COLLISION') || '';
        var not_collision = Blockly.Python.statementToCode(this,'NOT_COLLISION') || '';
        var code = '';
		Blockly.Python.setups_['setup_us_' + echo_pin + trigger_pin] = JST['distance_us_setups_echo']({'echo_pin': echo_pin});
		Blockly.Python.setups_['setup_us_2' + trigger_pin + echo_pin] = JST['distance_us_setups_trigger']({'trigger_pin': trigger_pin});
		code += JST['distance_us_collision']({'trigger_pin': trigger_pin,'echo_pin': echo_pin,'distance': distance,'collision': collision,'not_collision': not_collision});
        return code;
        };

    Blockly.Blocks.distance_us_collision = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_DISTANCE'),
            category_colour: PiBlocks.LANG_COLOUR_DISTANCE,
			colour: PiBlocks.LANG_COLOUR_DISTANCE,
			keys: ['LANG_US_COLLISION_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_DISTANCE);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/ultrasound.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/hc_sr04.svg',36*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/hearing.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'RED_PIN');
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaking.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'BLUE_PIN');
				this.setFieldValue('3','BLUE_PIN');
				this.appendValueInput('DISTANCE').appendField(new Blockly.FieldImage('img/blocks/distance.svg',20*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput('COLLISION').appendField(new Blockly.FieldImage('img/blocks/rear-end-collision.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
        this.appendStatementInput('NOT_COLLISION').appendField(new Blockly.FieldImage('img/blocks/no-collision.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
        this.setInputsInline(true);
        this.setPreviousStatement(true,'code');
            this.setNextStatement(true,'code');
                this.setTooltip(PiBlocks.locales.getKey('LANG_US_COLLISION_TOOLTIP'));
            }
        };
				
			Blockly.Python.infrared_digital = function() {
				var dropdown_pin = this.getFieldValue('PIN');
				var code = '';
				Blockly.Python.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
				code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
				return [code, Blockly.Python.ORDER_ATOMIC];
			};


			Blockly.Blocks.infrared_digital = {
				category: PiBlocks.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: PiBlocks.LANG_COLOUR_LIGHT,
				colour: PiBlocks.LANG_COLOUR_LIGHT,
				keys: ['LANG_INFRARED_DIGITAL_TOOLTIP'],
				output: 'boolean',
				init: function() {
					this.setColour(PiBlocks.LANG_COLOUR_LIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/light_diode.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/TCRT5000.svg', 48*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.setOutput(true, Boolean);
					this.setTooltip(PiBlocks.locales.getKey('LANG_INFRARED_DIGITAL_TOOLTIP'));
				}
			};
		
		Blockly.Python.piezo_buzzer_predef_sounds = function() {
			var dropdown_pin = this.getFieldValue('PIN');
			var code= '';
			var pin='';
			Blockly.Python.definitions_['define_simpleexpressions_buzzer_tone_'+dropdown_pin]='void _tone(int buzzerPin, float noteFrequency, long noteDuration, int silentDuration){\n  tone(buzzerPin, noteFrequency, noteDuration);\n  delay(noteDuration);\n  delay(silentDuration);\n}\n';
			Blockly.Python.definitions_['define_simpleexpressions_buzzer_bendtones_'+dropdown_pin]='void bendTones (int buzzerPin, float initFrequency, float finalFrequency, float prop, long noteDuration, int silentDuration){\n  if(initFrequency < finalFrequency){\n    for (int i=initFrequency; i<finalFrequency; i=i*prop) {\n      _tone(buzzerPin,i,noteDuration,silentDuration);\n    }\n  }  else{\n    for (int i=initFrequency; i>finalFrequency; i=i/prop) {\n      _tone(buzzerPin,i,noteDuration,silentDuration);\n}\n}\n}\n';
			pin = dropdown_pin+',';
			var option=this.getFieldValue('OPTION');
			if (option==='0')
				code+='_tone('+pin+'659.26,50,30);\n_tone('+pin+'1318.51,55,25);\n_tone('+pin+'1760,60,10);\n';
			else if (option==='1')
				code+='_tone('+pin+'659.26,50,30);\n_tone('+pin+'1760,55,25);\n_tone('+pin+'1318.51,50,10);\n';
			else if (option==='2')
				code+='bendTones('+pin+'1318.51, 1567.98, 1.03, 20, 2);\ndelay(30);\nbendTones('+pin+'1318.51, 2349.32, 1.04, 10, 2);\n';
			else if (option==='3')
				code+='bendTones('+pin+'1318.51, 1760, 1.02, 30, 10);\n';
			else if (option==='4')
				code+='bendTones('+pin+'1567.98, 2349.32, 1.03, 30, 10);\n';
			else if (option==='5')
				code+='_tone('+pin+'1318.51,50,100);\n_tone('+pin+'1567.98,50,80);\n_tone('+pin+'2349.32,300,1);\n';
            return code;
        };
		
		Blockly.Blocks.piezo_buzzer_predef_sounds = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: PiBlocks.LANG_COLOUR_SOUND,
			colour: PiBlocks.LANG_COLOUR_SOUND,
			keys: ['LANG_PIEZO_BUZZER','LANG_PIEZO_BUZZER_PIN','LANG_PIEZZO_BUZZER_PREDEF_CONNECTION','LANG_PIEZZO_BUZZER_PREDEF_DISCONNECTION','LANG_PIEZZO_BUZZER_PREDEF_BUTTON_PUSHED','LANG_PIEZZO_BUZZER_PREDEF_MODE1','LANG_PIEZZO_BUZZER_PREDEF_MODE2','LANG_PIEZZO_BUZZER_PREDEF_MODE3','LANG_PIEZO_BUZZER_PREDEF_SOUNDS_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_SOUND);
				var opt = new Blockly.FieldDropdown([
                        [PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_CONNECTION'), '0'],
						[PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_DISCONNECTION'), '1'],
                        [PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_BUTTON_PUSHED'), '2'],
						[PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE1'), '3'],
                        [PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE2'), '4'],
						[PiBlocks.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE3'), '5']
                    ]);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaker.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/musical-note.svg',20*options.zoom,20*options.zoom)).appendField(opt, 'OPTION').setAlign(Blockly.ALIGN_RIGHT);
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(PiBlocks.locales.getKey('LANG_PIEZO_BUZZER_PREDEF_SOUNDS_TOOLTIP'));
            }
        };
		
		Blockly.Python.piezo_buzzer_melody = function() {
			var dropdown_pin = this.getFieldValue('PIN');
			var code ='';
			
			if (this.getInputTargetBlock('MELODY')===null)
				return code;
			
			var melody = Blockly.Python.valueToCode(this, 'MELODY', Blockly.Python.ORDER_ATOMIC).substring(1);
			var s = melody.replace(',','');
			var enc='_melody'+this.NumMelodies;
			melody = melody.substring(0,melody.length-1);
			Blockly.Python.definitions_['declare_var_play_melody'+enc] = 'const uint16_t '+enc+'[] = {'+melody+'};\n';
			Blockly.Python.definitions_['define_play_melody'] = JST['music_definitions_play_melody']({});
			code += JST['music_play_melody']({'pin': dropdown_pin,'melody': enc});
			return code;
        };


        Blockly.Blocks.piezo_buzzer_melody = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: PiBlocks.LANG_COLOUR_SOUND,
			colour: PiBlocks.LANG_COLOUR_SOUND,
			keys: ['LANG_PIEZO_BUZZER_MELODY_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_SOUND);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaker.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('MELODY').appendField(new Blockly.FieldImage('img/blocks/clef.svg',20*options.zoom,20*options.zoom)).setCheck(['MELODY','NOTE']).setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(true);
				this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
				PiBlocks.NumMelodies=PiBlocks.NumMelodies+1;
				this.NumMelodies=PiBlocks.NumMelodies;
                this.setTooltip(PiBlocks.locales.getKey('LANG_PIEZO_BUZZER_MELODY_TOOLTIP'));
            },
			onchange: function()
			{
				if (this!==undefined)
					Blockly.Python.play_melody='';
			}
        };

		function noteCreator(item,index){
			var duration,note;
			if (item.duration==='redonda')
				duration='1500';
			else if (item.duration==='blanca')
				duration='750';
			else if (item.duration==='negra')
				duration='375';
			else if (item.duration==='corchea')
				duration='187';
			else if (item.duration==='semicorchea')
				duration='93';
			if (item.note==='silencio')
				note='0';
			else if (item.note==='do')
				note='262';
			else if (item.note==='re')
				note='294';
			else if (item.note==='mi')
				note='330';
			else if (item.note==='fa')
				note='349';
			else if (item.note==='sol')
				note='392';
			else if (item.note==='la')
				note='440';
			else if (item.note==='si')
				note='494';
			var note_name=item.note+'_'+item.duration;
			Blockly.Python['piezo_music_'+note_name] = function() {
				var melody = Blockly.Python.valueToCode(this, 'MELODY', Blockly.Python.ORDER_ATOMIC) || '';
				code = ','+note+','+duration+melody;
				return [code, Blockly.Python.ORDER_ATOMIC];
			};
			var note_path = 'img/blocks/'+note_name+'.svg';
			Blockly.Blocks['piezo_music_'+note_name] = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: PiBlocks.LANG_COLOUR_SOUND,
			colour: PiBlocks.LANG_COLOUR_SOUND,
			keys: ['LANG_MUSIC_NOTE_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_SOUND);
                this.appendValueInput('MELODY').appendField(new Blockly.FieldImage(note_path,32*options.zoom,48*options.zoom)).setCheck('NOTE').setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(false);
				this.setOutput(true,'NOTE');
                this.setTooltip(PiBlocks.locales.getKey('LANG_MUSIC_NOTE_TOOLTIP'));
				}
			};
		}
		

		var d_alt=["redonda","blanca","negra","corchea","semicorchea"];
		var n_alt=["do","re","mi","fa","sol","la","si"];

		var notes=[{note: 'silencio',duration: 'redonda'},
				   {note: 'silencio',duration: 'blanca'},
				   {note: 'silencio',duration: 'negra'},
				   {note: 'silencio',duration: 'corchea'},
				   {note: 'silencio',duration: 'semicorchea'}];
				   
		var notes_counter=notes.length;		
		n_alt.forEach(function (ni){				
				d_alt.forEach(function (di){
					notes[notes_counter]={note: ni, duration: di};
					notes_counter=notes_counter+1;
				});
		});
		
		notes.forEach(noteCreator);

    Blockly.Python.piezo_music_end = function() {
        var code = ';';
        return [code, Blockly.Python.ORDER_ATOMIC];
        };

        Blockly.Blocks.piezo_music_end = {
            category: PiBlocks.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: PiBlocks.LANG_COLOUR_SOUND,
			colour: PiBlocks.LANG_COLOUR_SOUND,
			keys: ['LANG_MUSIC_NOTE_TOOLTIP'],
            init: function() {
                this.setColour(PiBlocks.LANG_COLOUR_SOUND);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/end.svg',32*options.zoom,48*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setInputsInline(false);
				this.setOutput(true,'NOTE');
                this.setTooltip(PiBlocks.locales.getKey('LANG_MUSIC_NOTE_TOOLTIP'));
            }
        };
		
			Blockly.Python.dc_motor1 = function() {
				var dropdown_pin1 = this.getFieldValue('PIN1');
				var dropdown_pin2 = this.getFieldValue('PIN2');
				var value_dir = this.getFieldValue('ROT');
				var value_speed = Blockly.Python.valueToCode(this, 'SPEED', Blockly.Python.ORDER_ATOMIC);
				var code = '';
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pin1] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin1});
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pin2] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin2});
				code += '  {\n';
				code +='    int _speed = ((((int)('+value_speed+'))*255)/100);\n';
				code +='    if (_speed>0){\n';
				code +='      analogWrite('+dropdown_pin1+',_speed);\n';
				code +='      digitalWrite('+dropdown_pin2+',0);\n';
				code +='    }\n';
				code +='    else if (_speed<0){\n';
				code +='       digitalWrite('+dropdown_pin1+',0);\n';
				code +='       analogWrite('+dropdown_pin2+',_speed);\n';
				code +='    }\n';
				code +='    else{\n';
				code +='      digitalWrite('+dropdown_pin1+',1);\n';
				code +='      digitalWrite('+dropdown_pin2+',1);\n';
				code +='    }\n';
				code += '  }\n';
				return code;
			};

			Blockly.Blocks.dc_motor1 = {
				category: PiBlocks.locales.getKey('LANG_CATEGORY_MOVEMENT'),
				category_colour: PiBlocks.LANG_COLOUR_MOVEMENT,
				colour: PiBlocks.LANG_COLOUR_MOVEMENT,
				keys: ['LANG_SERVO_DC_MOTOR_TOOLTIP'],
				init: function() {
					this.setColour(PiBlocks.LANG_COLOUR_MOVEMENT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/engine.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/one.svg',12*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/pwm_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.pwm),'PIN1');
					this.appendDummyInput('').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/two.svg',12*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/pwm_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.pwm),'PIN2');
					this.appendValueInput('SPEED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/speedometer.svg', 20*options.zoom, 20*options.zoom));
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/percent.svg',20*options.zoom,20*options.zoom));
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setInputsInline(true);
					this.setTooltip(PiBlocks.locales.getKey('LANG_SERVO_DC_MOTOR_TOOLTIP'));
					this.setFieldValue('5','PIN2');
				},
				isVariable: function(varValue) {
					for (var i in Blockly.Variables.allUsedVariables) {
						if (Blockly.Variables.allUsedVariables[i] === varValue) {
							return true;
						}
					}
					return false;
				}
			};
		
			Blockly.Python.red_green_led = function() {
				var code = '';
				var dropdown_pinR = this.getFieldValue('PIN_R');
				var dropdown_pinG = this.getFieldValue('PIN_G');
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pinR] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinR});
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pinG] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinG});
				var color = this.getFieldValue('COLOR') || '#000000';
				if (color === '#000000')
				{				
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ff0000')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				}
				return code;
			};

			Blockly.Blocks.red_green_led = {
				category: PiBlocks.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: PiBlocks.LANG_COLOUR_LIGHT,
				colour: PiBlocks.LANG_COLOUR_LIGHT,
				keys: ['LANG_RG_LED_TOOLTIP'],
				//rgb led initialization
				init: function() {
					this.setColour(PiBlocks.LANG_COLOUR_LIGHT);
					var colour = new Blockly.FieldColour('#000000');
					colour.setColours(['#000000','#FF0000','#00FF00']).setColumns(3);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/diode_led.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_red.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_R');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_green.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_G');
					this.setFieldValue('D3','PIN_G');
					this.appendDummyInput('').appendField(' ').appendField(colour,'COLOR');
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(PiBlocks.locales.getKey('LANG_RG_LED_TOOLTIP'));
				}
			};
		
			Blockly.Python.rgb_led = function() {
				var code = '';
				var dropdown_pinR = this.getFieldValue('PIN_R');
				var dropdown_pinG = this.getFieldValue('PIN_G');
				var dropdown_pinB = this.getFieldValue('PIN_B');
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pinR] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinR});
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pinG] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinG});
				Blockly.Python.setups_['setup_digital_write_' + dropdown_pinB] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinB});
				var color = this.getFieldValue('COLOR') || '#000000';
				if (color === '#000000')
				{				
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ffffff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#ff0000')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ffff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ffff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#0000ff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#ff00ff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				return code;
			};

			Blockly.Blocks.rgb_led = {
				category: PiBlocks.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: PiBlocks.LANG_COLOUR_LIGHT,
				colour: PiBlocks.LANG_COLOUR_LIGHT,
				keys: ['LANG_RGB_LED_TOOLTIP'],
				//rgb led initialization
				init: function() {
					this.setColour(PiBlocks.LANG_COLOUR_LIGHT);
					var colour = new Blockly.FieldColour('#000000');
					colour.setColours(['#000000','#FFFFFF','#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF']).setColumns(2);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/diode_led.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_red.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_R');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_green.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_G');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_blue.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_B');
					this.setFieldValue('D3','PIN_G');
					this.setFieldValue('D4','PIN_B');
					this.appendDummyInput('').appendField(' ').appendField(colour,'COLOR');
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(PiBlocks.locales.getKey('LANG_RGB_LED_TOOLTIP'));
				}
			};

		
			Blockly.Python['led_strip'] = function(block) {
			  var pixels = Blockly.Python.valueToCode(this,'PIXELS',Blockly.Python.ORDER_ATOMIC) || '';
			  var input_pin = this.getFieldValue('PIN');
			  Blockly.Python.definitions_['define_neopixel_h'] = '#include <Adafruit_NeoPixel.h>';
			  Blockly.Python.definitions_['define_avr_power_h'] = '#ifdef __AVR__\n  #include <avr/power.h>\n#endif';
			  Blockly.Python.definitions_['declare_var_led_strip_'+input_pin]='Adafruit_NeoPixel _led_strip_'+input_pin+'('+pixels+','+input_pin+', NEO_GRB + NEO_KHZ800);\n';

			  Blockly.Python.setups_['setup_simpleexpressions_led_strip'+input_pin] = '_led_strip_'+input_pin+'.begin();\n  clearpixels_'+input_pin+'();\n  _led_strip_'+input_pin+'.setBrightness(map(10,0,100,0,255));\n';
			  
			  Blockly.Python.definitions_['define_clearpixels'+input_pin]='void clearpixels_'+input_pin+'()\n{\n  uint16_t n=_led_strip_'+input_pin+'.numPixels();\n  for(uint16_t i = 0; i < n; i++) {\n    _led_strip_'+input_pin+'.setPixelColor(i, 0);\n  }\n  delay(1);\n}\n';
			  Blockly.Python.definitions_['define_writepixel'+input_pin]='void writepixel_'+input_pin+'(uint16_t pixel, int r, int g, int b)\n{ _led_strip_'+input_pin+'.setPixelColor(pixel, _led_strip_'+input_pin+'.Color(r, g, b));\n  _led_strip_'+input_pin+'.show();\n}\n';
			  var code ='';
			  
			  try{
			    for (var i=0;i<pixels;i++)
				  {
					  var input_color = this.getFieldValue('COLOR'+i);
					  var color_rgb=PiBlocks.hexToRgb(input_color);
					  code+='writepixel_'+input_pin+'('+i+','+color_rgb.r +','+color_rgb.g+','+color_rgb.b+');\n';
				  }
			  }
			  catch(e)
			  {}
			  return code;
			};
			
			Blockly.Blocks['led_strip'] = {
			  category: PiBlocks.locales.getKey('LANG_CATEGORY_LIGHT'),
			  category_colour: PiBlocks.LANG_COLOUR_LIGHT,
			  colour: PiBlocks.LANG_COLOUR_LIGHT,
			  keys: ['LANG_SIMPLEEXPRESSIONS_LED_STRIP_TOOLTIP'],
			  init: function() {
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/led_strip.svg',20*options.zoom,20*options.zoom));
				this.appendDummyInput('PIN').appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('PIXELS').appendField(new Blockly.FieldImage('img/blocks/led_pixel.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck(Number);
				this.setPreviousStatement(true,'code');
				this.setNextStatement(true,'code');
				this.setInputsInline(true);
				this.setColour(PiBlocks.LANG_COLOUR_LIGHT);
				this.setTooltip(PiBlocks.locales.getKey('LANG_SIMPLEEXPRESSIONS_LED_STRIP_TOOLTIP'));
				this.numPixels=0;
			  },
			  onchange: function() {
				  var numLEDPixels = this.getInputTargetBlock('PIXELS');
				  if (numLEDPixels!==null)
				  {
					  if (numLEDPixels.type==='math_number')
					  {
						  if (numLEDPixels.getFieldValue('NUM')!==this.numPixels)
						  {
							  this.numPixels=numLEDPixels.getFieldValue('NUM');
							  for (var i=0;i<this.numPixels;i++)
							  {
								  try{
									  this.removeField('COLOR'+i);
								  }
								  catch(e)
								  {
								  }
								  var colour = new Blockly.FieldColour('#000000');
								  colour.setColours(['#000000','#808080','#C0C0C0','#FFFFFF','#800000','#FF0000','#808000','#FFFF00','#008000','#00FF00','#008080','#00FFFF','#000080','#0000FF','#800080','#FF00FF']).setColumns(4);
								  this.appendDummyInput('').appendField(colour,'COLOR'+i).setAlign(Blockly.ALIGN_RIGHT);
							  }
						  }
					  }
				  }
			  }
			};
			
			Blockly.Python['led_strip_brightness'] = function(block) {
			  var brightness = Blockly.Python.valueToCode(this,'BRIGHTNESS',Blockly.Python.ORDER_ATOMIC) || '';
			  var input_pin = this.getFieldValue('PIN');
			  Blockly.Python.definitions_['define_neopixel_h'] = '#include <Adafruit_NeoPixel.h>';
			  Blockly.Python.definitions_['define_avr_power_h'] = '#ifdef __AVR__\n  #include <avr/power.h>\n#endif';
			  Blockly.Python.definitions_['declare_var_led_strip_'+input_pin]='Adafruit_NeoPixel _led_strip_'+input_pin+'(7,'+input_pin+', NEO_GRB + NEO_KHZ800);\n';

			  Blockly.Python.setups_['setup_simpleexpressions_led_strip'+input_pin] = '_led_strip_'+input_pin+'.begin();\n  clearpixels_'+input_pin+'();\n  _led_strip_'+input_pin+'.setBrightness(map(10,0,100,0,255));\n';
			  
			  var code='_led_strip_'+input_pin+'.setBrightness(map('+brightness+',0,100,0,255));\n' ;
			  return code;
			};
			
			Blockly.Blocks['led_strip_brightness'] = {
			  category: PiBlocks.locales.getKey('LANG_CATEGORY_LIGHT'),
			  category_colour: PiBlocks.LANG_COLOUR_LIGHT,
			  colour: PiBlocks.LANG_COLOUR_LIGHT,
			  keys: ['LANG_SIMPLEEXPRESSIONS_LED_STRIP_BRIGHTNESS_TOOLTIP'],
			  init: function() {
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/led_strip.svg',20*options.zoom,20*options.zoom));
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('BRIGHTNESS').appendField(new Blockly.FieldImage('img/blocks/sun.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck(Number);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/percent.svg',20*options.zoom,20*options.zoom));
				this.setPreviousStatement(true,'code');
				this.setNextStatement(true,'code');
				this.setInputsInline(true);
				this.setColour(PiBlocks.LANG_COLOUR_LIGHT);
				this.setTooltip(PiBlocks.locales.getKey('LANG_SIMPLEEXPRESSIONS_LED_STRIP_BRIGHTNESS_TOOLTIP'));
			  }
			};
		
        return Blockly.Blocks;
    }

var PiBlocks = {
        load: load
    };
    if (typeof define === 'function' && define.amd) {
        return PiBlocks;
    } else {
        window.PiBlocks = PiBlocks;
    }
}));