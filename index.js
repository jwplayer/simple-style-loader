 /*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
var loaderUtils = require("loader-utils"),
	path = require("path");
	module.exports = function() {};
	module.exports.pitch = function(remainingRequest) {
	if(this.cacheable) this.cacheable();
	return [
		"// style-loader: Adds some css to the DOM by adding a <style> tag",
		"",
		"// load the styles",
		"var content = require(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ");",
		"if(typeof content === 'string') content = [['all-players', content, '']];",
		"// add the styles to the DOM",
		"require(" + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "addStyles.js")) + ").style(content,'all-players');",
		"if(content.locals) module.exports = content.locals;"
	].join("\n");
};
