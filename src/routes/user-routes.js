const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router()

//creating new user using save method
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error.message)
    }
  
})

//logging in the user
router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) //creating your own fuction
        
        const token = await user.generateAuthToken()
        
        res.send({user,token})
    
    } catch (e) {        
        
        res.status(400).send(e)
        
    }
})

//logging out the user
router.post('/users/logout',auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{ //we are removing the token from the token array which was used for signin
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
        
    } catch (e) {
        res.sendStatus(500)
    }
})

//logging out from all devices
router.post('/users/logoutAll',auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        console.error(e)
        
        res.sendStatus(500)
    }
})

//get your own profile
router.get('/users/me', auth, async (req, res) => {
   
   res.send(req.user)
   
})
//getting a single user 
router.get('/users/:id',async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(400).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('invalid updates!')
    }

    try {
        updates.forEach(update => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        //This approach will bypass mongoose does not allow to run mongoose middleware like(pre method)
        //const user = await User.findByIdAndUpdate(req.params.id, req.body,{ new: true, runValidators:true })

        res.send(req.user)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.delete('/users',auth, async (req,res) => {
    try {
        await req.user.remove()

        res.send(req.user)
    } catch (error) {
        res.sendStatus(500)
    }
})

module.exports =router
