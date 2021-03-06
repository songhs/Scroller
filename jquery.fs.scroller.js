/*
 * Scroller Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.5.9
 *
 * Copyright © 2012 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	var options = {
		customClass: "",
		trackMargin: 0,
		handleSize: false,
		horizontal: false
	};
	
	var pub = {
		
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		destroy: function() {
			var $items = $(this);
			for (var i = 0, count = $items.length; i < count; i++) {
				var data = $items.eq(i).data("scroller");
				if (data) {
					data.$scrollbar.removeClass(data.customClass)
								   .removeClass("scroller")
								   .removeClass("scroller-active");
					data.$content.replaceWith(data.$content.html());
					data.$bar.remove();
					
					data.$content.unbind("scroll", _onScroll);
					data.$scrollbar.off(".scroller")
								   .removeData("scroller");
				}
			}
			
			return $items;
		},
		
		scroll: function(pos) {
			var data = $(this).data("scroller");
			
			if (typeof pos != "number") {
				var $el = $(pos);
				if ($el.length > 0) {
					var offset = $el.position();
					if (data.horizontal == true) {
						pos = offset.left + data.$content.scrollLeft();
					} else {
						pos = offset.top + data.$content.scrollTop();
					}
				} else {
					pos = data.$content.scrollTop();
				}
			}
			
			if (data.horizontal == true) {
				data.$content.scrollLeft(pos);
			} else {
				data.$content.scrollTop(pos);
			}
			
			return $(this);
		},
		
		reset: function(_data)  {
			var $items = $(this);
			var data;
			for (var i = 0, count = $items.length; i < count; i++) {
				data = _data || $items.eq(i).data("scroller");
				
				if (typeof data != "undefined") {
					data.$scrollbar.addClass("scroller-setup");
					
					if (data.horizontal == true) {
						// Horizontal
						data.barHeight = data.$content[0].offsetHeight - data.$content[0].clientHeight;
						data.frameWidth = data.$content.outerWidth();
						data.trackWidth = data.frameWidth - (data.trackMargin * 2);
						data.scrollWidth = data.$content[0].scrollWidth;
						data.ratio = data.trackWidth / data.scrollWidth;
						data.trackRatio = data.trackWidth / data.scrollWidth;
						data.handleWidth = (data.handleSize) ? data.handleSize : data.trackWidth * data.trackRatio;
						data.scrollRatio = (data.scrollWidth - data.frameWidth) / (data.trackWidth - data.handleWidth);
						data.handleBounds = {
							left: 0,
							right: data.trackWidth - data.handleWidth
						};
						
						data.$scrollbar.data("scroller", data);
						data.$content.css({ paddingBottom: data.barHeight + data.paddingBottom });
						
						var scrollLeft = data.$content.scrollLeft();
						var handleLeft = scrollLeft * data.ratio;
						
						if (data.scrollWidth <= data.frameWidth) {
							data.$scrollbar.removeClass("scroller-active");
						} else {
							data.$scrollbar.addClass("scroller-active");
						}
						
						data.$bar.css({ width: data.frameWidth });
						data.$track.css({ width: data.trackWidth, marginLeft: data.trackMargin, marginRight: data.trackMargin });
						data.$handle.css({ width: data.handleWidth });
						_position.apply(data.$scrollbar, [data, handleTop]);
					} else {
						// Vertical
						data.barWidth = data.$content[0].offsetWidth - data.$content[0].clientWidth;
						data.frameHeight = data.$content.outerHeight();
						data.trackHeight = data.frameHeight - (data.trackMargin * 2);
						data.scrollHeight = data.$content[0].scrollHeight;
						data.ratio = data.trackHeight / data.scrollHeight;
						data.trackRatio = data.trackHeight / data.scrollHeight;
						data.handleHeight = (data.handleSize) ? data.handleSize : data.trackHeight * data.trackRatio;
						data.scrollRatio = (data.scrollHeight - data.frameHeight) / (data.trackHeight - data.handleHeight);
						data.handleBounds = {
							top: 0,
							bottom: data.trackHeight - data.handleHeight
						};
						
						data.$scrollbar.data("scroller", data);
						
						var scrollTop = data.$content.scrollTop();
						var handleTop = scrollTop * data.ratio;
						
						if (data.scrollHeight <= data.frameHeight) {
							data.$scrollbar.removeClass("scroller-active");
						} else {
							data.$scrollbar.addClass("scroller-active");
						}
						
						data.$bar.css({ height: data.frameHeight });
						data.$track.css({ height: data.trackHeight, marginBottom: data.trackMargin, marginTop: data.trackMargin });
						data.$handle.css({ height: data.handleHeight });
						_position.apply(data.$scrollbar, [data, handleTop]);
					}
					
					data.$scrollbar.removeClass("scroller-setup");
				}
			}
			
			return $items;
		}
	}
	
	function _init(opts) {
		var data = $.extend({}, options, opts || {});
		
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			var $scrollbar = $items.eq(i);
			
			if (!$scrollbar.data("scroller")) {
				var html = '<div class="scroller-bar">';
				html += '<div class="scroller-track">';
				html += '<div class="scroller-handle">';
				html += '</div></div></div>';
				
				data.paddingRight = parseInt($scrollbar.css("padding-right"), 10);
				data.paddingBottom = parseInt($scrollbar.css("padding-bottom"), 10);
				
				$scrollbar.addClass(data.customClass + " scroller")
						  .wrapInner('<div class="scroller-content" />')
						  .prepend(html);
				
				if (data.horizontal) {
					$scrollbar.addClass("scroller-horizontal");
				}
				
				data = $.extend({
					$scrollbar: $scrollbar,
					$content: $scrollbar.find(".scroller-content"),
					$bar: $scrollbar.find(".scroller-bar"),
					$track: $scrollbar.find(".scroller-track"),
					$handle: $scrollbar.find(".scroller-handle")
				}, data);
				
				data.$content.on("scroll.scroller", data, _onScroll);
				data.$scrollbar.on("mousedown.scroller", ".scroller-track", data, _onTrackDown)
							   .on("mousedown.scroller", ".scroller-handle", data, _onHandleDown)
							   .data("scroller", data);
				
				pub.reset.apply($scrollbar, [data]);
				$(window).one("load", function() {
					pub.reset.apply($scrollbar, [data]);
				});
			}
		}
		
		return $items;
	}
	
	function _onScroll(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (data.horizontal == true) {
			// Horizontal
			var scrollLeft = data.$content.scrollLeft();
			if (scrollLeft < 0) {
				scrollLeft = 0;
			}
			
			var handleLeft = scrollLeft / data.scrollRatio;
			if (handleLeft > data.handleBounds.right) {
				handleLeft = data.handleBounds.right;
			}
			
			data.$handle.css({ left: handleLeft });
		} else {
			// Vertical
			var scrollTop = data.$content.scrollTop();
			if (scrollTop < 0) {
				scrollTop = 0;
			}
			
			var handleTop = scrollTop / data.scrollRatio;
			if (handleTop > data.handleBounds.bottom) {
				handleTop = data.handleBounds.bottom;
			}
			
			data.$handle.css({ top: handleTop });
		}
	}
	
	function _onTrackDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		var offset = data.$track.offset();
		
		if (data.horizontal == true) {
			// Horizontal
			data.mouseStart = e.pageX;
			data.handleLeft = e.pageX - offset.left - (data.handleWidth / 2);
			_position.apply(data.$scrollbar, [data, data.handleLeft]);
		} else {
			// Vertical
			data.mouseStart = e.pageY;
			data.handleTop = e.pageY - offset.top - (data.handleHeight / 2);
			_position.apply(data.$scrollbar, [data, data.handleTop]);
		}
		
		data.$scrollbar.data("scroller", data);
		data.$content.off(".scroller");
		$("body").on("mousemove.scroller", data, _onMouseMove)
				 .on("mouseup.scroller", data, _onMouseUp);
	}
	
	function _onHandleDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;

		if (data.horizontal == true) {
			// Horizontal
			data.mouseStart = e.pageX;
			data.handleLeft = parseInt(data.$handle.css("left"), 10);
		} else {
			// Vertical
			data.mouseStart = e.pageY;
			data.handleTop = parseInt(data.$handle.css("top"), 10);
		}
		
		data.$scrollbar.data("scroller", data);
		data.$content.off(".scroller");
		$("body").on("mousemove.scroller", data, _onMouseMove)
				 .on("mouseup.scroller", data, _onMouseUp);
	}
	
	function _onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		var pos = 0;
		
		if (data.horizontal == true) {
			// Horizontal
			var delta = data.mouseStart - e.pageX;
			pos = data.handleLeft - delta;
		} else {
			// Vertical
			var delta = data.mouseStart - e.pageY;
			pos = data.handleTop - delta;
		}
		
		_position.apply(data.$scrollbar, [data, pos]);
	}
	
	function _onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		data.$content.on("scroll.scroller", data, _onScroll);
		$("body").off(".scroller");
	}
	
	function _position(data, pos) {
		if (data.horizontal == true) {
			// Horizontal
			if (pos < data.handleBounds.left) {
				pos = data.handleBounds.left;
			}
			if (pos > data.handleBounds.right) {
				pos = data.handleBounds.right;
			}
			
			var scrollLeft = Math.round(pos * data.scrollRatio);
			
			data.$handle.css({ left: pos });
			data.$content.scrollLeft( scrollLeft );
		} else {
			// Vertical
			if (pos < data.handleBounds.top) {
				pos = data.handleBounds.top;
			}
			if (pos > data.handleBounds.bottom) {
				pos = data.handleBounds.bottom;
			}
			
			var scrollTop = Math.round(pos * data.scrollRatio);
			
			data.$handle.css({ top: pos });
			data.$content.scrollTop( scrollTop );
		}
	}
	
	// Define Plugin
	$.fn.scroller = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);	