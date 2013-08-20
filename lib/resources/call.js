/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * The Twilio "Calls" Resource.
 * @module module:lib/resources/Calls
 * @author Eric Satterwhite
 * @requires module:lib/resources/base
 */
var Base          = require( "./base")
  , Recordings    = require('./Recordings')
  , Notifications = require('./Notifications')
  , Calls;

/**
 * DESCRIPTION
 * @class module:NAME.Thing
 * @param {TYPE} NAME DESCRIPTION
 * @example var x = new NAME.Thing({});
 */
CallResource = function( options ){
    this.options = options
};

CallResource.prototype = new Base({
    methods_allowed:[ 'get', 'post' ]
  , resource:"Calls"
});

CallResource.prototype.__defineGetter__('recordings', function( ){
    var opts; // options from call resource
    
    if( !this._recordings ){
        opts                 = this.options;
        opts.resource        = 'Recordings';
        opts.methods_allowed = [ 'get' ];
        this._recordings     = new Recording( opts );
    }

    return this._recordings;
});


CallResource.prototype.__defineGetter__('notifications', function( ){
    var opts; // options from call resource
    if( !this._notifications ){
        opts                 = this.options;
        opts.resource        = 'Notifications';
        opts.methods_allowed = [ 'get' ];
        this._notifications  = new Notifications( opts );
    }

    return this._notifications;
});

module.exports = Calls;