import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from "@angular/core"

@Component({
	selector: "app-cards",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./app-cards.component.html"
})
export class AppCardsComponent {
	readonly apps = input<any[]>([])
}
