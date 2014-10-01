var mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	AliasSchema	= new Schema({
		from	: String,
		to		: String
	}),
	Alias = mongoose.model('Alias', AliasSchema);

mongoose.connect('mongodb://localhost/aliases');



exports.hook_rcpt = function (next, connection, params) {

	var that = this,
		rcpt = params[0];

    that.loginfo( JSON.stringify( params ) );
    that.loginfo("Got recipient: " + rcpt);

	Alias.find().exec(function(err, data){ that.loginfo( JSON.stringify( data ) ); });

	var search = rcpt.user + '@' + rcpt.host,
		searchObj = { from : search };
	that.loginfo( JSON.stringify( search ) );
	that.loginfo( JSON.stringify( searchObj ) );

    Alias.find( searchObj ).exec(function (err, alias){
	    if( err ) throw err;

	    that.loginfo( JSON.stringify( alias ) );

	    if( alias.length ){ // we found a perfect match
	    	var newTo = alias[0].to.split('@');

		    rcpt.user = newTo[0];
			rcpt.host = newTo[1];
			that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			that.loginfo("Got recipient: " + rcpt);
			that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
			next();

	    }else{ // look for a global quesy

				var search = '*@' + rcpt.host,
				searchObj = { from : search };
			that.loginfo( JSON.stringify( search ) );
			that.loginfo( JSON.stringify( searchObj ) );


		    Alias.find( searchObj ).exec(function (err, aliasGlobal){
			    if( err ) throw err;

			    that.loginfo( JSON.stringify( aliasGlobal ) );

			    if( aliasGlobal.length ){ // we found a perfect match
			    	var newTo = aliasGlobal[0].to.split('@');

				    rcpt.user = newTo[0];
					rcpt.host = newTo[1];
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo("Got recipient: " + rcpt);
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					next();

			    }else{ // No Aliases found

				    rcpt.user = 'georgelaughalot';
					rcpt.host = 'gmail.com';
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo("Got recipient: " + rcpt);
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					that.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
					next();

			    }
		    })

	    }
    })
}
