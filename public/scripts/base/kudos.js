Kudos = (function() {
  
  var self = this;
  
  // Constructor
  function Kudos(args, callback) {
    self = this;
    // All widgets
    self.el = document.querySelectorAll(args.el)[0];
    // Set the status
    self.callback = callback;
    self.status = args.status;
    // Duration of activation
    self.duration = args.duration;
    // setTimeout-ID's
    self.timer = {};
    self.currentStatus = 'alpha';
    self.changeStatus('alpha');
      // Events
      if (self.isTouch()) {
        self.el.addEventListener('touchstart', self.enter);
        self.el.addEventListener('touchend', self.out);
      } else {
        self.el.addEventListener('mouseover', self.enter);
        self.el.addEventListener('mouseout', self.out);
        self.el.addEventListener('click', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          console.log('clock');
        });
      }
  }
  
  
  
  Kudos.prototype.turnOff = function(){
    var self = this;
    self.removeClass('finish');
    self.changeStatus('alpha');
  }
  /*
   * Enter the element
   */
   
  Kudos.prototype.enter = function(e) {
      // Activate the kudo twist
      self.addClass('active');
      if (self.hasClass('finish'))
         self.removeClass('finish');
      // Start timeout
      self.timer = setTimeout(function() {
        self.removeClass('active');
        if (self.currentStatus !== 'gamma') {
           self.changeStatus('gamma');
           self.addClass('finish');
           self.callback('on');
          }
        else {
           self.changeStatus('alpha');
           self.callback('off');
          }
        
      }, self.duration);
  };
  
  // Leave the element
  Kudos.prototype.out = function(e) {
    self.removeClass('active');
    clearTimeout(self.timer);
    if (self.currentStatus === 'gamma')
       self.addClass('finish');
  };
  /*
   * Change the status of the widget and
   * aply 3 different classes for the icon
   * in the middle.
   */
  Kudos.prototype.changeStatus = function(state) {
    var self = this;
    if (self.status !== undefined) {
       if (self.currentStatus)
          self.removeClass(self.status[self.currentStatus]);
      self.addClass(self.status[state]);
      self.currentStatus = state;
    }
  };
  

   /*
   * Add <CODE>class</CODE> to <CODE>el</CODE>
   */
  Kudos.prototype.addClass = function(classes) {
    var el = this.el;
    if (el.className.indexOf(classes) == -1)
        el.className = el.className.trim() + ' ' + classes;
  };
  /*
   * Remove <CODE>class</CODE> to <CODE>el</CODE>
   */
  Kudos.prototype.removeClass = function(classname) {
    var el = this.el;
    el.className = el.className.replace(classname, '').trim();
  };
  
  /*
   * Returns <CODE>true</CODE> if <CODE>el</CODE> has
   * the <CODE>class</CODE>, <CODE>false</CODE> otherwise
   */
  Kudos.prototype.hasClass = function(classname) {
    var el = this.el;
    var classes = el.className.split(' '),
        result = false;
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] == classname) {
        result = true;
        break;
      }
    }
    
    return result;
  };
  
  /*
   * Returns <CODE>true</CODE> if the actual
   * device is a touch device, <CODE>false</CODE> otherwise
   *
   * http://stackoverflow.com/a/4819886/1012875
   */
  Kudos.prototype.isTouch = function() {
    return !!('ontouchstart' in window)
        || !!('onmsgesturechange' in window);
  };
  
  /*
   * Saves the amount of a specific widget into localStorage
   * when <CODE>persistent</CODE> is <CODE>true</CODE>.
   */
  Kudos.prototype.save = function(el, amount) {
    console.log('save')
  };
  
  /*
   * Loads the amount of a specific widget from the localStorage
   * when <CODE>persistent</CODE> is <CODE>true</CODE>.
   */
  Kudos.prototype.loadAmount = function(id) {
    var result = _$.elements[id].getAttribute('data-amount') || 0;

    if (_$.persistent) {
      if ((amount = localStorage.getItem('kudos:saved:' + _$.elements[id].getAttribute('data-url'))) != null) {
        result = amount;
      }
    }
    
    return result;
  };
  
  /*
   * Create a ajax request to a backend
   * which just keeps track of the kudos counter
   * via php & mysql
   */
  Kudos.prototype.request = function(el, type) {
    this.callback(null, type);
    /*var xhr;
    
    // Initialize
    try {
     xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } catch(e) {
     xhr = new XMLHttpRequest();
    }
    
    // Change the amount
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var amount = xhr.responseText;
        el.setAttribute('data-amount', amount);

        if (type == 'GET') {
          _$.changeStatus(el, amount == 0 ? 'alpha' : 'beta');
          
          if (_$.persistent
           && localStorage.getItem('kudos:saved:' + el.getAttribute('data-url')) != null) {
            
            _$.changeStatus(el, 'gamma');
          }
        }

        if (type == 'POST') {
          _$.save(el, amount);
        }
      }
    }
    
    var url = "?url="+encodeURIComponent(el.getAttribute('data-url'));
    // Open request
    xhr.open(type, "http://api.Kudos.com/" + url, true);
    xhr.send();*/
  };
  
  // trim polyfill
  ''.trim || (String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g,'');
  });
  
  return Kudos;
})();