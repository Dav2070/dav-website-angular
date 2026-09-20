import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-unavailable-page",
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: "./unavailable-page.component.html"
})
export class UnavailablePageComponent {
	readonly store = inject(PageStore)
}
