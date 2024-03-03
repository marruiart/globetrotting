import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { BACKEND } from 'src/environments/environment';
import { Backends } from 'src/app/core/utilities/utilities';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { BatchUpdate, FormChanges } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';

@Component({
    selector: 'app-destination-form',
    templateUrl: './destination-form.component.html',
    styleUrls: ['./destination-form.component.scss'],
})
export class DestinationFormComponent implements OnDestroy {
    private readonly COMPONENT = 'DestinationFormComponent';

    private batchUpdate: BatchUpdate | null = null;
    private hasChanged: boolean = false;
    public form: FormGroup;

    @Input() set destination(destination: Destination | null) {
        if (destination) {
            this.form.controls['id'].setValue(destination.id);
            this.form.controls['name'].setValue(destination.name);
            this.form.controls['type'].setValue(destination.type);
            this.form.controls['dimension'].setValue(destination.dimension);
            this.form.controls['coordinate'].setValue(destination.coordinate);
            this.form.controls['price'].setValue(destination.price ?? 0);
            this.form.controls['description'].setValue(destination.description ?? '');
            if (BACKEND === Backends.FIREBASE) {
                // TODO add password change
                this.checkValueChanges({
                    'name': {
                        'bookings': { fieldPath: 'destination_id', value: destination.id, fieldName: 'destinationName' }
                    }
                })
            }
        }
    }

    private checkValueChanges(batchUpdate: BatchUpdate) {
        this.batchUpdate = { ...batchUpdate };
        const initialValue = this.form.value;
        Object.entries(batchUpdate).forEach(([controlName, collections]) => {
            const formControl = this.form.controls[controlName];
            this.subsSvc.addSubscriptions(this.COMPONENT,
                formControl.valueChanges.subscribe(fieldValue => {
                    const hasChanged = initialValue[controlName] !== fieldValue;
                    if (hasChanged) {
                        this.hasChanged = hasChanged;
                        Object.entries(collections).forEach(([collection, updates]) => {
                            this.batchUpdate![controlName][collection] = { ...updates, fieldValue }
                        })
                    }
                }))
        })
    }

    @Output() onDestinationFormAccepted: EventEmitter<Destination> = new EventEmitter<Destination>();

    constructor(
        private fb: FormBuilder,
        private subsSvc: SubscriptionsService
    ) {
        this.form = this.fb.group({
            id: [null],
            name: ['', [Validators.required]],
            type: ['', [Validators.required]],
            dimension: ['', [Validators.required]],
            coordinate: [{ lat: 0, lgn: 0 }, [Validators.required]],
            price: [0, [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    public onAccept(event: Event) {
        const destination: Destination & FormChanges = {
            id: this.form.value.id,
            name: this.form.value.name,
            type: this.form.value.type,
            dimension: this.form.value.dimension,
            coordinate: this.form.value.coordinate,
            price: this.form.value.price,
            description: this.form.value.description,
            updates: this.hasChanged ? this.batchUpdate : null
        }
        this.onDestinationFormAccepted.emit(destination);
        event.stopPropagation();
    }

    ngOnDestroy(): void {
        this.subsSvc.unsubscribe(this.COMPONENT);
    }

}
