import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingForm } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { Role, User } from 'src/app/core/models/globetrotting/user.interface';

@Component({
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent {
    public bookingForm: FormGroup = this.fb.group({});
    public selectedDestination: Destination | null = null;
    @Input() emptyForm?: FormGroup;
    @Input() destinations: Destination[] = [];

    private _currentUserType?: Role;
    @Input() set currentUserType(currentUserType: Role | undefined) {
        if (currentUserType) {
            this._currentUserType = currentUserType;
            if (this._currentUserType === 'AGENT' || this._currentUserType === 'ADMIN') {
                this.bookingForm = this.fb.group({
                    client: [null, [Validators.required]],
                    destination: [null, [Validators.required]],
                    travelers: [1, [Validators.required]],
                    dates: ['', [Validators.required]]
                });
            } else {
                this.bookingForm = this.fb.group({
                    travelers: [1, [Validators.required]],
                    dates: ['', [Validators.required]]
                });
            }
        }
    }
    get currentUserType(): Role | undefined {
        return this._currentUserType;
    }

    private _clients: User[] = [];
    @Input() set clients(clients: User[]) {
        if (clients) {
            this._clients = clients;
        }
    };
    get clients(): User[] {
        return (this._clients) ? this._clients : [];
    }

    @Output() onBookingAccepted: EventEmitter<BookingForm> = new EventEmitter<BookingForm>();

    constructor(
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        if (this.emptyForm) {
            this.bookingForm = this.emptyForm
        }
    }

    public onAccept(event: Event) {
        let bookingForm: BookingForm;
        if (this.bookingForm.value.destination && this.bookingForm.value.client) {
            bookingForm = {
                client_id: this.bookingForm.value.client,
                destination_id: this.bookingForm.value.destination.id,
                start: this.bookingForm.value.dates[0],
                end: this.bookingForm.value.dates[1],
                travelers: this.bookingForm.value.travelers
            }
        } else {
            bookingForm = {
                start: this.bookingForm.value.dates[0],
                end: this.bookingForm.value.dates[1],
                travelers: this.bookingForm.value.travelers
            }
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
