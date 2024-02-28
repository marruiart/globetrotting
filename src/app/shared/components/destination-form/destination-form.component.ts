import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';

@Component({
    selector: 'app-destination-form',
    templateUrl: './destination-form.component.html',
    styleUrls: ['./destination-form.component.scss'],
})
export class DestinationFormComponent {
    public form: FormGroup;

    @Input() set destination(destination: Destination | null) {
        if (destination) {
            this.form.controls['id'].setValue(destination.id);
            this.form.controls['name'].setValue(destination.name);
            this.form.controls['type'].setValue(destination.type);
            this.form.controls['dimension'].setValue(destination.dimension);
            this.form.controls['price'].setValue(destination.price ?? 0);
            this.form.controls['description'].setValue(destination.description);
        }
    }

    @Output() onDestinationFormAccepted: EventEmitter<Destination> = new EventEmitter<Destination>();

    constructor(
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            id: [null],
            name: ['', [Validators.required]],
            type: ['', [Validators.required]],
            dimension: ['', [Validators.required]],
            price: [0, [Validators.required]],
            description: ['', [Validators.required]]
        });
    }

    public onAccept(event: Event) {
        const destination: Destination = {
            id: this.form.value.id,
            name: this.form.value.name,
            type: this.form.value.type,
            dimension: this.form.value.dimension,
            price: this.form.value.price,
            description: this.form.value.description
        }
        this.onDestinationFormAccepted.emit(destination);
        event.stopPropagation();
    }

}
