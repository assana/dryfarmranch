//
//
// Copyright 2024 DigitalPaso LLC
//
//
const mongoose 			= require('mongoose');
var passportLocalMongoose 	= require("passport-local-mongoose");
const validator 		= require('validator');
const jwt 			= require('jsonwebtoken');
const bcrypt 			= require('bcryptjs');
const smartTruncate     	= require('smart-truncate');
const { DateTime } 		= require("luxon");

const today = DateTime.now();

var UserSchema = new mongoose.Schema({
    username: {
	type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error ('{VALUE} is not a valid email.');
            }
        }
    },
    userID: {
        type: String,
        default: ""
    },
    email: {
	type: String,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
	    if (process.env.NODE_ENV === 'production') {
		if (!validator.isEmail(value)) {
		    throw new Error ('{VALUE} is not a valid email.');
		}
	    }
        }
    },
    password: {
        type: String,
        trim: true,
        //required: true,
        //minlength: 10,
        validate(value) {
	    if (process.env.NODE_ENV === 'production') {
		if (value.toLowerCase().includes('password')) {
		    throw new Error ('Password can not include the word password.');
		}
		if (!validator.isStrongPassword(value, {minLength: value.minlength})) {
		    throw new Error (`Password must be at least ${value.minlength} characters 
			and contain at least one upper case and one symbol.`);
		}
	    }
	}
    },
    firstname: {
    	type:	String,
	trim:	true,
	default: ''
    },
    lastname:  {
	type:	String,
	trim:	true,
	default: ''
    },
    contactPhone: {
	type: String,
        /*required: true,*/
        validate(value) {
            if (process.env.NODE_ENV === 'production') {
                if (!validator.isMobilePhone(value, 'en-US')) {
                    throw new Error ('{VALUE} is not a valid email.');
                }
            }
        }
    },
    startDate: {
        type: Date,
        //required: true,
        default: today
    },
    expirationDate: {
        type: Date,
        //required: true,
        default: today
    },
    title: {
        type: String,
        validate(value) {
            if (!validator.isIn(value, ['DEMO', 'UBER', 'ADMIN', 'CIVILIAN', ''])) {
                throw new Error ('{VALUE} is not a valid user type.');
            }
        },
	default: 'STAFF'
    }, 
    bio: {
	type: String,
	default: ''
    },
    avatar: {
        type: Buffer,
	default: undefined
    },
    hasAvatar: {
        type:   Boolean,
        default: false
    },
    tokens: [{
	access: {
	    type: String,
	    require: true,
	},
	token: {
	    type: String,
	    require: true,
	}
    }],
}, {
    // options
    timestamps: true,
});

// Read this as: Users have a field named paychecks which is a Paycheck type

UserSchema.methods.truncate = (bio, count) =>
{
    return (smartTruncate(bio, count, {mark:"..."}));
}

UserSchema.methods.bioLength = function ()
{
    return (this.bio.length);
}

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    /*
    return _.pick(userObject, ['_id', 'email']);
    */
    return userObject;
};

UserSchema.methods.assignAuthToken = async function (token) {
    var user = this;
    user.tokens = user.tokens.concat({token});
    await user.save();
    return (token);
}

UserSchema.methods.generateAuthToken = async function () {
    var user = this;

    const secret = process.env.JWT_SECRET;
    const expiration = {expiresIn: '7 days'};
    const token = jwt.sign({_id: user._id.toString()}, secret, expiration);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return (token);
}

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({$pull:{
	tokens: {token}
    }});
};

// Manual solution for removing sensitive data
UserSchema.methods.getPublicProfile = function() {
    const user = this;
    // get a raw user data
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

UserSchema.statics.findByToken = function (token) {
    var User = this;	// Upper case... for model methods
    var decoded;

    try {
	decoded = jwt.verify (token, process.env.JWT_SECRET);
    } catch (e) {
	return Promise.reject();
    }

    return User.findOne({
	'_id': decoded._id,
	'tokens.token': token,
	'tokens.access': 'auth'
    });
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error ('Unable to login.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error ('Unable to login.');
    }
    return user;
}

UserSchema.statics.findGuest = async () => {
console.log('Are there any guests?');
    const user = await User.findOne({isGuest: true});
    return user;
}

UserSchema.statics.getGuestUserId = async () => {
    try {
	const user = await User.findOne({isGuest: 'true'});
	return user._id;
    } catch (e) {
	console.log('Can not find a guest user!');
	return null;
    }
}

// Hash the plain text password
UserSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash (user.password, 8);
    } else {
}
    next();
});

// delete user's history
UserSchema.pre('remove', async function(next) {
    const user = this;
    // Clean up user's crap...
    //await Orders.deleteMany ({merchant: user._d});
    next();
});

UserSchema.pre('findById', async function(next) {
    const user = this;
console.log('[Pre] In user find', user._id);
    if (0) { //user.isEmpty('avatar')) {
console.log('[Pre] In user find with empty avatar');
    }
    else {
    }
    next();
});

/*
UserSchema.post(/^find/, async function(found, next) {
    const user = this;
    if (found.avatar) found = {..., hasAvatar:true};
    else found.hasAvatar = false;

    console.log('[Post] This fired after you ran a find query', found.hasAvatar);
    next();
});
*/

UserSchema.methods.paths = async function()
{
    const paths = await UserSchema.paths;
    const fields = await Object.keys(paths);
    return fields;
}

var options = {
    errorMessages: {
        MissingPasswordError: 	'No password was given',
        AttemptTooSoonError: 	'Account is currently locked. Try again later',
        TooManyAttemptsError: 	'Account locked due to too many failed login attempts',
        NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
        IncorrectPasswordError: 'Password or username are incorrect',
        IncorrectUsernameError: 'Password or username are incorrect',
        MissingUsernameError: 	'No username was given',
        UserExistsError: 	'Username is already registered. Try again.'
    }
};

UserSchema.plugin(passportLocalMongoose, options);

const User              = mongoose.model("User", UserSchema);
module.exports          = {User};
