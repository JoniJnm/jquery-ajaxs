/*!
 * Send jQuery ajax requests one by one or pararell
 * https://github.com/JoniJnm/jquery-ajaxs
 *
 * Copyright JoniJnm.es
 * Released under the GPL-2.0 license.
 *
 * Date: @DATE
 */

(function (factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	'use strict';

	var Onebyone = function(ajaxs) {
		this.ajaxs = ajaxs;
		this.total = ajaxs.length;
		this.defer = $.Deferred();
	};

	Onebyone.prototype = {
		run: function() {
			this.createAjax(0);
			return this.defer.promise();
		},
		createAjax: function(i) {
			var ajax = this.ajaxs[i];
			if (i+1 === this.total) {
				$.ajax(ajax).then(this.defer.resolve, this.defer.reject);
			}
			else {
				var that = this;
				$.ajax(ajax).then(function() {
					that.createAjax(i+1);
				}, this.defer.reject);
			}
		}
	};

	var Parallel = function(ajaxs) {
		this.ajaxs = ajaxs;
		this.total = ajaxs.length;
	};

	Parallel.prototype = {
		run: function() {
			var ajaxs = [];
			for (var i=0; i<this.total; i++) {
				var ajax = this.ajaxs[i];
				ajaxs.push($.ajax(ajax));
			}
			return $.when.apply($, ajaxs);
		}
	};

	$.ajaxs = function(ajaxs, parallel) {
		var task;
		if (parallel) {
			task = new Parallel(ajaxs);
		}
		else {
			task = new Onebyone(ajaxs);
		}
		return task.run();
	};

}));
