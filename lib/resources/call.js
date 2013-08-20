/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * The Twilio "Calls" Resource.
 * @module module:lib/resources/call
 * @author Eric Satterwhite
 * @requires module:lib/resources/base
 */
var Base          = require( "./base")
  , util          = require('./util')
  , CallResource;

/**
 * DESCRIPTION
 * @class module:lib/resources.call
 * @param {Object} options
 * @example var x = new NAME.Thing({});
 */
CallResource = function( options ){
    this.options = options || {};
};

CallResource.prototype = new Base({
    methods_allowed:[ 'get', 'post' ]
  , resource:"Calls"
});

/**
 * returns the sub recordings resource for a specific call
 * @method module:lib/resources/call#recordings
 * @param {String} sid The sid for a specific call
 * @return {Resource} a new reousource instance configured to interact with recordings
 **/
CallResource.prototype.recordings = function( call_sid ){
    var opts; // options from call resource

    opts                 = util._extend( {}, this.options );
    opts.resource        = 'Calls/' + call_sid + '/Recordings';
    opts.methods_allowed = [ 'get' ];
    return new Base( opts );
}
/**
 * returns the sub notifications resource for a specific call
 * @method module:lib/resources/call#notifications
 * @param {String} sid the sid for a specific call
 * @return {Resource} a new resource configured to to interact with notifications
 **/
CallResource.prototype.notifications = function( call_sid ){
    var opts; // options from call resource

    opts                 = util._extend( {}, this.options );
    opts.resource        = 'Calls/' +  call_sid + '/Notifications';
    opts.methods_allowed = [ 'get' ];
    return new Base( opts );
}

module.exports = Calls;