import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingForm } from 'src/app/core/models/globetrotting/booking.interface';

@Component({
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent {
    public bookingForm: FormGroup;
    @Input() emptyForm?: FormGroup;

    @Output() onBookingAccepted: EventEmitter<BookingForm> = new EventEmitter<BookingForm>();

    constructor(
        private fb: FormBuilder,
    ) {
        this.bookingForm = this.fb.group({
            travelers: [1, [
                Validators.required
            ]],
            dates: ['', [
                Validators.required
            ]]
        });
    }

    ngOnInit() {
        if (this.emptyForm) {
            this.bookingForm = this.emptyForm
        }
    }

    public onAccept(event: Event) {
        let bookingForm: BookingForm = {
            start: this.bookingForm.value.dates[0],
            end: this.bookingForm.value.dates[1],
            travelers: this.bookingForm.value.travelers
        }
        this.onBookingAccepted.emit(bookingForm);
        this.resetForm();
        event.stopPropagation();
    }

    public resetForm() {
        this.bookingForm.patchValue({
            travelers: 1,
            dates: ''
        });
    }

}
