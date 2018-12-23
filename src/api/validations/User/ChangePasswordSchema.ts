import { ValidationSchema } from 'class-validator';

export let ChangePasswordValidationSchema: ValidationSchema = {
    name: "changePasswordValidationSchema",
    properties : {
        oldPassword: [
            {
                type: "minLength",
                constraints: [6]
            },
            {
                type: "maxLength",
                constraints: [30]
            },
            {
                type: "isString",
                constraints: []
            },
            {
                type: "matches",
                constraints: [/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/]
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Old password is required.'
            }
        ],
        newPassword: [
            {
                type: "minLength",
                constraints: [6]
            },
            {
                type: "maxLength",
                constraints: [30]
            },
            {
                type: "isString",
                constraints: []
            },
            {
                type: "matches",
                constraints: [/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/]
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'New password is required.'
            }
        ],
        newPasswordConfirm: [
            {
                type: "isString",
                constraints: []
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Password confirmation is required.'
            }
        ]
    }
}