import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class IdentifierValidator {

    /**
 * Custom validator to ensure that either an email or a username is provided.
 *
 * This static method returns a ValidatorFn that validates whether at least one of the email or username fields is filled.
 * If both fields are empty, it returns a validation error. Otherwise, it returns null.
 *
 * @param emailControlName The name of the email control to validate.
 * @param usernameControlName The name of the username control to validate.
 * @returns A ValidatorFn that performs the validation.
 */
    public static identifierRequired(emailControlName: string, usernameControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let email = '';
            let username = '';
            if (control instanceof FormControl) {
                email = control?.value;
                username = control?.value;
            } else {
                email = control.get(emailControlName)?.value;
                username = control.get(usernameControlName)?.value;
            }

            if (!email && !username) {
                return { 'identifierRequired': true };
            } else {
                return null;
            }
        }
    }
}