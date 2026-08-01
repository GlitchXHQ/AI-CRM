export class ApiError extends Error{
    constructor(statusCode,message){
        super(message)
        this.statusCodes=statusCode
        this.isOperational=true
        Error.captureStackTrace?.(this,this.constructor)
    }
}