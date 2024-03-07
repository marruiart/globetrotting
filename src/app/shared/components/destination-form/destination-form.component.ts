import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BatchUpdate, FormChanges } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { Backends } from 'src/app/core/utilities/utilities';
import { BACKEND } from 'src/environments/environment';

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
                        'bookings': [{ fieldPath: 'destination_id', value: destination.id, fieldName: 'destinationName' }]
                    }
                })
            }
        }
    }

    private checkValueChanges(batchUpdate: BatchUpdate, specialFieldsCallback?: (controlName: string, form: FormGroup) => (string | null)) {
        // TODO export the same in user-form
        this.batchUpdate = { ...batchUpdate };
        const initialValue = this.form.value;
        Object.entries(batchUpdate).forEach(([controlName, collections]) => {
            const formControl = this.form.controls[controlName];
            this.subsSvc.addSubscriptions(this.COMPONENT,
                formControl.valueChanges.subscribe(newFieldValue => {
                    const hasChanged = initialValue[controlName] !== newFieldValue;
                    if (hasChanged) {
                        this.hasChanged = hasChanged;
                        //const _newFieldValue = specialFieldsCallback ? specialFieldsCallback(controlName, this.form) : newFieldValue;
                        if (specialFieldsCallback) {
                            newFieldValue = specialFieldsCallback(controlName, this.form) ?? newFieldValue;
                        }
                        Object.entries(collections).forEach(([collection, updates]) => {
                            updates.map(({ fieldPath, value, fieldName, fieldValue }) => {
                                const batchUpdate = this.batchUpdate![controlName][collection];
                                this.batchUpdate![controlName][collection] = batchUpdate.map(upd => {
                                    const _fieldValue = (upd.fieldPath === fieldPath && upd.value === value && upd.fieldName === fieldName) ? newFieldValue : fieldValue;
                                    return { ...upd, fieldValue: _fieldValue };
                                })
                            })

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
