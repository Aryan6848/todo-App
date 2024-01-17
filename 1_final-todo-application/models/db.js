const mongoose =require('mongoose')

module.exports.init =async function(){
   await mongoose.connect('mongodb+srv://app:JCaLnVdHZtptFUiV@cluster0.bp2onrk.mongodb.net/myTodoApp?retryWrites=true&w=majority')
}

//hm chahte to direct mongoose.connect wali line likh skte h pr hm chahte h ki hm controlled manner m kam kre isliye hmne init likha h 
//agar init nhi likhte ar jaise hi server wali file m ye require krte database immediately connect ho jata and we don't want this 
//we want ki phlt db connect ho uske baad server start ho.