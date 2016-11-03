//TODO add the other inputs
//add default regex
//add warning for exception
var schema = {
	name: {
		label: 'name',
		name: 'name',
		type: 'text',
		msg: '必填，长度为4-16个字符',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '名字不能为空'],
			length: [{test: function(val){
				return /^[a-z,A-Z,\d]{4,16}$/.test(val.replace(/[\u0391-\uFFE5]/g, 'nn'));
			}}, '长度非法']
		}
	},
	password: {
		label: 'password',
		name: 'password',
		type: 'password',
		msg: '请输入密码',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '密码不能为空'],
			usable: [/^[a-z,A-Z,\d]+$/, '密码只能为数字或字母']
		}
	},
	email: {
		label: 'email',
		name: 'email',
		type: 'email',
		msg: '请输入邮箱',
		valid: '验证成功',
		invalid: {
			nonempty: [/^.+$/, '邮箱不能为空']
		}
	}
};

ff('form').config(schema, function(){alert('Hello motherfucker!')});