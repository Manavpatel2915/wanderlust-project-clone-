const Joi = require('joi');
const listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        image : Joi.string().allow("",null),
        price : Joi.number().required().min(0),
        location : Joi.string().required(),
        country : Joi.string().required()

    }).required()
});
module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object ({
    review: Joi.object({
        rating: Joi.number().required(),
        Comment: Joi.string().required()  // Changed to uppercase to match model
    }).required()
});