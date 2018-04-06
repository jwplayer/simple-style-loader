/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");

var loaderUtils = require("loader-utils");

module.exports = function() {};

module.exports.pitch = function(request) {
	if (this.cacheable) this.cacheable();
	return [
        // Style Loader
        // Adds CSS to the DOM by adding a <style> tag
        "",
        // Load styles
		"var content = require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ");",
		"if(typeof content === 'string') content = [['all-players', content, '']];",
        "",
        // Add styles to the DOM
		"require(" + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "addStyles.js")) + ").style(content,'all-players');",
		"if(content.locals) module.exports = content.locals;"
	].join("\n");
};
