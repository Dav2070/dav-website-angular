import { Component, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-pocketlib-terms-page",
	templateUrl: "./pocketlib-terms-page.component.html"
})
export class PocketlibTermsPageComponent {
	private readonly store = inject(PageStore)

	get locale() {
		return this.store.locale().pocketlibTermsPage
	}
}
