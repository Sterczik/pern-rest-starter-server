import { ValidationSchema } from 'class-validator';

export let ForgotPasswordValidationSchema: ValidationSchema = {
    name: "forgotPasswordValidationSchema",
    properties : {
        email: [
            {
                type: "isEmail",
                constraints: [],
                message: 'Invalid email.'
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Email is required.'
            }
        ]
    }
}