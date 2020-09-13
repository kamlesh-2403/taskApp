require('dotenv').config()
const express = require('express')
const port = process.env.PORT
require('./db/mongoose')
const multer = require('multer')

const userRouter = require('./router/user')
const taskRouter = require('./router/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



// const main = async () =>{

//     // to fetch owner_id of a task
//     // const task = await Task.findById('5f57937caa321b19b08916d9')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner._id)

//     // to fetch all the tasks from a user(logged in )
//     // const user = await User.findById('5f57426a71518566a49b5264')
//     // await user.populate('tasks').execPopulate()
//     // console.log(user.tasks)

// }
// main()

const upload = multer(
    { dest:'images' }
)
app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send()
})

app.listen(port,()=>{
    console.log("connected successfully")
})
