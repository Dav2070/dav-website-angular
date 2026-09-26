import { Component, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-privacy-page",
	templateUrl: "./privacy-page.component.html",
	styleUrl: "./privacy-page.component.scss"
})
export class PrivacyPageComponent {
	private readonly store = inject(PageStore)

	get locale() {
		return this.store.locale().privacyPage
	}
}
