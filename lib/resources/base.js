/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * Provides the Base representation of a twilio ReST Resource.
 * @module /lib/resources/base
 * @author Eric Satterwhite
 * @requires underscore
 * @requires debug
 * @requires request
 **/
var _       = require( "underscore" )           //
  , info    = require("../../package.json")     //
  , request = require( 'request' )              //
  , debug   = require("debug")("resource/base") //
  , Base                                        //
  , contains                                    //
  , capitalize                                  //
  , processKeys;                                //


capitalize = function( str ){
    var s = String( str );
    return s.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

contains = function( arr, item ){
    return arr.indexOf( item ) != -1;
}

/**
 * This function camelcases keys and converts date values
 * @param {Object} source object of whose keys to comvert
 **/
processKeys = function(source) {
    source = source || {};
    Object.keys(source).forEach(function(key) {

        //Supplement underscore values with camel-case
        if (key.indexOf("_") > 0) {
            var cc = key.replace(/_([a-z])/g, function (g) {
                return g[1].toUpperCase();
            });
            source[cc] = source[key];
        }

        //process any nested arrays...
        if (Array.isArray(source[key])) {
            source[key].forEach(processKeys);
        } else if ( typeof( source[key] ) == "object" )  {
            processKeys( source[key] );
        }
    });

    //Look for and convert date strings for specific keys
    ["startDate", "endDate", "dateCreated", "dateUpdated", "startTime", "endTime"].forEach(function(dateKey) {
        if (source[dateKey]) {
            source[dateKey] = new Date(source[dateKey]);
        }
    });
};

/**
 * Root HTTP resource responsible for All CRUD actions
 * @class module:NAME.Base
 * @param {TYPE} NAME DESCRIPTION
 * @example var Base = require("./lib/resources/base");
var base = new Base({
    "apiVersion":"compat/twil/dev"
    ,"defaultHost":"aortlieb-freeswitch:8002"
    ,"resource":"Calls"
    ,accountSid:"wombat.my.corvisacloud.com"
    ,authToken:'e2f37a3498401460119959f20b0a07af'
});
base.post({
    from:'+16512223333' //The Twilio number you've bought or configured
    ,to:'+16513334444' //The number you would like to send messages to for testing
    ,url:'https://demo.twilio.com/welcome/voice'
}, function(){
    console.log( arguments )
})
 */
var resource_defaults = {
    methods_allowed: [ "get", "put", "post", "delete" ]
    ,resource:"/"
    ,accountSid:""
    ,authToken:null
    ,host:null
    ,version:null
    ,secure:false
}

Base = function( options ){
    this.options = options 
}

Base.prototype = /** @lends module:NAME.Base.prototype */{


    /**
     * DESCRIPTION
     * @module:lib/resources/base.Base#get NAME
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
     get: function( options, callback ){
        var args = this.process( arguments );
        debug("GET " + this.uri )

        return this.request({
            method:"GET"
          , url:this.options.resource
          , qs: args.twilioParams
        }, callback );
    }

    /**
     * DESCRIPTION
     * @method module:lib/resources/base.Base#list
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
    , list: function( options, callback ){
        return this.get(options, callback );
    }

    /**
     * DESCRIPTION
     * @method module:lib/resources/base.Base#put
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
    , put: function( options, callback ){
        var args = this.process( arguments )
        debug("PUT " + this.uri )

        return this.request({
            method:"PUT"
            , url: this.options.resource
            , form: args.twilioParams
        }, callback );
    }

    /**
     * DESCRIPTION
     * @method module:lib/resources/base.Base#update
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
    , update: function( options, callback ){
        return this.put( options, callback );
    }

    /**
     * DESCRIPTION
     * @method module:lib/resources/base.Base#post
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
    , post: function( options,  callback ){
        var args = this.process( arguments )
        debug("POST " + this.uri )

        return this.request({
            method:"POST"
            , url: this.options.resource
            , form: args.twilioParams
        }, callback );
    }

    /**
     * DESCRIPTION
     * @method module:lib/resources/base.Base#delete
     * @param {Object} options request options
     * @param {Function} [callback] optional callback to be executed when the http request completes
     **/
    , "delete": function( options, callback ){
        var args = this.process( arguments )
        debug("DELETE " + this.uri )
        return this.request({
            method:"DELETE"
            , url: this.options.resource
            , form: args.twilioParams
        }, callback );
    }

    /**
     * cleans incoming parameters for a rest call to twilio
     * @private
     * @param {Array} arguments
     * @returns {Object} DESCRIPTION
     */
    ,process: function( args ){
        var params        // incoming HTTP request parameters
          , twilioParams  // cleaned parameters to send to twilio
          , callback      // callback function to execute when the request finishes
          , twilioKey;    // cached value of a clened parameter key

        twilioParams = {};

        if( typeof args[0] == "function" ){
            params = {}; callback = args[0];
        } else{
            params = args[0]; callback = args[1];
        }

        for( var key in params ){
            if( params.hasOwnProperty( key ) ){
                twilioKey = capitalize( key )
                twilioParams[ twilioKey ] = params[ key ];
            }
        }

        return {
            twilioParams : twilioParams
          , callback     : callback
        };

    }

    /**
     * Sends a valid request to twilio
     * @method lib/resources/base#request
     * @param {Object} options request options
     * @param {Function} [callback] callback function to execute when therequest has finished
     * @return
     **/
    ,request: function( options, callback ){
        var that = this;
        if( !contains( this.options.methods_allowed, options.method.toLowerCase() ) ){
            debug( "method %s not allowed ", options.method );
            return;
        }
        options     = options || {};
        options.url = this.uri +  ( options.id || "" );
        options.headers = {
            "Accept":"application/json",
            "User-Agent":"twilio-nonde/" + info.version
        };

        // if there is no callback, make a fake one so we don't die
        callback = typeof callback === 'function' ? callback : function(){};

        request(options,function(err, response, body ){
            var data;
            var error = null;

            try {
                data = err || !body ? {status: 500, message: "Empty body"} : JSON.parse(body);
            } catch (e) {
                data = { status: 500, message: (e.message || "Invalid JSON body") };
            }

            //request doesn't think 4xx is an error - we want an error for any non-2xx status codes
            if (err || (response && (response.statusCode < 200 || response.statusCode > 206))) {
                error = {};
                // response is null if server is unreachable
                if (response) {
                    error.status   = response.statusCode;
                    error.message  = data ? data.message : "Unable to complete HTTP request";
                    error.code     = data && data.code;
                    error.moreInfo = data && data.more_info;
                } else {
                    error.status   = err.code;
                    error.message  = "Unable to reach host: \""+that.options.defaultHost+"\"";
                }
            }
            processKeys(data);

            //hang response off the JSON-serialized data
            data.nodeClientResponse = response;

            callback.call(that, error, data, response);
        })
    }
};


Base.prototype.__defineGetter__("baseurl",function(){
    return "http://" + this.options.defaultHost + "/" + this.options.apiVersion
});

Base.prototype.__defineGetter__('uri', function( ){
    var protocol = !!this.options.secure ? "https:/" : "http:/"
    var args = [
        protocol
      , this.options.defaultHost
      , this.options.apiVersion
      , "Accounts"
      , this.options.accountSid
      , this.options.resource

    ]

    if( !!this.options.id ){
        args.push( this.options.id )
    }

    return args.join('/')
});

Base.prototype.__defineGetter__('options', function( ){ 
    return this._options
});

Base.prototype.__defineSetter__('options', function( opts ){
    this._options = _.extend( (this.options || _.defaults({}, resource_defaults)), opts )
});

module.exports = Base
