import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class IdentifierValidator {

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