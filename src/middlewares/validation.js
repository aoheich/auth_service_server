import { body } from "express-validator";

export const user_creds_val = [
    body("email")
        .exists().withMessage("Email field must be present")
        .notEmpty().withMessage("Email field must have a value")
        .isEmail().withMessage("Enter a Valid Email"),
    body("password")
        .exists().withMessage("Password field must be present")
        .notEmpty().withMessage("Password field must have a value")
        .isString().withMessage("Password must be a string")
        .isLength({max: 10, min: 5}).withMessage("Length must be between 5 and 10 characters")       
]

