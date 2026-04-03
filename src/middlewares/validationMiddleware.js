const Joi = require('joi');

const createOrderSchema = Joi.object({
    shippingAddress: Joi.object({
        fullName: Joi.string().required().messages({
            'string.empty': 'Họ tên không được để trống',
            'any.required': 'Bắt buộc phải có họ tên'
        }),
        address: Joi.string().required().messages({
            'string.empty': 'Địa chỉ không được để trống',
            'any.required': 'Bắt buộc phải có địa chỉ'
        }),
        city: Joi.string().required().messages({
            'string.empty': 'Thành phố không được để trống',
            'any.required': 'Bắt buộc phải có thành phố'
        }),
        phone: Joi.string().min(10).max(11).required().messages({
            'string.empty': 'Số điện thoại không được để trống',
            'any.required': 'Bắt buộc phải có số điện thoại'
        }) 
    }).required()
});
const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Tên không được để trống',
        'any.required': 'Bắt buộc phải nhập tên'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không đúng định dạng (phải có @...)',
        'any.required': 'Bắt buộc phải nhập Email'        
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password không được để trống',
        'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
        'any.required': 'Bắt buộc phải nhập mật khẩu'
    }),
    phone:Joi.string().min(10).max(11).required().messages({
        'string.empty': 'Số điện thoại không được để trống',
        'string.min': 'Số điện thoại phải có ít nhất {#limit} chữ số',
        'string.max': 'Số điện thoại không được vượt quá {#limit} chữ số',
        'any.required': 'Bắt buộc phải nhập số điện thoại'        
    }),
    address: Joi.string().optional(),
    image: Joi.string().optional()
})
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Email không đúng định dạng',
        'any.required': 'Bắt buộc phải nhập email'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'any.required': 'Bắt buộc phải nhập mật khẩu'
    })
});
const validateCreateOrder = (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((err) => err.message);
        return res.status(400).json({
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: errorMessages
        });
    }
    next(); 
}
const validateRegister = (req, res, next) =>{
    const {error} = registerSchema.validate(req.body, { abortEarly: false});
    if(error){
        const errorMessages = error.details.map((err) => err.message);
        return res.status(400).json({
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: errorMessages
        });
    }
    next();
}
const validateLogin = (req, res, next) =>{
    const {error} = loginSchema.validate(req.body, { abortEarly: false});
    if(error){
        const errorMessages = error.details.map((err) => err.message);
        return res.status(400).json({
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: errorMessages
        });
    }
    next();
}
module.exports = { 
    validateCreateOrder, 
    validateRegister, 
    validateLogin 
};