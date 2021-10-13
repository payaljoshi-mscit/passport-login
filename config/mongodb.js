let mongoose = require('mongoose')
const configDB = 'mongodb://localhost:27017/socialdb'
//mongoose.connect(configDB, { useNewUrlParser: true } )

mongoose.connect(configDB,{ useNewUrlParser: true })
    .then(function(db){
        //return db;
    })
    .catch(function(err){
    	//return null;
    })
module.exports=mongoose;