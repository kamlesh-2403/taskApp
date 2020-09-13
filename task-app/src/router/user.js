const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { update } = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail, sendDeleteMail} = require('../emails/account')

router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(501).send(error.messgae)
    }    
})

router.post('/users/login',async(req,res)=>{
   
    try {
        const user =await User.findByCredentials(req.body.email,req.body.password)         
        const token = await user.generateAuthToken()
        res.send({user , token})
    } catch (error) {
        res.send(error)        
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    // dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    // req.user.avatar = req.file.buffer
    // await req.user.save()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

// api to project the image
router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/users/avatar/delete',auth,async(req,res)=>{
    req.user.avatar=null
    await req.user.save()
    
    res.send()
},(error, req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users',auth,async (req,res)=>{
    try {
        const user = await User.find({})
        res.send(user)        
    } catch (e) {
        res.send(e)
    }
})


router.get('/users/me', auth,(req,res)=>{
    // console.log(req.params)

    res.send(req.user)
})


// router.get('/users', auth,(req,res)=>{

//     const nme = req.body.name
//     if(nme){
//         User.find({name:nme}).then((users)=>{
//             if(!users){
//                 res.status(404).send()
//             }
//             res.send(users)
//         }).catch((err)=>{
//             res.send(err)
//         })
//     }
//     else{
//         User.find({}).then((users)=>{
//                     res.send(users)
//                 }).catch((err)=>{
//                     res.send(err)
//                 })
//     }
// })


router.patch('/users/:id',async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.send({error:"Invalid update!"})
    }

    try {
        // when updating the middleware won't work with the below code 
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true , runValidators:true})

        // const user = await User.findById(req.params.id)
        
        // updates.forEach((update)=> user[update] = req.body[update])
        // await user.save()

        // if(!user){
        //     return res.send()
        // }
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(e)
    }

})

router.delete('/users/me',auth,async (req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        await req.user.remove()
        sendDeleteMail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router