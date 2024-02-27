import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingForm } from 'src/app/core/models/globetrotting/booking.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { User } from 'src/app/core/models/globetrotting/user.interface';
import { Roles, getUserName } from 'src/app/core/utilities/utilities';

@Component({
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent {
    public bookingForm: FormGroup = this.fb.group({});
    @Input() emptyForm?: FormGroup;
    @Input() destinations: Destination[] = [];

    private _currentUser: User | null = null;
    @Input() set currentUser(currentUser: User | null) {
        if (currentUser) {
            this._currentUser = currentUser;
            if (currentUser.role === Roles.AGENT || currentUser.role === Roles.ADMIN) {
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
    get currentUser(): User | null {
        return this._currentUser;
    }

    private _selectedDestination: Destination | null = null;
    @Input() set selectedDestination(selectedDestination: Destination | null) {
        if (selectedDestination) {
            this._selectedDestination = selectedDestination;
        }
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
        const values = this.bookingForm.value;
        let bookingForm!: BookingForm;
        if (this._currentUser) {
            if (values.client) {
                bookingForm = {
                    start: values.dates[0],
                    end: values.dates[1],
                    travelers: values.travelers,
                    isActive: true,
                    isConfirmed: false,
                    agent_id: this._currentUser.specific_id,
                    agentName: getUserName(this._currentUser),
                    client_id: values.client.specific_id,
                    clientName: getUserName(values.client),
                    destination_id: values.destination.id,
                    destinationName: values.destination.name
                }
            } else if (this._selectedDestination) {
                bookingForm = {
                    start: values.dates[0],
                    end: values.dates[1],
                    travelers: values.travelers,
                    isActive: true,
                    isConfirmed: false,
                    client_id: this._currentUser.specific_id ?? this._currentUser.user_id,
                    clientName: getUserName(this._currentUser),
                    destination_id: this._selectedDestination.id,
                    destinationName: this._selectedDestination.name
                }
            }
            if (bookingForm) {
                this.onBookingAccepted.emit(bookingForm);
            }
        }
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
