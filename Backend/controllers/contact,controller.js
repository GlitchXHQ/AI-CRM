import {Contact} from "../models/contact.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js" 

export const getContacts = asyncHandler(async (req, res) => {
    const {search, tag}=req.query
    const filter={owner: req.user._id}

    if(tag) filter.tags=tag
    if(search)
    {
        const rx=new RegExp(search, "i")
        filter.$or=[{name: rx}, {email: rx}, {phone: rx}]
    }

    const contacts=await Contact.find(filter).sort({favourite: -1, name: 1})
    res.json({success: true, contacts})
})

export const getContact = asyncHandler(async (req, res) => {
    const contact=await Contact.findOne({_id: req.params.id, owner: req.user._id})
    if(!contact) throw new ApiError(404, "Contact not found")
    
    res.json({success: true, contact})
})

export const updateContact =   asyncHandler(async (req, res) => {
    const {owner, ...updates} = req.body
    const contact=await Contact.findOneAndUpdate(
        {_id:req.params.id, owner: req.user._id},
        updates,
        {new: true, runValidators: true}
    )
    if(!contact) throw new ApiError(404, "Contact not found")
    res.json({success: true, message: "Contact updated successfully", contact})
})