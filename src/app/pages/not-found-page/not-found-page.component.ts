import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-not-found-page",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./not-found-page.component.html"
})
export class NotFoundPageComponent {
	readonly store = inject(PageStore)
}
