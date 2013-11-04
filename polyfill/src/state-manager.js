var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _STATES = {
	loading:'loading',
	default: 'default',
	expanded: 'expanded',
	resized: 'resized',
	hidden: 'hidden'
};

var StateManager = function(){
	EventEmitter.call(this);
	this.__state = 'loading';
};

util.inherits(StateManager, EventEmitter);

StateManager.prototype.get = function() { return this.__state; };
StateManager.prototype.set = function(state, isTest){
	var s = _STATES[(state || '').toLowerCase()];

	if (!s){
		throw {msg: 'bad state: ' + state};
	}

	// only resize can fire again and again
	if (this.__state === s && s !== 'resized') return;

	if (!this.isValid(s)){
		_checkForError(this, this.__state, s);
		return;
	}

	this.__state = s;
	this.emit('stateChange', this.__state);

	return s;
};
StateManager.prototype.isValid = function(newState){
	var oldState = this.__state;
	if (!oldState || !newState) return;

	switch (newState){
		case 'resized':
			switch (oldState){
				case 'resized':
					return true;
				case 'hidden':
				case 'loading':
					return false;
				case 'expanded':
					return false;
			}
			break;
		case 'expanded':
			switch (oldState){
				case 'loading':
				case 'hidden':
					return false;
			}
			break;
		case 'loading':
			return false;
	}

	return true;
};
function _checkForError(obj, oldState, newState){
	if (oldState === 'expanded' && newState === 'resized'){
		obj.emit('error', 'cannot transition from expanded to resized.');
	}
}
module.exports = StateManager;
