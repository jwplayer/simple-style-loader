
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var playerStyleElements = {};

var memoize = function(fn) {
	var memo;
	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var getHeadElement = memoize(function () {
	return document.head || document.getElementsByTagName("head")[0];
});

module.exports = {
	style: style,
	clear: clear
};

function style (list, playerId) {
	addStylesToDom(playerId, listToStyles(list));
}

function clear (playerId, selector) {
	var playerStyles = stylesInDom[playerId];
	if (!playerStyles) {
		return;
	}
	if (selector) {
		// delete all rules for a specific selector
		var ruleObj = playerStyles[selector];
		if (ruleObj) {
			for (var h = 0; h < ruleObj.parts.length; h += 1) {
				ruleObj.parts[h]();
			}
			delete playerStyles[selector];
		}
		return;
	}
	var styleKeys = Object.keys(playerStyles);
	for (var i = 0; i < styleKeys.length; i += 1) {
		var styleObj = playerStyles[styleKeys[i]];
		for (var j = 0; j < styleObj.parts.length; j += 1) {
			styleObj.parts[j]();
		}
	}
	delete stylesInDom[playerId];

	if (playerStyleElements[playerId]) {
		var playerStyleEl = playerStyleElments[playerId].element;

		if (playerStyleEl && playerStyleEl.parentElement) {
			playerStyleEl.parentElement.removeChild(playerStyleElement);
		}
		delete playerStyleElements[playerId];
	}

}

function addStylesToDom(playerId, styles) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = (stylesInDom[playerId] || {})[item.id];
		if(domStyle) {

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(playerId, item.parts[j]));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(playerId, item.parts[j]));
			}
			stylesInDom[playerId] = stylesInDom[playerId] || {};
			stylesInDom[playerId][item.id] = {id: item.id, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		// The id isn't a css selector - it's just used internally
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var part = {css: css, media: media};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(styleElement) {
	getHeadElement().appendChild(styleElement);
}

function createStyleElement(playerId) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	styleElement.setAttribute('data-jwplayer-id', playerId);
	insertStyleElement(styleElement);
	return styleElement;
}

function addStyle(playerId, obj) {
	var styleElement, update, remove;
	var singleton = playerStyleElements[playerId];

	if (!singleton) {
		singleton = playerStyleElements[playerId] = {
			element: createStyleElement(playerId),
			counter: 0
		};
	}

	var styleIndex = singleton.counter++;
	styleElement = singleton.element;
	update = function(css) {
		applyToSingletonTag(styleElement, styleIndex, css);
	};
	remove = function() {
		applyToSingletonTag(styleElement, styleIndex, '');
	};

	update(obj.css);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media)
				return;
			obj = newObj;
			update(obj.css);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, css) {
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		var child = childNodes[index];
		if (child) {
			styleElement.replaceChild(cssNode, child);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}
