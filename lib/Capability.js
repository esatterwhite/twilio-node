/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * Module for handling twilio capcabilitys for authenticated sessions
 * @module module:lib.Cabability
 * @author Eric Satterwhite
 * @requires jwt-simple
 * @requires querystring
 * @requires nconf
 * @version 1.1.5
 **/
var jwt   = require('jwt-simple')  // module for generating web tokens
  , qs    = require('querystring') // node query sring module
  , nconf = require('nconf')       // configuration loading module
  , Capability                     // Primary Capability class
  , CapabilityError                // Generacl Capability Error Class
  , allowables                     // hash map that contains allowable incoming / outgoing handlers
  , scopeUriFor;                   // utility function to re-scope URIs




allowables = {

    outgoing: function(appSid, params) {
        this.outgoingScopeParams = {
            appSid:appSid
        };

        if (params) {
            this.outgoingScopeParams.appParams = qs.stringify(params);
        }
    }

    ,incoming: function( name ) {
        this.clientName = name;
        this.capabilities.push(scopeUriFor('client', 'incoming', {
            clientName:name
        }));

        return this;
    }

    , events: function(filters) {
        var scopeParams = {
            path:'/2010-04-01/Events'
        };

        if (filters) {
            scopeParams.params = filters;
        }
        this.capabilities.push(scopeUriFor('stream', 'subscribe', scopeParams));

    }

};

function scopeUriFor(service, privilege, params) {
    var scopeUri = 'scope:'+service+':'+privilege;
    if (params) {
        scopeUri = scopeUri+'?'+qs.stringify(params);
    }
    return scopeUri;
}


CapabilityError = function( msg ){
    this.message = msg;
    this.name = "CapabilityError";
    this.stack = new Error().stack;
};

CapabilityError.prototype = new Error();


/**
 * Enables client access to Twilio's VoIP platform
 * @class module:lib.Capability
 * @param {String} [sid] application sid. Will use process.evn.TWILIO_ACCOUNT_SID if not supplied
 * @param {String} [token] Account auth token. WIll use process.evn.TWILIO_AUTH_TOKEN if not suppplied
 * @example var x = new NAME.Capability();
 */
function Capability(sid, tkn) {
    nconf.env()
         .argv();

    sid = sid || nconf.get("TWILIO_ACCOUNT_SID");
    tkn = tkn || nconf.get("TWILIO_AUTH_TOKEN");

    if (!sid || !tkn) {
            throw new CapabilityError(
                'Capability requires an Account SID and Auth Token set explicitly ' +
                'or via the TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables'
            )
    }

    //if auth token/SID passed in manually, trim spaces
    this.accountSid   = sid.replace(/ /g,'');
    this.authToken    = tkn.replace(/ /g,'');
    this.capabilities = [];
}


Capability.prototype = /** @lends module:lib.Capability.prototype */ {

    /**
     * Allows incoming things. Should use the allow method
     * @chainable
     * @depricated
     * @method module:lib.CapabilityallowClientIncoming:#
     * @param {String} name The name of the client 
     * @return {Capablity} current capability instance 
     **/
    allowClientIncoming: function( name ) {
        return this.allow( 'incoming', name )
    }

    /**
     * Allows outgoing things. Should use the new allow method.
     * @chainable
     * @depricated
     * @method module:lib.Capability#allowClientOutgoing
     * @param {String} Valid application side
     * @param {String?} [params] options params to send
     * @return {Capablity} current capability instance 
     **/
    , allowClientOutgoing: function(appsid, params) {
        return this.allow( 'outgoing', appsid, params );
    }

    /**
     * enables twilio events streams. You should use the general allow method.
     * @chainable
     * @depricated
     * @method module:lib.Capability#allowEventStream
     * @param {TYPE} NAME ...
     * @param {TYPE} NAME ...
     * @return {Capablity} current capability instance 
     **/
    , allowEventStream: function(filters) {
        return this.allow('events', filters )
    }
    
    /**
     * Generates a cabapility token with the configured permissions
     * @method module:lib.Capability#generate:
     * @param {Number} [timeout=3600]
     * @return {String} Valid token
     **/
    , generate: function(timeout) {
        var capabilities = this.capabilities.slice(0),
            expires = timeout||3600;

        //Build outgoing scope params lazily to use clientName (if it exists)
        if (this.outgoingScopeParams) {
            if (this.clientName) {
                this.outgoingScopeParams.clientName = this.clientName;
            }
            capabilities.push(scopeUriFor('client', 'outgoing', this.outgoingScopeParams));
        }

        var payload = {
            scope: capabilities.join(' '),
            iss: this.accountSid,
            exp: Math.floor(new Date() / 1000) + expires
        };

        return jwt.encode(payload, this.authToken);
    }

    /**
     * compresses the API into a single entry point. Used to allow multiple capabilities for the associated account.
     * Default options are `incoming`, `outgoing`, `events`
     * @chainable
     * @method module:lib.Capability#allow
     * @param {String} the identifiably thing to allow - "incoming"  / "outgoing"
     * @param {...Object} arguments the arguments to be passed along to the executing method 
     * @return {Capability} The current capability instance
     * @example var cap = new Capability();
cap.allow('incoming', "bob" );
cap.allow("outgoing", "APP_SID")
     **/
    ,allow: function( /* name [, arguments ] */){
        var name = args.shift( )
           ,args = Array.prototype.slice.call( arguments )
           ,allower = allowables[ name ];

        if( allower ){
            allower.apply( this, args );
        }

        return this;
    }
};

module.exports = Capability;