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
 * DESCRIPTION
 * @class module:NAME.Thing
 * @param {TYPE} NAME DESCRIPTION
 * @example var x = new NAME.Thing({});
 */
ConferenceResource = function( options ){
    ,participants: 
};
ConferenceResource.prototype = new Base({
    methods_allowed : [ 'get' ]
    ,resource:"Conferences"
});

ConferenceResource.prototype.participants = function( conf_sid ){
    var opts  // options from call resource
       , methods = new Array( 3 );

    methods.push( 'get', "delete", "post" )
    opts                 = util._extend( {}, this.options );
    opts.resource        = opts.resource + "/" + conf_sid + '/Participants';
    opts.methods_allowed = methods;
    return new Base( opts );
};
module.exports = ConferenceResource
