var _$ = function(query){
	var _dom = document.querySelector(query);
	var _register = function(validator){

		var focusHandler = function(e){
			var target = e.target;
			var sibling =  target.nextElementSibling;
			var key = target.getAttribute('name');

			var value = target.value.trim();

			var infoShow = function(eventType){
				if(eventType === 'focusin'){
					return ['z-form-msg', validator[key].msg];
				}
				else if(eventType === 'focusout'){
					var validate = validator[key].invalid;

					for(var reg in validate){
						if(!validate[reg][0].test(value)){
							return ['z-form-failed', validate[reg][1]];
						}
					}
					return ['z-form-successful', validator[key].valid];
				}
			};

			var info = null;

			if(sibling && sibling.tagName === 'SPAN'){
				info = sibling;
			}
			else{
				info = document.createElement('span');
				target.parentNode.insertBefore(info, sibling);
			}
			var r = infoShow(e.type);

			//render
			target.setAttribute('class', r[0]);
			info.innerHTML = '<span class="' + r[0] + '">' + r[1] + '</span>';
		};

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
			nonempty:[/.+/, '名字不能为空']
		}
	},
	password: {
		msg: '请输入密码',
		valid: '验证成功',
		invalid: {
			nonempty:[/.+/, '密码不能为空']
		}
	},
	email: {
		msg: '请输入邮箱',
		valid: '验证成功',
		invalid: {
			nonempty:[/.+/, '邮箱不能为空']
		}
	}
}

_$('form.z-form').register(validator);