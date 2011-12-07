/*
  cropkilla.js
  image cropping tool for jQuery
  jason.volpe@gmail.com
  */

(function($) {

  // settings / globals... yeah.
  var _srcBox = {'id': '#ck-src-box'};
  var _outBox = {'id': '#ck-out-box',
                 'size': {'width': 200, 'height': 200}};
  var _cropBox = {'id': '#ck-crop-box',
                  'moving': false,
                  'resizing': false,
                  'local': {},
                  'size': {'width': 50, 'height': 50}};
  var _image = new Image();
  var _zoom = 1.0;

  // mouse state
  var _mouseDown = false;

  function onImageLoad() {
    // resize image holders and display images
    $(_srcBox.id).css('height', _image.height)
                 .css('width', _image.width)
                 .css('background-image', 'url(' + _image.src + ')');
    $(_outBox.id).css('height', _outBox.size.height)
                 .css('width', _outBox.size.width)
                 .css('background-image', 'url(' + _image.src + ')');

    methods.resize();
    methods.centerCropBox();
    methods.setZoom();
    methods.resetOutBox();

    /*
     * bind mouse events
     */
    $(window).on('mouseup', function(e) {
      _mouseDown = _cropBox.moving = _cropBox.resizing = false;
    });

    $(_srcBox.id).on('mousedown', function(e) {

      _cropBox.pos = $(_cropBox.id).offset()

      // mouse position used for moving offset
      _cropBox.local.x = e.pageX - _cropBox.pos.left;
      _cropBox.local.y = e.pageY - _cropBox.pos.top;

      if (e.target.id === 'resize') {
        _cropBox.resizing = true;
      } else if (_cropBox.id.match(e.target.id)) {
        _cropBox.moving = true;
      }
    });

    $(_srcBox.id).on('mousemove', function(e) {

      _cropBox.pos = $(_cropBox.id).offset();

      if (_cropBox.moving) {
        // move crop box
        $(_cropBox.id).css('left', e.pageX - _cropBox.local.x + 'px');
        $(_cropBox.id).css('top', e.pageY - _cropBox.local.y + 'px');

        // shift output image
        _cropBox.pos = $(_cropBox.id).offset();
        methods.resetOutBox();
      }

      if (_cropBox.resizing) {
        _cropBox.size.width = e.pageX - _cropBox.pos.left + 4;
        _cropBox.size.height = e.pageY - _cropBox.pos.top + 4;

        var boxSize = Math.max(_cropBox.size.width, _cropBox.size.height)

        $(_cropBox.id).css('width', boxSize + 'px');
        $(_cropBox.id).css('height', boxSize + 'px');

        methods.setZoom();
      }

      e.preventDefault();
    });

    // debug
    console.log('imageloaded', this.width, this.height);
  }

  var methods = {
    init: function( options ) {

      return this.each(function() {

        $(window).resize(methods.resize);
        
        methods.resize();

        // debug
        console.log('initialized:', _srcBox, _outBox, _cropBox);
      });
    },

    centerCropBox: function() {
      $(_cropBox.id).css('left', Math.floor(_srcBox.pos.left + $(_srcBox.id).width() / 2 - _cropBox.size.width / 2) + 'px')
                    .css('top', Math.floor(_srcBox.pos.top + $(_srcBox.id).height() / 2 - _cropBox.size.height / 2) + 'px');
      _cropBox.pos = $(_cropBox.id).offset();
      methods.resetOutBox();
    },

    destroy: function() {
      return this.each(function() {
        $(window).unbind('.cropkilla');
      })
    },

    loadImage: function( imageUrl ) {
      _image.onload = onImageLoad;
      console.log('loadImage', imageUrl);
      _image.src = imageUrl;
    },

    resetOutBox: function() {
      _cropBox.pos = $(_cropBox.id).offset();
      
      // zoom
      $(_outBox.id).css('background-size', _image.width * _zoom + 'px ' + _image.height * _zoom + 'px');

      // shift output image
      var x = _cropBox.pos.left - _srcBox.pos.left;
      var y = _cropBox.pos.top - _srcBox.pos.top;

      $(_outBox.id).css('background-position', -x * _zoom + 'px ' + -y * _zoom + 'px');
    },

    resize: function() {
      // save new positions of elements
      _cropBox.pos = $(_cropBox.id).offset();
      _srcBox.pos = $(_srcBox.id).offset();
      _srcBox.margin = {'left': /\d+/.exec($(_srcBox.id).css('margin-left'))[0], 'top': /\d+/.exec($(_srcBox.id).css('margin-top'))[0]}
      _outBox.pos = $(_outBox.id).offset();

      // debug
      console.log('resize:', _srcBox, _outBox, _cropBox);
    },

    setZoom: function() {
      _zoom = _outBox.size.width / _cropBox.size.width;
      methods.resetOutBox();
    }
  };

  $.fn.cropkilla = function( method ) {

    if ( methods[method] ) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exists on jQuery.crop-killa');
    }
  };

})(jQuery);