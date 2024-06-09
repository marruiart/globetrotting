import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export class PasswordValidator {

    /**
 * Custom validator to ensure the password meets specified criteria.
 *
 * This static method returns a ValidatorFn that validates whether a password:
 * - Contains at least one digit.
 * - Contains at least one lowercase letter (including accented characters).
 * - Contains at least one uppercase letter (including accented characters).
 * - Is at least 8 characters long.
 *
 * @param controlName The name of the control to validate. Default is an empty string.
 * @returns A ValidatorFn that performs the validation.
 */
    public static passwordProto(controlName: string = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let password = '';
            if (control instanceof FormControl) {
                password = control?.value;
                if (!control.hasValidator(Validators.required)) {
                    return null;
                }
            } else {
                password = control.get(controlName)?.value;
            }
            if (password && !password.match(/^(?=.*\d)(?=.*[a-zá-ú\u00f1ä-ü])(?=.*[A-ZÁ-Ú\u00d1Ä-Ü])[0-9a-zá-úä-üA-ZÁ-ÚÄ-Ü \u00d1$-/@:-?{-~!"^_`\[\]]{8,}$/)) {
                return { 'passwordProto': true };
            } else {
                return null;
            }
        }
    }

    /**
 * Custom validator to ensure that password and confirm password fields match.
 *
 * This static method returns a ValidatorFn that validates whether the password and confirm password fields have the same value.
 * If the values do not match, it returns a validation error. Otherwise, it returns null.
 *
 * @param passwordControlName The name of the password control to validate.
 * @param confirmControlName The name of the confirm password control to validate.
 * @returns A ValidatorFn that performs the validation.
 */
    public static passwordMatch(passwordControlName: string, confirmControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const password = control.get(passwordControlName);
            const confirmPassword = control.get(confirmControlName);

            if (password && confirmPassword && !password.hasValidator(Validators.required) && !confirmPassword.hasValidator(Validators.required)) {
                if (password.value == '' && confirmPassword.value == '') {
                    return null;
                }
            }

            if (password?.value != confirmPassword?.value) {
                let errors = control?.errors;
                if (errors && typeof errors === 'object') {
                    Object.assign(errors, {
                        'passwordMatch': true
                    });
                } else {
                    errors = {
                        'passwordMatch': true
                    };
                }
                return errors;
            } else {
                let errors = control?.errors;
                if (errors && typeof errors === 'object') {
                    if (errors['passwordMatch'])
                        delete errors['passwordMatch'];
                }
                return control.errors;
            }
        }
    }
}