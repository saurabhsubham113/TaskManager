const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()

//creating new tasks using save method
router.post('/tasks',auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)

    } catch (error) {
        res.status(400).send(error)
    }
})

//get task?completed=true
router.get('/tasks',auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        
        await req.user.populate({
            path:'myTask',
            match,
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            options:{sort}            //1 for ascending and -1 for descending
            
        }).execPopulate()    //virtual mytask created in the user table
        res.send(req.user.myTask)
    } catch (error) {
        res.status(500).send(error)
    }
})

//getting tasks by id
router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id,owner:req.user._id })

        if (!task)
            return res.status(400).send()

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})



router.patch('/tasks/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send('invalid updates!')
    }
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})

        if (!task) return res.sendStatus(400)

        updates.forEach(update => task[update] = req.body[update])

        await task.save()
        
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        
        res.send(task)

    } catch (error) {
        res.status(404).send(error)
    }
})


router.delete('/task/:id',auth , async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({_id, owner:req.user._id})
        if (!task) return res.sendStatus(400)
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router