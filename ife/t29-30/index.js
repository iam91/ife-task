var _$ = function(query){
	var _dom = document.querySelector(query);
	var _register = function(validator){

		var render = function(input, info){
			var infoDom = null;
			var sibling = input.nextElementSibling;
			if(sibling && sibling.tagName === 'DIV'){
				infoDom = sibling;
			}
			else{
				infoDom = document.createElement('div');
				input.parentNode.insertBefore(infoDom, sibling);
			}
			input.setAttribute('class', info[0]);
			infoDom.innerHTML = '<span class="' + info[0] + '">' + info[1] + '</span>';
		};

		var validateFn = function(validate, value){
			var invalid = validate.invalid;
			for(var reg in invalid){
				if(!invalid[reg][0].test(value)){
					return ['z-form-failed', invalid[reg][1]];
				}
			}
			return ['z-form-successful', validate.valid];
		};

		var clickHandler = function(e){
			e.preventDefault();
			var target = e.target;
			var type = target.getAttribute('type');
			if(type === 'submit' || type === 'button'){
				var inputs = _dom.elements;
				for(var i = 0; i < inputs.length; i++){
					if(inputs[i] !== target){
						var value = inputs[i].value.trim();
						var validate = validator[inputs[i].getAttribute('name')];
						var info = validateFn(validate, value);
						render(inputs[i], info);
					}
				}	
			}
		};

		var focusHandler = function(e){
			var target = e.target;
			var key = target.getAttribute('name');
			var value = target.value.trim();
			var eventType = e.type;

			var targetType = target.getAttribute('type');
			if(targetType === 'submit' || targetType === 'button'){
				return;
			}

			if(eventType === 'focusin'){
				var info = ['z-form-msg', validator[key].msg];
			}
			else if(eventType === 'focusout'){
				var info = validateFn(validator[key], value);
			}
			render(target, info);
		};

		addHandler(_dom, 'click', clickHandler);
		addHandler(_dom, 'focusin', focusHandler);
		addHandler(_dom, 'focusout', focusHandler);
	};

	return {
		register: _register
	};
};

var validator = {
	name: {
		msg: '必填，长度为4-16个字符',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '名字不能为空'],
			length: [/^[a-z,A-Z,\d,\u4e00-\u9fa5]{4, 16}$/, '长度非法']
		}
	},
	password: {
		msg: '请输入密码',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '密码不能为空'],
			usable: [/^[a-z,A-Z,\d]+$/, '密码只能为数字或字母']
		}
	},
	email: {
		msg: '请输入邮箱',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '邮箱不能为空']
		}
	}
}

_$('form.z-form').register(validator);