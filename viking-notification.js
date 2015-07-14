Viking.NotificationCenter = Viking.View.extend({
    
    id: "notification-center",
    
    initialize: function (options) {
        this.options = _.extend({}, options);
    },
    
    render: function () {
        this.$el.appendTo(document.body);
        return this;
    },

    send: function (notice) {
        if (!this.$el.is(":visible")) {
            this.render();
        }
        
        notice = this.subView(NotificationView, _.extend({}, this.options, notice));
        this.listenTo(notice, 'remove', this.notificationRemoved);
        this.listenTo(notice, 'close', this.closeNotice);
        notice.render();
        this.$el.prepend(notice.el);
        notice.$el.addClass('slideInDown').one('animationend', function() {
            notice.$el.removeClass('slideInDown');
            notice.setExpire();
        });
        
        return notice;
    },
    
    closeNotice: function (notice) {
        notice.$el.addClass('slideOutUp').one('animationend', function() {
            notice.remove();
        });
    },
    
    info: function (message, options) {
        this.send(_.extend({ level: 'info', message: message }, options));
    },
    
    warn: function (message, options) {
        return this.send(_.extend({ level: 'warning', message: message }, options));
    },
    
    error: function (message, options) {
        return this.send(_.extend({ level: 'error', timeout: 10000, message: message }, options));
    },

    clear: function () {
        this.$el.addClass('slideOutUp').one('animationend', _.bind(function() {
            this.remove();
        }, this));
    },

    notificationRemoved: function() {
        if (this.subViews.length === 0) {
            this.remove();
        }
    }
});

NotificationView = Backbone.View.extend({
    
    className: "notification",
    
    defaultOptions: {
        timeout: false,
        template: function (message) { return '<a class="close">x</a>' + message; }
    },

    events: {
        'click .close': 'close',
        'mouseover':    'stopExpire',
        'mouseout':     'setExpire'
    },

    initialize: function (options) {
        this.options = _.extend({}, this.defaultOptions, options);
    },

    render: function () {
        this.$el.html(this.options.template(this.options.message));
        this.$el.addClass(this.options.level)

        return this;
    },

    close: function () {
        this.trigger('close', this);
    },

    setExpire: function () {
        if (this.options.timeout) {
           this.timerID = window.setTimeout(_.bind(this.close, this), this.options.timeout);
        }
    },

    stopExpire: function () {
        window.clearTimeout(this.timerID);
    }
});