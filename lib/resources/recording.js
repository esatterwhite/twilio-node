/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * The Twilio "Recordings" Resource.
 * @module module:lib/resources/recording
 * @author Eric Satterwhite
 * @requires module:lib/resources/base
 */
var Base          = require( "./base")
  , util          = require('./util')
  , RecordingResource;



/**
 * A ReST resource for interacting with call recordings
 * @class module:lib/resources.recording
 * @param {Object} options
 */
RecordingResource = function( options ){
    this.options = options || {};
};

RecordingResource.prototype = new Base({
    methods_allowed:[ 'get', 'delete' ]
  , resource:"Recordings"
});

/**
 * returns a configured transcriptions resource for a specific recording
 * @method module:lib/resoruces/recording#transcriptions
 * @param {String} sid a sid for a specific recording
 * @return {Resource} a new resource instance configured for transcriptions for the provided recording
 **/
RecordingResource.prototype.transcriptions = function( rec_sid ){
    var opts; // options from call resource
    opts                 = util._extend( {}, this.options );
    opts.resource        = opts.resource + "/" + rec_sid + '/Transcriptions';
    opts.methods_allowed = [ 'get' ];
    return new Base( opts );
}