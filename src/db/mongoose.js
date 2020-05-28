const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://subham:xe4XUAcuscL8wZZm@mongocluster-5hduw.mongodb.net/task-manager?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex: true
}).then(() => console.log('connected')).catch(() => console.log('error while connecting!'))
