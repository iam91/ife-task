;(function(window, document){

	var $ = function(query){
		return document.querySelector(query);
	};

	var $$ = function(elem){
		return document.createElement(elem);
	};

	function addHandler(elem, type, handler){
		if(elem.attachEvent){
			elem.attachEvent('on' + type, handler);
		}
		else if(elem.addEventListener){
			elem.addEventListener(type, handler, false);
		}
		else{
			elem['on' + type] = handler;
		}
	}

	var _template = "<label class='ff-label'>{label}</label>"
				  + "<input class='ff-input ff-msg' type='{type}' name='{name}'>"
				  + "<span class='ff-msg'>{msg}</span>";

	var _infoClass = ['ff-msg', 'ff-failed', 'ff-successful'];

	var _findFn = function(input){
		return input.nextElementSibling;
	};

	var _dffailCallback = function(){alert('Failed')};
	var _dfsuccessCallback = function(){alert('Successful')};

	var _formFactory = function(query){
		var _base = $(query);
		var _html;
		var _schema;
		var _findInfo;
		var _failCallback;
		var _successCallback;

		function _render(label, type, name, msg){
			var newField = $$('div');
			var html = _html.replace(/\{label\}/, label)
							.replace(/\{type\}/, type)
							.replace(/\{name\}/, name)
							.replace(/\{msg\}/, msg);
			newField.innerHTML = html;
			return newField;
		}

		function _changeState(target, info){
			var infoPart = _findInfo(target);

			for(var i = 0; i < _infoClass.length; i++){
				var curr = _infoClass[i];
				if(infoPart.classList.contains(curr)){
					target.classList.remove(curr);
					infoPart.classList.remove(curr);
				}
			}

			infoPart.innerHTML = info[1];
			infoPart.classList.add(info[0]);
			target.classList.add(info[0]);
		}

		function _config(schema, successCallback, failCallback, template, findInfo){
			//if template is not provided, use the default one
			_schema = schema;
			_html = template || _template;
			_findInfo = findInfo || _findFn;
			_failCallback = failCallback || _dffailCallback;
			_successCallback = successCallback || _dfsuccessCallback;

			if(template && !findInfo){
				console.warn('A function to find the infomation part is needed for your template!');
				return;
			}

			for(var prop in schema){
				var form = schema[prop];
				var label = form.label ? form.label : '';
				var type = form.type ? form.type : 'text';
				var msg = form.msg ? form.msg : '';
				//name must be provided
				var name = form.name;
				_base.appendChild(_render(label, type, name, msg));
			}
			var button = $$('input');
			button.type = 'submit';
			button.classList.add('ff-btn');
			_base.appendChild(button);

			addHandler(_base, 'focusin', _focusHandler);
			addHandler(_base, 'focusout', _focusHandler);
			addHandler(_base, 'click', _clickHandler);
		}

		function _validateFn(validate, value){
			var invalid = validate.invalid;
			for(var reg in invalid){
				if(!invalid[reg][0].test(value)){
					return ['ff-failed', invalid[reg][1]];
				}
			}
			return ['ff-successful', validate.valid];
		}

		function _focusHandler(e){
			var target = e.target;
			var key = target.name;
			var value = target.value.trim();
			var eventType = e.type;

			var targetType = target.type;
			if(targetType === 'submit' || targetType === 'button'){
				return;
			}
			if(eventType === 'focusin'){
				var info = ['ff-msg', _schema[key].msg];
			}
			else if(eventType === 'focusout'){
				var info = _validateFn(_schema[key], value);
			}
			_changeState(target, info);
		}

		
		function _clickHandler(e){
			e.preventDefault();
			var target = e.target;
			var type = target.getAttribute('type');
			if(type === 'submit' || type === 'button'){
				var inputs = _base.elements;
				var isValid = true;
				for(var i = 0; i < inputs.length; i++){
					if(inputs[i] !== target){
						var value = inputs[i].value.trim();
						var validate = _schema[inputs[i].name];
						var info = _validateFn(validate, value);
						_changeState(inputs[i], info);
						if(info[0] === 'ff-failed'){
							isValid = false;
						}
					}
				}
				if(isValid){
					_successCallback();
				}	
				else{
					_failCallback();
				}
			}
		};

		return {
			config: _config
		};
	};


	//export formFactory
	window.formFactory = _formFactory;
	window.ff = _formFactory;

})(window, document);