import { Lead } from "../models/lead.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"

export const getLeads = asyncHandler(async (req, res) => {
    const { status, priority, source, search } = req.query
    const filter = { owner: req.user._id }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (source) filter.source = source
    
    if (search) {
        
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const rx = new RegExp(escapedSearch, "i")
        filter.$or = [{ name: rx }, { email: rx }, { phone: rx }]
    }

    const leads = await Lead.find(filter).sort({ order: 1, createdAt: -1 })

    res.json({
        success: true,
        count: leads.length,
        leads
    })
})

export const getLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id })
    if (!lead) throw new ApiError(404, "Lead not found")

    res.json({
        success: true,
        lead
    })
})

export const createLead = asyncHandler(async (req, res) => {
    const lead = await Lead.create({ ...req.body, owner: req.user._id })   
    
    res.status(201).json({
        success: true,
        message: "Lead created successfully",
        lead
    })
})

export const updateLead = asyncHandler(async (req, res) => {
    
    const { owner, ...updates } = req.body

    const lead = await Lead.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        updates,
        { new: true, runValidators: true }
    )
    
    if (!lead) throw new ApiError(404, "Lead not found")

    res.json({
        success: true,
        message: "Lead updated successfully",
        lead
    })
})

export const deleteLead = asyncHandler(async (req, res) => { 
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!lead) throw new ApiError(404, "Lead not found")

    res.json({
        success: true,
        message: "Lead deleted successfully"
    })
})

export const reorderLeads = asyncHandler(async (req, res) => {
    const { updates } = req.body
    
    if (!Array.isArray(updates) || updates.length === 0) {
        throw new ApiError(400, "Invalid updates array")
    }

    const bulkOps = updates.map((u) => ({
        updateOne: {
            filter: { _id: u.id, owner: req.user._id }, 
            update: { $set: { status: u.status, order: u.order } }
        }
    }))

    await Lead.bulkWrite(bulkOps)

    res.json({
        success: true,
        message: "Leads reordered successfully"
    })
})