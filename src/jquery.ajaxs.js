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

	var BaseTask = function(ajaxs) {
		this.ajaxs = ajaxs;
		this.total = ajaxs.length;
		this.aborted = false;
	};

	BaseTask.prototype = {
		promiseExtend: function() {
			var that = this;
			return {
				abort: function() {
					that.abort();
					return this;
				}
			};
		},
		abort: function() {
			this.aborted = true;
		},
		run: function() {

		}
	};

	var parent = BaseTask.prototype;

	var Onebyone = function() {
		BaseTask.apply(this, arguments);
		this.current = null;
		this.defer = $.Deferred();
	};

	Onebyone.prototype = {
		abort: function() {
			parent.abort.apply(this, arguments);
			this.current.abort();
		},
		run: function() {
			parent.run.apply(this, arguments);
			this.createAjax(0);
			return this.defer.promise(this.promiseExtend());
		},
		createAjax: function(i) {
			var settings = this.ajaxs[i];
			if (i+1 === this.total) {
				this.current = $.ajax(settings);
				this.current.then(this.defer.resolve, this.defer.reject);
			}
			else {
				var that = this;
				this.current = $.ajax(settings);
				this.current.then(function() {
					that.createAjax(i+1);
				}, this.defer.reject);
			}
			if (this.aborted) {
				this.current.abort();
			}
		}
	};

	Onebyone.prototype = $.extend(Object.create(parent), Onebyone.prototype);

	var Parallel = function() {
		BaseTask.apply(this, arguments);
		this.calls = [];
	};

	Parallel.prototype = {
		abort: function() {
			parent.abort.apply(this, arguments);
			for (var i=0; i<this.calls.length; i++) {
				this.calls[i].abort();
			}
		},
		run: function() {
			parent.run.apply(this, arguments);
			for (var i=0; i<this.total; i++) {
				var settings = this.ajaxs[i];
				this.calls.push($.ajax(settings));
			}
			return $.when.apply($, this.calls).promise(this.promiseExtend());
		}
	};

	Parallel.prototype = $.extend(Object.create(parent), Parallel.prototype);

	var defaultSettings = {
		mode: 'onebyone'
	};


	var AjaxsManager = function(settings) {
		this.settings = $.extend(true, {}, defaultSettings, settings);
		this.ajaxs = [];
		this.aborted = false;
		this.promise = null;
	};

	AjaxsManager.prototype = {
		setParallel: function() {
			this.settings.mode = 'parallel';
			return this;
		},
		setOnebyone: function() {
			this.settings.mode = 'onebyone';
			return this;
		},
		add: function(settings) {
			this.ajaxs.push(settings);
			return this;
		},
		abort: function() {
			if (this.aborted) {
				return this;
			}
			this.aborted = true;
			if (this.promise) {
				this.promise.abort();
			}
			return this;
		},
		run: function() {
			if (this.promise) {
				return this;
			}
			this.promise = $.ajaxs(this.ajaxs, this.settings);
			if (this.aborted) {
				this.promise.abort();
			}
			return this.promise;
		}
	};

	$.ajaxs = function(ajaxs, settings) {
		settings = $.extend(true, {}, defaultSettings, settings);
		var task;
		if (settings.mode === 'parallel') {
			task = new Parallel(ajaxs);
		}
		else {
			task = new Onebyone(ajaxs);
		}
		return task.run();
	};

	$.ajaxsManager = function() {
		return new AjaxsManager();
	};

}));
