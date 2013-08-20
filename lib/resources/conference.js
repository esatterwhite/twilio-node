/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * The Twilio "Calls" Resource.
 * @module module:lib/resources/Calls
 * @author Eric Satterwhite
 * @requires module:lib/resources/base
 */
var Base                = require("./base")
  , util                = require("util")
  , ConferenceResource;


/**
 * ReST resoruce to deal with conferences
 * @class module:NAME.Thing
 * @param {TYPE} NAME DESCRIPTION
 * @example var x = new NAME.Thing({});
 */
ConferenceResource = function( options ){
    this.options = options;
};
ConferenceResource.prototype = new Base({
    methods_allowed : [ 'get' ]
    ,resource:"Conferences"
});

ConferenceResource.prototype.participants = function( conf_sid ){
    var opts  // options from call resource
       , methods = new Array( 3 );

    // A static array is a bit more performant than
    // a `hot` runtime array
    methods[0] = 'get';
    methods[1] = 'post';
    methods[2] = 'delete';

    opts                 = util._extend( {}, this.options );
    opts.resource        = opts.resource + "/" + conf_sid + '/Participants';
    opts.methods_allowed = methods;
    return new Base( opts );
};

module.exports = ConferenceResource;
