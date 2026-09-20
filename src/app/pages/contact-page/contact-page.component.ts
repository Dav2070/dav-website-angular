import { Component, inject } from "@angular/core"
import { PageStore } from "../../page-data"

@Component({
	selector: "app-contact-page",
	templateUrl: "./contact-page.component.html",
	styleUrl: "./contact-page.component.scss"
})
export class ContactPageComponent {
	readonly store = inject(PageStore)
}
