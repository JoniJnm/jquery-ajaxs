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

	var Parallel = function(ajaxs, settings) {
		for (var i in settings) {
			if (settings.hasOwnProperty(i)) {
				this[i] = settings[i];
			}
		}

		this.ajaxs = ajaxs;
		this.total = ajaxs.length;
		if (this.total === 0) {
			this.aborted = true;
			throw new Error('Ajaxs empty');
		}
		if (this.maxParallel <= 0) {
			this.maxParallel = this.total;
		}
		this.aborted = false;

		this.current = null;
		this.defer = $.Deferred();
		this.i = 0;
		this.dones = 0;
		this.calls = [];
	};

	Parallel.prototype = {
		run: function() {
			for (var i=0; i<this.maxParallel && i<this.total; i++) {
				this.nextAjax();
			}
			return this.defer.promise(this.promiseExtend());
		},
		onDoneAjax: function() {
			this.dones++;
			if (this.dones === this.total) {
				this.defer.resolve.apply(this.defer, arguments);
			}
			else {
				this.nextAjax();
			}
		},
		nextAjax: function() {
			var i = this.i++;
			if (i < this.total) {
				this.createAjax(i);
			}
		},
		createAjax: function(i) {
			var settings = this.ajaxs[i];
			this.current = $.ajax(settings);
			this.calls.push(this.current);
			this.current.then(this.onDoneAjax.bind(this), this.defer.reject.bind(this.defer));
			if (this.aborted) {
				this.current.abort();
			}
		},
		abort: function() {
			this.aborted = true;
			if (this.current) {
				this.current.abort();
			}
			for (var i=0; i<this.calls.length; i++) {
				this.calls[i].abort();
			}
		},
		promiseExtend: function() {
			var that = this;
			return {
				abort: function() {
					that.abort();
					return this;
				}
			};
		}
	};

	var defaultSettings = {
		maxParallel: 1
	};

	var AjaxsManager = function(settings) {
		this.settings = $.extend(true, {}, defaultSettings, settings);
		this.ajaxs = [];
		this.aborted = false;
		this.promise = null;
	};

	AjaxsManager.prototype = {
		setMaxParallel: function(maxParallel) {
			this.settings.maxParallel = maxParallel;
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
		var task = new Parallel(ajaxs, settings);
		return task.run();
	};

	$.ajaxsManager = function() {
		return new AjaxsManager();
	};

}));
